import { useEffect, useState, useRef, type ReactElement } from "react";
import { Button, Container, Modal, Form, Table } from "react-bootstrap";
import { getCourses, createCourse, updateCourse, deleteCourse } from "../../../../shared/api/settings";
import { useTranslation } from "react-i18next";
import "../../styles/CourseSettings.css";

type Course = {
  course_id: string;
  course_name: string;
  course_name_en: string;
};

export default function CourseSettings(): ReactElement {
  const { t } = useTranslation('courseSettings');
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [courses, setCourses] = useState<Course[]>([]);

  // 編集対象のコース情報
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // useRefで参照を作成
  const courseNameRef = useRef<HTMLInputElement>(null);
  const courseNameEnRef = useRef<HTMLInputElement>(null);

  // コース一覧取得
  const fetchCourses = async () => {
    try {
      const response = await getCourses();
      setCourses(response.data || []);
    } catch (error) {
      console.error("コースデータの取得に失敗しました:", error);
      setCourses([]); // エラー時も空配列をセット
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // 編集モーダル表示
  const handleUpdateModal = (course: Course) => {
    setModalMode("update");
    setSelectedCourse(course);
    // useRefの値をセット
    if (courseNameRef.current) courseNameRef.current.value = course.course_name;
    if (courseNameEnRef.current) courseNameEnRef.current.value = course.course_name_en;
    setShowModal(true);
  };

  // 作成モーダル表示
  const handleCreateModal = () => {
    setModalMode("create");
    setSelectedCourse(null);
    // useRefの値をクリア
    if (courseNameRef.current) courseNameRef.current.value = "";
    if (courseNameEnRef.current) courseNameEnRef.current.value = "";
    setShowModal(true);
  };

  // モーダルを閉じる
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // コース削除
  const handleDelete = async (course_id: string) => {
    if (!window.confirm(t('delete_confirm'))) return;
    try {
      await deleteCourse(course_id);
      alert(t('delete_success'));
      await fetchCourses();
    } catch (error) {
      console.error("削除に失敗しました:", error);
      alert(t('delete_failed'));
    }
  };

  // 保存（作成・更新）処理
  const handleSave = async () => {
    const courseName = courseNameRef.current?.value || "";
    const courseNameEn = courseNameEnRef.current?.value || "";

    if (!courseName || !courseNameEn) {
      alert(t('edit_modal_empty'));
      return;
    }

    try {
      if (modalMode === "create") {
        await createCourse([{ course_name: courseName, course_name_en: courseNameEn }]);
        alert(t('create_success'));
      } else {
        // 更新処理
        if (!selectedCourse) return;
        await updateCourse(selectedCourse.course_id, courseName, courseNameEn);
        alert(t('update_success'));
      }
      setShowModal(false);
      await fetchCourses();
    } catch (error) {
      alert(t('save_failed'));
    }
  };

  interface EditModalProps {
  showModal: boolean;
  handleCloseModal: () => void;
  modalMode: "create" | "update";
}

  function EditModal(props: EditModalProps) {
    const { showModal, handleCloseModal, modalMode } = props;

    return (
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{modalMode === 'create' ? t('modal_title_create') : t('edit_modal_title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{t('edit_modal_course_name')}</Form.Label>
              <Form.Control
                type="text"
                ref={courseNameRef}
                placeholder={t('course_name_placeholder')}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('edit_modal_course_name_en')}</Form.Label>
              <Form.Control
                type="text"
                ref={courseNameEnRef}
                placeholder={t('course_name_en_placeholder')}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>{t('edit_modal_close')}</Button>
          <Button variant="primary" onClick={handleSave}>{t('edit_modal_save')}</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  // 一覧表示コンポーネント
  const CourseTable = () => (
    <Table striped bordered hover style={{ marginTop: "30px" }}>
      <thead>
        <tr>
          <th>{t('edit_modal_course_name')}</th>
          <th>{t('edit_modal_course_name_en')}</th>
          <th>{t('actions')}</th>
        </tr>
      </thead>
      <tbody>
        {courses.map((course) => (
          <tr key={course.course_id}>
            <td>{course.course_name}</td>
            <td>{course.course_name_en}</td>
            <td>
              <Button variant="secondary" size="sm" onClick={() => handleUpdateModal(course)}>
                {t('edit')}
              </Button>
              <Button variant="danger" size="sm" className="ms-2" onClick={() => handleDelete(course.course_id)}>
                {t('delete')}
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <Container className="common">
      <h3>{t('title')}</h3>
      <Button variant="primary" onClick={handleCreateModal}>
        {t('add_course')}
      </Button>
      <CourseTable />
      <EditModal
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        modalMode={modalMode}
      />
    </Container>
  );
}
