import "../../styles/TeacherSettings.css";
import { useEffect, useState, useRef, type ReactElement } from "react";
import { getTeachers, whoami } from "../../../../shared/api/common";
import { createTeacher, updateTeacher, deleteTeacher } from "../../../../shared/api/settings";
import { type Teacher, type EditTeacher } from "../../../../shared/utils/type";
import {
  Container,
  Button,
  Table,
  Spinner,
  Modal,
  Form,
  Alert,
  ToggleButton
} from "react-bootstrap";
import { useTranslation } from "react-i18next";

const TeacherSettings = (): ReactElement => {
  const { t } = useTranslation("teacherSettings");

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isShowModal, setShowModal] = useState<boolean>(false);
  const [isManager, setManager] = useState<boolean | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [managerCheck, setManagerCheck] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  const teacherIdRef = useRef<HTMLInputElement>(null);
  const teacherPasswordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkManager = async () => {
      const fetchedTeacher = await whoami();
      setManager(fetchedTeacher.data.manager === 1 ? true : false);
    };

    const fetchTeachers = async () => {
      const fetchedTeachres: any = await getTeachers();
      setTeachers(fetchedTeachres.data);
    };
    fetchTeachers();
    checkManager();
  }, []);

  useEffect(() => {
    if (isShowModal && selectedTeacher && teacherIdRef.current) {
      teacherIdRef.current.value = selectedTeacher.teacher_id;
      setManagerCheck(selectedTeacher.manager);
    } else if (isShowModal && !selectedTeacher) {
      setManagerCheck(false);
    }
  }, [isShowModal, selectedTeacher]);

  const LoadingSpinner = () => {
    return <Spinner animation="grow" variant="primary" />;
  };

  const handleSave = async () => {
    const password = teacherPasswordRef.current?.value || "";
    const confirmPassword = confirmPasswordRef.current?.value || "";

    if (password !== confirmPassword) {
      alert(t("password_mismatch"));
      return;
    }

    try {
      if (modalMode === "create") {
        const teacher = await whoami();
        const data: EditTeacher = {
          tenant_id: teacher.data.tenant_id,
          teacher_id: teacherIdRef.current?.value || "",
          teacher_password: password,
          manager: managerCheck
        };
        await createTeacher(data);
      } else if (selectedTeacher) {
        const updateData = {
          password: password || undefined,
          manager: managerCheck
        };
        await updateTeacher(selectedTeacher.teacher_id, updateData);
      }
      
      setShowModal(false);
      const fetchedTeachers = await getTeachers();
      setTeachers(fetchedTeachers.data);
    } catch (error) {
      console.error("Teacher save failed:", error);
    }
  }

  const handleDelete = async (teacher: Teacher) => {
    if(confirm(t('delete_confirm')) === false) return;
    
    const response: any = await deleteTeacher(teacher.teacher_id);
    if(response.result != 'SUCCESS') alert(t('delete_failed'));
    else alert(t('delete_success'));

    const fetchedTeachers = await getTeachers();
    setTeachers(fetchedTeachers.data);
  }

  const handleCsvUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r\n|\n/).slice(1); // ヘッダーをスキップ

      const teachers = lines
        .map((line) => {
          const [teacher_id, password, manager] = line.split(",").map((s) => s.trim());
          
          if (!teacher_id || !password) {
            console.warn("Invalid line:", line);
            return null;
          }

          return {
            teacher_id,
            password,
            manager: manager === "1" || manager.toLowerCase() === "true"
          };
        })
        .filter((t): t is { teacher_id: string; password: string; manager: boolean } => t !== null);

      if (teachers.length > 0) {
        try {
          if (confirm(t('bulk_upload_confirm'))) {
            const currentUser = await whoami();
            for (const teacher of teachers) {
              const data: EditTeacher = {
                tenant_id: currentUser.data.tenant_id,
                teacher_id: teacher.teacher_id,
                teacher_password: teacher.password,
                manager: teacher.manager
              };
              await createTeacher(data);
            }
            alert(t('bulk_create_success', { count: teachers.length }));
            const fetchedTeachers = await getTeachers();
            setTeachers(fetchedTeachers.data);
          }
        } catch (error) {
          alert(t('bulk_create_failed'));
          console.error(error);
        }
      } else {
        alert(t('no_valid_data'));
      }
    };

    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const EditModal = () => {
    return (
      <Modal show={isShowModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{modalMode === "create" ? t("modal_create_title") : t('modal_edit_title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>{t("teacher_id")}</Form.Label>
              <Form.Control ref={teacherIdRef} disabled={modalMode === "edit"} />
            </Form.Group>
            <Form.Group>
              <Form.Label>{modalMode === "edit" ? t("new_password") : t("teacher_password")}</Form.Label>
              <Form.Control type="password" ref={teacherPasswordRef} placeholder={modalMode === "edit" ? t("password_placeholder") : ""} />
            </Form.Group>
            <Form.Group>
              <Form.Label>{t("teacher_confirm_password")}</Form.Label>
              <Form.Control type="password" ref={confirmPasswordRef} />
            </Form.Group>
            <Form.Group id="teacher-manager-checkbox">
              <Form.Label>{t("teacher_manager")}</Form.Label>
              <br></br>
              <ToggleButton
                className="mb-2"
                id="toggle-check"
                type="checkbox"
                variant="outline-primary"
                checked={managerCheck}
                value="1"
                onChange={(e) => setManagerCheck(e.currentTarget.checked)}
              >
                {managerCheck === true ? t('teacher_manager'): t('teacher_non_manager')}
              </ToggleButton>
            </Form.Group>
            <Button onClick={handleSave}>{t("save")}</Button>
          </Form>
        </Modal.Body>
      </Modal>
    );
  };

  const handleUpdateShowModal = (teacher: Teacher) => {
    setModalMode("edit");
    setSelectedTeacher(teacher);
    setShowModal(true);
  };

  const handleCreateShowModal = () => {
    setModalMode("create");
    setSelectedTeacher(null);
    setShowModal(true);
  };

  const Tables = () =>
    teachers == null ? (
      <LoadingSpinner />
    ) : (
      teachers?.map((teacher) => {
        return (
          <tbody>
            <tr>
              <td>
                <p className="teacher-id">
                  {teacher.teacher_id} {teacher.manager ? t("manager") : ""}
                </p>
              </td>
              <td>
                <Button
                  onClick={() => handleUpdateShowModal(teacher)}
                  className="action-button"
                  variant="secondary"
                >
                  {t("edit")}
                </Button>
                <Button onClick={() => handleDelete(teacher)} className="action-button" variant="danger">
                  {t("delete")}
                </Button>
              </td>
            </tr>
          </tbody>
        );
      })
    );

  return isManager != true ? (
    <Alert className="disable-controll" variant="danger">
      {t("no_permission")}
    </Alert>
  ) : (
    <Container className="common">
      <h3>{t("title")}</h3>
      <Container>
        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <div className="teacher-button-group">
          <Button variant="outline-secondary" onClick={handleCsvUpload}>
            {t("csv_bulk_upload")}
          </Button>
          <Button variant="primary" onClick={handleCreateShowModal}>
            {t("add_teacher")}
          </Button>
        </div>
        <Table className="teacher-table">
          <thead>
            <tr>
              <th className="table-headers">{t("teacher_id")}</th>
              <th className="table-headers">{t("actions")}</th>
            </tr>
          </thead>
          <Tables />
        </Table>
      </Container>
      {EditModal()}
    </Container>
  );
};

export default TeacherSettings;
