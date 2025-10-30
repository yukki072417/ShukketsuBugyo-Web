import { useState, useEffect, useRef } from "react";
import { Modal, Table, Button, Form, ListGroup } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import "../styles/EnrollmentModal.css";

import { getLesson, type Lesson } from "../../../shared";

interface LessonProps {
  lessonID: string;
  show: boolean | undefined;
  onHide: () => void | undefined;
}

type EnrollmentedStudent = {
  enrollment_id: string;
  student_id: string;
  student_number: string;
  grade: string;
  class: string;
  isNew?: boolean;
  isEditing?: boolean;
};

type StudentSuggestion = {
  student_id: string;
  grade: string;
  class: string;
  number: number;
  course_id: string | null;
};

const EnrollmentModal: React.FC<LessonProps> = ({ lessonID, show, onHide }) => {
  if (lessonID == null || show == null || onHide == null) return <></>;

  const { t } = useTranslation("timetable");
  const [lesson, setLesson] = useState<Lesson>();

  const [enrollmentedStudents, setEnrollmentStudents] = useState<
    EnrollmentedStudent[]
  >([]);

  const [studentSuggestions, setStudentSuggestions] = useState<
    StudentSuggestion[]
  >([]);
  const [classroomStudents, setClassroomStudents] = useState<
    StudentSuggestion[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(
    new Set()
  );
  const suggestionRef = useRef<HTMLDivElement>(null);

  async function fetchEnrollments() {
    try {
      const response = await fetch(`http://localhost:3000/api/enrollment/lesson/${lessonID}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.result === "SUCCESS" && Array.isArray(data.data)) {
          // 各生徒の詳細情報を取得
          const enrollmentPromises = data.data.map(async (enrollment: any) => {
            try {
              const studentResponse = await fetch(
                `http://localhost:3000/api/student/one/${enrollment.student_id}`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              if (studentResponse.ok) {
                const studentData = await studentResponse.json();
                if (studentData.result === "SUCCESS") {
                  return {
                    enrollment_id: enrollment.enrollment_id,
                    student_id: studentData.data.student_id,
                    student_number: studentData.data.number.toString(),
                    grade: studentData.data.grade,
                    class: studentData.data.class,
                  };
                }
              }
              return null;
            } catch (error) {
              console.error(
                `Failed to fetch student ${enrollment.student_id}:`,
                error
              );
              return null;
            }
          });

          const enrolledStudents = (
            await Promise.all(enrollmentPromises)
          ).filter(
            (student): student is EnrollmentedStudent => student !== null
          );

          setEnrollmentStudents(enrolledStudents);
        }
      }
    } catch (error) {
      console.error("Failed to fetch enrollments:", error);
    }
  }

  useEffect(() => {
    async function fetchLesson() {
      const fetchedLesson: any = await getLesson(lessonID);

      if (fetchedLesson.data == null) return;
      else setLesson(fetchedLesson.data);
    }

    if (show) {
      fetchLesson();
      fetchEnrollments();
    }
  }, [lessonID, show]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAddNewRow = () => {
    const newStudent: EnrollmentedStudent = {
      enrollment_id: "",
      student_id: "",
      student_number: "",
      grade: "",
      class: "",
      isNew: true,
      isEditing: true,
    };
    setEnrollmentStudents([...enrollmentedStudents, newStudent]);
    setEditingIndex(enrollmentedStudents.length);
  };

  const fetchClassroomStudents = async (grade: string, classNum: string) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/student/class?grade=${grade}&class=${classNum}`,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.result === "SUCCESS" && Array.isArray(data.data)) {
          setClassroomStudents(data.data);
        } else {
          setClassroomStudents([]);
        }
      } else {
        setClassroomStudents([]);
      }
    } catch (error) {
      console.error("Failed to fetch classroom students:", error);
      setClassroomStudents([]);
    }
  };

  const handleGradeClassChange = async (
    index: number,
    field: "grade" | "class",
    value: string
  ) => {
    const updatedStudents = [...enrollmentedStudents];
    updatedStudents[index][field] = value;
    setEnrollmentStudents(updatedStudents);

    const student = updatedStudents[index];

    // grade と class の両方が入力されている場合のみAPIリクエスト
    if (student.grade && student.class) {
      await fetchClassroomStudents(student.grade, student.class);
    } else {
      setClassroomStudents([]);
    }
  };

  const handleStudentIdChange = async (index: number, value: string) => {
    const updatedStudents = [...enrollmentedStudents];
    updatedStudents[index].student_id = value;
    setEnrollmentStudents(updatedStudents);

    if (value.length > 0 && classroomStudents.length > 0) {
      // 入力値でクラス内の生徒を絞り込み
      const filtered = classroomStudents.filter((student: StudentSuggestion) =>
        student.student_id.toLowerCase().includes(value.toLowerCase())
      );
      setStudentSuggestions(filtered);
      setShowSuggestions(true);
      setActiveSuggestionIndex(-1);
    } else if (value.length === 0 && classroomStudents.length > 0) {
      // 入力が空の場合は全クラス内生徒を表示
      setStudentSuggestions(classroomStudents);
      setShowSuggestions(true);
      setActiveSuggestionIndex(-1);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (
    index: number,
    field: keyof EnrollmentedStudent,
    value: string
  ) => {
    const updatedStudents = [...enrollmentedStudents];
    if (
      field === "student_id" ||
      field === "student_number" ||
      field === "grade" ||
      field === "class"
    ) {
      updatedStudents[index][field] = value;
    }
    setEnrollmentStudents(updatedStudents);
  };

  const handleSelectSuggestion = (
    index: number,
    suggestion: StudentSuggestion
  ) => {
    const updatedStudents = [...enrollmentedStudents];
    updatedStudents[index].student_id = suggestion.student_id;
    updatedStudents[index].student_number = suggestion.number.toString();
    setEnrollmentStudents(updatedStudents);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (!showSuggestions || studentSuggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) =>
        prev < studentSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && activeSuggestionIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(index, studentSuggestions[activeSuggestionIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleSaveEnrollment = async (index: number) => {
    const student = enrollmentedStudents[index];

    try {
      const response = await fetch(`http://localhost:3000/api/enrollment/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
          
        },
        body: JSON.stringify([
          {
            lesson_id: lessonID,
            student_id: student.student_id,
          },
        ]),
      });

      if (response.ok) {
        alert("履修登録が完了しました");
        fetchEnrollments(); // 再取得してUIを更新
        setEditingIndex(null);
      } else {
        alert("履修登録に失敗しました");
      }
    } catch (error) {
      console.error("Failed to save enrollment:", error);
      alert("履修登録に失敗しました");
    }
  };

  const handleCancelEdit = (index: number) => {
    const student = enrollmentedStudents[index];
    if (student.isNew) {
      const updatedStudents = enrollmentedStudents.filter((_, i) => i !== index);
      setEnrollmentStudents(updatedStudents);
    } else {
      const updatedStudents = [...enrollmentedStudents];
      updatedStudents[index].isEditing = false;
      setEnrollmentStudents(updatedStudents);
    }
    setEditingIndex(null);
    setClassroomStudents([]);
  };

  const isStudentIdEnabled = (student: EnrollmentedStudent) => {
    return student.grade !== "" && student.class !== "";
  };

  const handleCheckboxChange = (index: number) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedStudents(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedStudents.size === enrollmentedStudents.length) {
      setSelectedStudents(new Set());
    } else {
      const allIndices = enrollmentedStudents.map((_, index) => index);
      setSelectedStudents(new Set(allIndices));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedStudents.size === 0) {
      alert("削除する履修情報を選択してください");
      return;
    }

    if (!window.confirm(`${selectedStudents.size}件の履修情報を削除しますか？`)) {
      return;
    }

    try {
      const deletePromises = Array.from(selectedStudents).map(async (index) => {
        const enrollment = enrollmentedStudents[index];
        if (enrollment.isNew) {
          return Promise.resolve();
        }

        console.log(enrollment);
        const response = await fetch(
          `http://localhost:3000/api/enrollment/${enrollment.enrollment_id}`,
          {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log(response);

        if (!response.ok) {
          throw new Error(
            `Failed to delete enrollment for ${enrollment.student_id}`
          );
        }
      });

      await Promise.all(deletePromises);

      const updatedStudents = enrollmentedStudents.filter(
        (_, index) => !selectedStudents.has(index)
      );
      setEnrollmentStudents(updatedStudents);
      setSelectedStudents(new Set());
      alert("選択した履修情報を削除しました");
    } catch (error) {
      console.error("Failed to delete enrollments:", error);
      alert("履修情報の削除に失敗しました");
    }
  };

  return (
    <Modal size="lg" centered show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          {lesson?.lesson_name} {t("enrollment_modal_title")}
        </Modal.Title>
        <Button className="ms-3" variant="primary" onClick={handleAddNewRow}>
          {t("new_enrollment")}
        </Button>
        <Button className="ms-3" variant="outline-secondary">
          {t("csv_enrollment")}
        </Button>
        {selectedStudents.size > 0 && (
          <Button
            className="ms-3"
            variant="danger"
            onClick={handleDeleteSelected}
          >
            選択削除 ({selectedStudents.size})
          </Button>
        )}
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Table>
            <thead>
              <tr>
                <th className="enrollment-table-header" id="selecter">
                  <Form.Check
                    className="ms-2"
                    checked={
                      selectedStudents.size === enrollmentedStudents.length &&
                      enrollmentedStudents.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="enrollment-table-header">class</th>
                <th className="enrollment-table-header">student_id</th>
                <th className="enrollment-table-header">student_number</th>
                <th className="enrollment-table-header">actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollmentedStudents.map((student, index) => {
                return (
                  <tr key={student.enrollment_id || index}>
                    <td className="selecter">
                      <Form.Check
                        className="ms-2"
                        checked={selectedStudents.has(index)}
                        onChange={() => handleCheckboxChange(index)}
                      />
                    </td>
                    <td>
                      {student.isEditing ? (
                        <div className="d-flex gap-1 align-items-center">
                          <Form.Control
                            size="sm"
                            type="text"
                            placeholder="Grade"
                            value={student.grade}
                            onChange={(e) =>
                              handleGradeClassChange(index, "grade", e.target.value)
                            }
                            style={{ width: "60px" }}
                          />
                          <span>-</span>
                          <Form.Control
                            size="sm"
                            type="text"
                            placeholder="Class"
                            value={student.class}
                            onChange={(e) =>
                              handleGradeClassChange(index, "class", e.target.value)
                            }
                            style={{ width: "60px" }}
                          />
                        </div>
                      ) : (
                        `${student.grade}-${student.class}`
                      )}
                    </td>
                    <td>
                      {student.isEditing ? (
                        <div
                          style={{ position: "relative" }}
                          ref={editingIndex === index ? suggestionRef : null}
                        >
                          <Form.Control
                            size="sm"
                            type="text"
                            placeholder="Student ID"
                            value={student.student_id}
                            onChange={(e) =>
                              handleStudentIdChange(index, e.target.value)
                            }
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            onFocus={() => {
                              if (
                                isStudentIdEnabled(student) &&
                                classroomStudents.length > 0
                              ) {
                                setStudentSuggestions(classroomStudents);
                                setShowSuggestions(true);
                              }
                            }}
                            disabled={!isStudentIdEnabled(student)}
                          />
                          {showSuggestions &&
                            studentSuggestions.length > 0 &&
                            editingIndex === index && (
                              <ListGroup
                                style={{
                                  position: "absolute",
                                  zIndex: 1000,
                                  width: "100%",
                                  maxHeight: "200px",
                                  overflowY: "auto",
                                  marginTop: "2px",
                                }}
                              >
                                {studentSuggestions.map(
                                  (suggestion, suggestionIndex) => (
                                    <ListGroup.Item
                                      key={suggestion.student_id}
                                      action
                                      active={
                                        suggestionIndex === activeSuggestionIndex
                                      }
                                      onClick={() =>
                                        handleSelectSuggestion(index, suggestion)
                                      }
                                      style={{ cursor: "pointer" }}
                                    >
                                      {suggestion.student_id} {suggestion.grade}-
                                      {suggestion.class}-{suggestion.number}
                                    </ListGroup.Item>
                                  )
                                )}
                              </ListGroup>
                            )}
                        </div>
                      ) : (
                        student.student_id
                      )}
                    </td>
                    <td>
                      {student.isEditing ? (
                        <Form.Control
                          size="sm"
                          type="text"
                          placeholder="Number"
                          value={student.student_number}
                          onChange={(e) =>
                            handleInputChange(index, "student_number", e.target.value)
                          }
                          style={{ width: "80px" }}
                          disabled
                        />
                      ) : (
                        student.student_number
                      )}
                    </td>
                    <td>
                      {student.isEditing && (
                        <div className="d-flex gap-1">
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleSaveEnrollment(index)}
                          >
                            保存
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleCancelEdit(index)}
                          >
                            キャンセル
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EnrollmentModal;
