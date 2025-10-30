import { useEffect, useState, type ReactElement } from "react";
import { Button, Container, Modal, Form, Table } from "react-bootstrap";
import { getClasses, getTeachers } from "../../../../shared/api/common";
import {
  createClass,
  deleteClass,
  updateClass
} from "../../../../shared/api/settings";
import { useTranslation } from "react-i18next";
import "../../styles/ClassSettings.css";
import "../../styles/SettingsComponent.css"

type Teachers = {
  teacher_id: string;
  manager: boolean;
};

type Classes = {
  teacher_id: string;
  grade: string;
  class: string;
};

export default function StudentSettings(): ReactElement {
  const { t } = useTranslation('classSettings');
  const [modalMode, setModalMode] = useState<"create" | "update">("update");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [teachers, setTeachers] = useState<Teachers[]>([]);
  const [classes, setClasses] = useState<Classes[]>([]);

  // 編集対象の教室情報
  const [selectedClass, setSelectedClass] = useState<Classes | null>(null);

  // 入力値（新しい値）
  const [grade, setGrade] = useState<number>(1);
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [inputClass, setInputClass] = useState<string>("");
  const [inputGroupType, setInputGroupType] = useState<"number" | "alphabet" | "text">("number");
  const [inputAlphabet, setInputAlphabet] = useState<string>("A");
  const [inputNumber, setInputNumber] = useState<number>(1);

  // 教室作成
  const handleCreateClass = async () => {
    let classValue = "";
    if (inputGroupType === "number") classValue = String(inputNumber);
    else if (inputGroupType === "alphabet") classValue = inputAlphabet;
    else classValue = inputClass;

    if (!selectedTeacher || !grade || !classValue) {
      alert(t('edit_modal_empty'));
      return;
    }
    try {
      await createClass(selectedTeacher, String(grade), classValue);
      setShowModal(false);
      await fetchClasses();
    } catch (error) {
      console.error("作成に失敗しました:", error);
      alert("作成に失敗しました");
    }
  };

  // 教室更新
  const handleUpdateClass = async () => {
    if (!selectedClass) return;

    let updatedClassValue = "";
    if (inputGroupType === "number") updatedClassValue = String(inputNumber);
    else if (inputGroupType === "alphabet") updatedClassValue = inputAlphabet;
    else updatedClassValue = inputClass;

    if (!selectedTeacher || !grade || !updatedClassValue) {
      alert(t('edit_modal_empty'));
      return;
    }

    try {
      await updateClass(
        selectedClass.grade,        // 元の学年
        selectedClass.class,        // 元の組
        String(grade),              // 新しい学年
        updatedClassValue,          // 新しい組
        selectedTeacher             // 新しい担任
      );
      alert(t('update_success'));
      setShowModal(false);
      await fetchClasses();
    } catch (error) {
      console.error("更新に失敗しました:", error);
      alert(t('update_failed'));
    }
  };

  // 編集モーダル表示
  const handleUpdateModal = (classes: Classes) => {
    setModalMode("update");
    setSelectedClass(classes);
    setGrade(Number(classes.grade));
    setSelectedTeacher(classes.teacher_id);
    setInputClass(classes.class);
    setInputGroupType(isNaN(Number(classes.class)) ? "alphabet" : "number");
    setInputNumber(isNaN(Number(classes.class)) ? 1 : Number(classes.class));
    setInputAlphabet(/^[A-Z]$/.test(classes.class) ? classes.class : "A");
    setShowModal(true);
  };

  // 作成モーダル表示
  const handleCreateModal = () => {
    setModalMode("create");
    setSelectedClass(null);
    setGrade(1);
    setSelectedTeacher("");
    setInputClass("");
    setInputGroupType("number");
    setInputNumber(1);
    setInputAlphabet("A");
    setShowModal(true);
  };

  // 教室削除
  const handleDeleteClass = async (grade: string, className: string) => {
    if (!window.confirm(t('delete_confirm'))) return;
    try {
      const response: any = await deleteClass(grade, className);

      if(response.data.result !== "SUCCESS") alert(t('delete_failed'));
      await fetchClasses();
    } catch (error) {
      console.error("削除に失敗しました:", error);
      alert(t('delete_failed'));
    }
  };

  // 担任取得
  const fetchTeachers = async () => {
    try {
      const jsonTeachers = await getTeachers();
      const convertTeachers: Teachers[] = jsonTeachers.data.map(
        (teacher: Teachers) => ({
          teacher_id: teacher.teacher_id,
          manager: teacher.manager,
        })
      );
      setTeachers(convertTeachers);
    } catch (error) {
      console.error("教師データの取得に失敗しました:", error);
    }
  };

  // 教室取得
  const fetchClasses = async () => {
    try {
      const jsonClasses = await getClasses();
      const convertClasses: Classes[] = jsonClasses.data.map(
        (classes: Classes) => ({
          teacher_id: classes.teacher_id,
          grade: classes.grade,
          class: classes.class,
        })
      );
      setClasses(convertClasses);
    } catch (error) {
      console.error("クラスデータの取得に失敗しました:", error);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  // モーダル
  const EditModal = () => (
    <Modal show={showModal} onHide={() => setShowModal(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>{t('modal_title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>{t('homeroom_teacher')}</Form.Label>
            <Form.Select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
            >
              <option value="">{t('select_placeholder')}</option>
              {teachers.map((teacher, idx) => (
                <option key={idx} value={teacher.teacher_id}>
                  {teacher.teacher_id}
                  {teacher.manager ? t('manager') : ""}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t('grade')}</Form.Label>
            <Container className="input-items">
              <Button
                variant="outline-secondary"
                size="sm"
                className="px-2"
                onClick={() => grade < 10 && setGrade(grade + 1)}
              >
                ↑
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                className="px-2"
                onClick={() => grade > 1 && setGrade(grade - 1)}
              >
                ↓
              </Button>
              <Form.Control
                className="display-grade"
                value={grade + (t('grade') === 'Grade' ? '' : '年')}
                disabled
              />
            </Container>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t('class')}</Form.Label>
            <Container className="input-items">
              <Form.Select
                className="sort-selecter"
                size="sm"
                value={inputGroupType}
                onChange={(e) =>
                  setInputGroupType(
                    e.target.value as "number" | "alphabet" | "text"
                  )
                }
              >
                <option value="number">{t('number_order')}</option>
                <option value="alphabet">{t('alphabet_order')}</option>
                <option value="text">{t('free_input')}</option>
              </Form.Select>
              {inputGroupType === "number" && (
                <>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="class-settings-input"
                    onClick={() =>
                      inputNumber < 19 && setInputNumber(inputNumber + 1)
                    }
                  >
                    ↑
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="class-settings-input"
                    onClick={() =>
                      inputNumber > 1 && setInputNumber(inputNumber - 1)
                    }
                  >
                    ↓
                  </Button>
                  <Form.Control
                    className="class-settings-input"
                    value={inputNumber}
                    disabled
                    readOnly
                  />
                </>
              )}
              {inputGroupType === "alphabet" && (
                <>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="class-settings-input"
                    onClick={() => {
                      const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
                      const idx = alphabets.indexOf(inputAlphabet);
                      if (idx < alphabets.length - 1)
                        setInputAlphabet(alphabets[idx + 1]);
                    }}
                  >
                    ↑
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="class-settings-input"
                    onClick={() => {
                      const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
                      const idx = alphabets.indexOf(inputAlphabet);
                      if (idx > 0) setInputAlphabet(alphabets[idx - 1]);
                    }}
                  >
                    ↓
                  </Button>
                  <Form.Control
                    className="class-settings-input"
                    value={inputAlphabet}
                    disabled
                    readOnly
                  />
                </>
              )}
              {inputGroupType === "text" && (
                <Form.Control
                  className="class-settings-input"
                  value={inputClass}
                  onChange={(e) => setInputClass(e.target.value)}
                  placeholder={t('class_placeholder')}
                />
              )}
            </Container>
          </Form.Group>
          <div style={{ textAlign: "right" }}>
            {modalMode === "create" ? (
              <Button variant="primary" onClick={handleCreateClass}>
                {t('create_button')}
              </Button>
            ) : (
              <Button variant="success" onClick={handleUpdateClass}>
                {t('update_button')}
              </Button>
            )}
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );

  // 教室一覧表示
  const showClasses = () => (
    <Table striped bordered className="common" style={{ marginTop: "30px"}}>
      <thead>
        <tr>
          <th className="class-labels">{t('teacher_id')}</th>
          <th className="class-labels">{t('grade')}</th>
          <th className="class-labels">{t('class')}</th>
          <th className="class-labels actions">{t('actions')}</th>
        </tr>
      </thead>
      <tbody>
        {classes.map((classes: Classes, index: number) => (
          <tr key={index}>
            <td className="class-labels">{classes.teacher_id}</td>
            <td className="class-labels">{classes.grade}</td>
            <td className="class-labels actions">{classes.class}</td>
            <td className="class-labels">
              <Button
                id="delete-button"
                className="classe-action-button"
                variant="danger"
                onClick={() =>
                  handleDeleteClass(classes.grade, classes.class)
                }
              >
                {t('delete')}
              </Button>
              <Button
                id="edit-button"
                className="classe-action-button"
                variant="secondary"
                onClick={() => handleUpdateModal(classes)}
              >
                {t('edit')}
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <div className="common">
      <Container>
        <h3>{t('title')}</h3>
        <Button variant="primary" onClick={handleCreateModal}>
          {t('create_class')}
        </Button>
      </Container>
      <Container>{showClasses()}</Container>
      {EditModal()}
    </div>
  );
}