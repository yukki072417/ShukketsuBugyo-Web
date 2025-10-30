import { useEffect, useState, useRef } from "react";
import { Container, Table, Button, Modal, Form, Alert } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { type Lesson, type Teacher } from "../../../shared";
import {
  createLesson,
  getLessons,
  updateLesson,
  deleteLesson,
  type CreateLesson,
} from "../../../shared/api/lessons";
import { getTeachers, getClasses } from "../../../shared/api/common";
import "../styles/lessons.css";
import { useNavigate } from "react-router-dom";

const Lessons = () => {
  const { t } = useTranslation("lesson");
  const navigate = useNavigate();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [modalTeacherId, setModalTeacherId] = useState<string>("");
  const [modalGrade, setModalGrade] = useState<string>("");

  const [showModal, setShowModal] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const lessonNameRef = useRef<HTMLInputElement>(null);
  const lessonNameEnRef = useRef<HTMLInputElement>(null);
  const teacherIdRef = useRef<HTMLSelectElement>(null);
  const gradeRef = useRef<HTMLSelectElement>(null);

  const fetching = async (): Promise<void> => {
    const fechedLessons: any = await getLessons();
    const fetchTeachers: any = await getTeachers();
    const fetchClasses: any = await getClasses();

    if (fetchClasses.data.length > 0) {
      const classes: string[] = fetchClasses.data.map((item: any) => {
        return item.grade;
      });
      const uniqueClasses: string[] = [...new Set(classes)];
      setGrades(uniqueClasses);
    }

    setTeachers(fetchTeachers.data);
    setLessons(fechedLessons);
    setFilteredLessons(fechedLessons);
  };

  useEffect(() => {
    fetching();
  }, []);

  useEffect(() => {
    if (selectedGrade === "all") {
      setFilteredLessons(lessons);
    } else {
      setFilteredLessons(lessons.filter(lesson => lesson.grade === selectedGrade));
    }
  }, [lessons, selectedGrade]);

  const handleGradeFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGrade(e.target.value);
  };

  useEffect(() => {
    if (showModal && selectedLesson && modalMode === "edit") {
      if (lessonNameRef.current) lessonNameRef.current.value = selectedLesson.lesson_name;
      if (lessonNameEnRef.current) lessonNameEnRef.current.value = selectedLesson.lesson_name_en;
      setModalTeacherId(selectedLesson.teacher_id);
      setModalGrade(selectedLesson.grade);
    } else if (showModal && modalMode === "create") {
      if (lessonNameRef.current) lessonNameRef.current.value = "";
      if (lessonNameEnRef.current) lessonNameEnRef.current.value = "";
      setModalTeacherId(teachers.length > 0 ? teachers[0].teacher_id : "");
      setModalGrade(grades.length > 0 ? grades[0] : "");
    }
  }, [showModal, selectedLesson, modalMode, teachers, grades]);

  const EditModal = () => {
    return (
      <Modal centered show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === "create"
              ? t("modal_title_create")
              : t("modal_title_edit")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label className="mt-2">{t("teacher_id")}</Form.Label>
              <Form.Select
                ref={teacherIdRef}
                value={modalTeacherId}
                onChange={(e) => {
                  setModalTeacherId(e.target.value);
                  if (teacherIdRef.current)
                    teacherIdRef.current.value = e.target.value;
                }}
              >
                {teachers.map((teacher: Teacher, idx: number) => {
                  return (
                    <option key={idx} value={teacher.teacher_id}>
                      {teacher.teacher_id}{" "}
                      {teacher.manager ? `(${t("admin")})` : ""}
                    </option>
                  );
                })}
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label className="mt-2">{t("grade")}</Form.Label>
              <Form.Select
                ref={gradeRef}
                value={modalGrade}
                onChange={(e) => {
                  setModalGrade(e.target.value);
                  if (gradeRef.current) gradeRef.current.value = e.target.value;
                }}
              >
                {grades.map((grade: string, idx: number) => {
                  return (
                    <option key={idx} value={grade}>
                      {grade}
                    </option>
                  );
                })}
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label className="mt-2">{t("lesson_name")}</Form.Label>
              <Form.Control 
                ref={lessonNameRef}
                defaultValue={modalMode === "edit" && selectedLesson ? selectedLesson.lesson_name : ""}
              ></Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label className="mt-2">{t("lesson_name_en")}</Form.Label>
              <Form.Control 
                ref={lessonNameEnRef}
                defaultValue={modalMode === "edit" && selectedLesson ? selectedLesson.lesson_name_en : ""}
              ></Form.Control>
            </Form.Group>
            <Form.Group>
              <Button
                onClick={handleSave}
                variant="primary"
                className="mt-2 create-lesson-btn"
              >
                {modalMode === "create" ? t("create_lesson") : t("update_lesson")}
              </Button>
            </Form.Group>
          </Form>
        </Modal.Body>
      </Modal>
    );
  };

  const handleEditShowModal = (lesson: Lesson) => {
    setModalMode("edit");
    setSelectedLesson(lesson);
    setShowError(false);
    setShowModal(true);
  };

  const handleCreateModal = () => {
    setModalMode("create");
    setSelectedLesson(null);
    setShowError(false);
    setShowModal(true);
  };

  const handleShowStatistics = (lesson: Lesson) => {
    navigate(`/teacher/main/lessons/attendance?${lesson.lesson_id}`);

  }

  const handleSave = async () => {
    setShowModal(false);
    const lessonName: string = lessonNameRef.current?.value || "";
    const lessonNameEn: string = lessonNameEnRef.current?.value || "";
    const teacherId: string = modalTeacherId;
    const grade: string = modalGrade;

    try {
      if (modalMode === "create") {
        const data: CreateLesson = {
          teacher_id: teacherId,
          lesson_name: lessonName,
          lesson_name_en: lessonNameEn,
          grade: grade,
        };
        const response = await createLesson(data);
        if (response.result != "SUCCESS") setShowError(true);
        else {
          await fetching();
        }
      } else if (modalMode === "edit" && selectedLesson) {
        const updateData: Lesson = {
          ...selectedLesson,
          lesson_name: lessonName,
          lesson_name_en: lessonNameEn,
          teacher_id: teacherId,
          grade: grade,
        };
        await updateLesson(updateData);
        await fetching();
      }
    } catch (error) {
      setShowError(true);
    }
  };

  const handleDelete = async (lesson: Lesson) => {
    if (confirm(t("delete_confirm"))) {
      try {
        await deleteLesson(lesson);
        await fetching();
      } catch (error) {
        setShowError(true);
      }
    }
  };

  return (
    <>
      <Container>
        <h2>{t("lessons_title")}</h2>
        <div className="d-flex justify-content-between align-items-center my-3">
          <div>
            <Form.Label className="me-2">{t("filter_by_grade")}</Form.Label>
            <Form.Select 
              value={selectedGrade} 
              onChange={handleGradeFilter}
              style={{ width: "150px", display: "inline-block" }}
            >
              <option value="all">{t("all_grades")}</option>
              {grades.map((grade: string, idx: number) => (
                <option key={idx} value={grade}>{grade}</option>
              ))}
            </Form.Select>
          </div>
          <Button onClick={handleCreateModal}>
            {t("create_new")}
          </Button>
        </div>
        {showError === true && (
          <Alert variant="danger">{t("create_failed")}</Alert>
        )}
        <Table bordered>
          <thead>
            <tr>
              <th>{t("lesson_name")}</th>
              <th>{t("lesson_name_en")}</th>
              <th>{t("grade")}</th>
              <th>{t("teacher")}</th>
              <th>{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredLessons.length > 0 &&
              filteredLessons.map((lesson: Lesson, idx: number) => {
                return (
                  <tr key={idx}>
                    <td>{lesson.lesson_name}</td>
                    <td>{lesson.lesson_name_en}</td>
                    <td>{lesson.grade}</td>
                    <td>{lesson.teacher_id}</td>
                    <td>
                      <Button
                        variant="primary"
                        onClick={() => handleShowStatistics(lesson)}
                        className="mx-1"
                      >
                        {t("attendance")}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleEditShowModal(lesson)}
                        className="mx-1"
                      >
                        {t("edit")}
                      </Button>
                      <Button
                        variant="danger"
                        className="mx-1"
                        onClick={() => handleDelete(lesson)}
                      >
                        {t("delete")}
                      </Button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </Table>
        <EditModal />
      </Container>
    </>
  );
};

export default Lessons;
