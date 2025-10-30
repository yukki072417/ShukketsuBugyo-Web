import { useState, useEffect, type ReactElement, useRef } from "react";
import {
  Container,
  Table,
  Button,
  Modal,
  Form,
  Pagination,
  Alert,
  Row,
  Col,
} from "react-bootstrap";
import { getClasses } from "../../../../shared/api/common";
import {
  getStudentsInClass,
  createStudents,
  updateStudent,
  deleteStudent,
  getCourses,
  getUnassignedStudents,
  getStudents
} from "../../../../shared/api/settings";
import { type StudentCreateData, type StudentUpdateData} from "../../../../shared/utils/type"
import { useTranslation } from "react-i18next";
import { type Error, errorHandle } from "../../../../shared/utils/error";
import i18next from "i18next";
import "../../styles/StudentSettings.css";

// Type definitions
type Student = {
  student_id: string;
  grade: string | null;
  class: string | null;
  number: number;
  course_id: string | null;
};

type Course = {
  course_id: string;
  course_name: string;
  course_name_en: string;
};

type ClassInfo = {
  grade: string;
  class: string;
  teacher_id: string;
};

export default function StudentSettings(): ReactElement {
  const { t } = useTranslation('studentSettings');
  // Component State
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classList, setClassList] = useState<ClassInfo[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Class filter state
  const [selectedClass, setSelectedClass] = useState<string>("all");

  // Selection state
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Bulk edit state
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const bulkClassRef = useRef<HTMLSelectElement>(null);
  const bulkCourseRef = useRef<HTMLSelectElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // useRefで参照を作成
  const studentIdRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const numberRef = useRef<HTMLInputElement>(null);
  const classSelectionRef = useRef<HTMLSelectElement>(null);
  const courseIdRef = useRef<HTMLSelectElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);

  const studentsPerPage = 10; // 1ページあたりの生徒数

  // Fetch students for the current page
  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!selectedClass) {
        setStudents([]);
        return;
      }
      
      let response;
      if (selectedClass === "unassigned") {
        response = await getUnassignedStudents();
      } else {
        const [grade, className] = selectedClass.split("-");
        if(grade == 'all' && className == undefined) {
          response = await getStudents(30, (currentPage - 1) * studentsPerPage);
        }else{
          response = await getStudentsInClass(grade, className);
        }
      }
      setStudents(response.data || []);
      
      setTotalStudents((response.data || []).length);
    } catch (err) {
      setError(t('fetch_error'));
      console.error(err);
    }
    setLoading(false);
  };
  // Fetch courses and classes for select dropdowns
  const fetchSelectData = async () => {
    try {
      const courseResponse = await getCourses();
      setCourses(courseResponse.data || []);
      const classResponse = await getClasses();
      setClassList(classResponse.data || []);
    } catch (err) {
      console.error("コースまたはクラスの取得に失敗しました", err);
    }
  };

  useEffect(() => {
    fetchStudents();
    setSelectedStudents(new Set());
    setSelectAll(false);
  }, [currentPage, selectedClass]);

  useEffect(() => {
    fetchSelectData();
  }, []);

  // Class filter handlers
  const handleClassFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedClass(value);
    if (!value) {
      setError(t('select_class_error'));
      setStudents([]);
      return;
    }
    setError(null);
  };

  // Modal handlers
  const handleShowModal = (
    mode: "create" | "edit",
    student: Student | null = null
  ) => {
    setModalMode(mode);
    setEditingStudent(student);
    setError(null);

    if (student) {
      // 編集モード
      if (studentIdRef.current) studentIdRef.current.value = student.student_id;
      if (numberRef.current) numberRef.current.value = String(student.number);
      if (classSelectionRef.current) {
        if (student.grade && student.class) {
          classSelectionRef.current.value = `${student.grade}-${student.class}`;
        } else {
          classSelectionRef.current.value = "unassigned";
        }
      }
      if (courseIdRef.current)
        courseIdRef.current.value = student.course_id || "";
    } else {
      // 作成モード
      const defaultClass = classList[0];
      if (studentIdRef.current) studentIdRef.current.value = "";
      if (passwordRef.current) passwordRef.current.value = "";
      if (confirmPasswordRef.current) confirmPasswordRef.current.value = "";
      if (numberRef.current) numberRef.current.value = "1";

      // If a class is selected in filter, pre-select it in the modal
      if (selectedClass !== "all") {
        if (classSelectionRef.current)
          classSelectionRef.current.value = selectedClass;
      } else if (classSelectionRef.current) {
        classSelectionRef.current.value = defaultClass
          ? `${defaultClass.grade}-${defaultClass.class}`
          : "";
      }

      if (courseIdRef.current) courseIdRef.current.value = "";
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  // CRUD handlers
  const handleSave = async () => {
    setError(null);

    const studentId = studentIdRef.current?.value || "";
    const password = passwordRef.current?.value || "";
    const confirmPassword = confirmPasswordRef.current?.value || "";
    const number = numberRef.current?.value || "1";
    const classSelection = classSelectionRef.current?.value || "";
    const courseId = courseIdRef.current?.value == "コースを選択" ? null : courseIdRef.current?.value || "";
    const newPassword = newPasswordRef.current?.value || "";

    let grade, cls;
    if (classSelection === "unassigned") {
      grade = null;
      cls = null;
    } else {
      [grade, cls] = classSelection.split("-");
    }

    if (modalMode === "create") {
      if (!studentId || !password || !confirmPassword) {
        setError(t('required_fields_error'));
        return;
      }
      if (password !== confirmPassword) {
        setError(t('password_mismatch_error'));
        return;
      }

      try {

        if(!grade || !cls) return;
        
        // コースIDが選択されている場合、コース名を取得
        let course_name: string | null = null;
        let course_name_en: string | null = null;
        
        if (courseId) {
          const selectedCourse = courses.find(c => c.course_id === courseId);
          if (selectedCourse) {
            course_name = selectedCourse.course_name;
            course_name_en = selectedCourse.course_name_en;
          }
        }

        const createData: StudentCreateData = {
          student_id: studentId,
          grade: grade,
          class: cls,
          number: Number(number),
          password: password,
          course_name,
          course_name_en,
        };
        await createStudents([createData]);
        alert(t('create_success'));
        fetchStudents();
        handleCloseModal();
      } catch (err: any) {
        setError(
          `保存に失敗しました: ${err.response?.data?.message || err.message}`
        );
      }
    } else if (editingStudent) {
      try {
        const updateData: StudentUpdateData = {
          grade: grade || undefined,
          class: cls || undefined,
          number: Number(number),
          course_id: courseId === "" ? null : courseId,
          password: newPassword || null,
        };
        await updateStudent(editingStudent.student_id, updateData);
        alert(t('update_success'));
        fetchStudents();
        handleCloseModal();
      } catch (err: any) {
        setError(
          `保存に失敗しました: ${err.response?.data?.message || err.message}`
        );
      }
    }
  };

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedStudents(new Set(students.map(s => s.student_id)));
    } else {
      setSelectedStudents(new Set());
    }
  };

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    const newSelected = new Set(selectedStudents);
    if (checked) {
      newSelected.add(studentId);
    } else {
      newSelected.delete(studentId);
    }
    setSelectedStudents(newSelected);
    setSelectAll(newSelected.size === students.length && students.length > 0);
  };

  const handleDelete = async (student_id: string) => {
    if (window.confirm(t('delete_confirm'))) {
      try {
        await deleteStudent(student_id);
        alert(t('delete_success'));
        fetchStudents();
      } catch (err) {
        setError(t('delete_failed'));
        console.error(err);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStudents.size === 0) return;
    if (window.confirm(`${selectedStudents.size}人の生徒を削除しますか？`)) {
      try {
        await Promise.all(Array.from(selectedStudents).map(id => deleteStudent(id)));
        alert(`${selectedStudents.size}人の生徒を削除しました`);
        setSelectedStudents(new Set());
        setSelectAll(false);
        fetchStudents();
      } catch (err) {
        setError('一括削除に失敗しました');
        console.error(err);
      }
    }
  };

  const handleBulkEdit = async () => {
    if (selectedStudents.size === 0) return;
    
    const classSelection = bulkClassRef.current?.value || "";
    const courseId = bulkCourseRef.current?.value || "";
    
    if (!classSelection && !courseId) {
      setError('組またはコースを選択してください');
      return;
    }
    
    let grade: string | undefined, cls: string | undefined;
    if (classSelection === "unassigned") {
      grade = "";
      cls = "";
    } else if (classSelection) {
      [grade, cls] = classSelection.split("-");
    }
    
    if (window.confirm(`${selectedStudents.size}人の生徒を一括編集しますか？`)) {
      try {
        const updatePromises = Array.from(selectedStudents).map(studentId => {
          const student = students.find(s => s.student_id === studentId);
          const updateData: StudentUpdateData = {
            number: student?.number,
            password: null,
          };
          if (classSelection) {
            updateData.grade = grade;
            updateData.class = cls;
          }
          if (courseId) {
            updateData.course_id = courseId === "" ? null : courseId;
          }

          return updateStudent(studentId, updateData);
        });
        
        await Promise.all(updatePromises);
        alert(`${selectedStudents.size}人の生徒を更新しました`);
        setSelectedStudents(new Set());
        setSelectAll(false);
        setShowBulkEditModal(false);
        fetchStudents();
      } catch (err) {
        setError('一括編集に失敗しました');
        console.error(err);
      }
    }
  };

  const handleCsvUpload = () => {
    fileInputRef.current?.click();
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r\n|\n/).slice(1); // ヘッダーをスキップ
      const fileName = file.name;

      const newStudents = lines
        .map((line) => {
          // CSV行をパース
          const [student_id, grade, cls, numberStr, password, courseValue] =
            line.split(",").map((s) => s.trim());

          // 必須項目のチェック
          if (!student_id || !grade || !cls || !numberStr || !password) {
            console.warn("Invalid line:", line);
            return null;
          }

          // コースの処理
          let course_name: string | null = null;
          let course_name_en: string | null = null;

          if (courseValue) {
            // 日本語文字が含まれているかチェック
            const hasJapanese =
              /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/.test(
                courseValue
              );
            if (hasJapanese) {
              course_name = courseValue;
            } else {
              course_name_en = courseValue;
            }
          }

          // StudentCreateDataオブジェクトを生成
          const studentData: StudentCreateData = {
            student_id,
            grade,
            class: cls,
            password: password,
            number: parseInt(numberStr, 10),
            course_name,
            course_name_en,
          };

          return studentData;
        })
        .filter((s): s is StudentCreateData => s !== null);

      if (newStudents.length > 0) {
        try {
          if(confirm(t('bulk_upload_confirm'))){
            await createStudents(newStudents);
            alert(t('bulk_create_success', { count: newStudents.length }));
            fetchStudents();
          }
        } catch (err: any) {
          const handledError: Error = errorHandle(err.status);
          const message = handledError.message;
          setError(t('bulk_create_failed', { fileName, message }));
          console.error(err);
        }
      } else {
        setError(t('no_valid_data'));
      }
    };

    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // ファイル選択をリセット
    }
  };

  // Pagination - only show when not filtering by class
  const pageCount = Math.ceil(totalStudents / studentsPerPage);
  const paginationItems = [];
  for (let number = 1; number <= pageCount; number++) {
    paginationItems.push(
      <Pagination.Item
        key={number}
        active={number === currentPage}
        onClick={() => setCurrentPage(number)}
      >
        {number}
      </Pagination.Item>
    );
  }

  // コース名表示用の関数を追加
  const getCourseName = (courseId: string | null, courses: Course[]) => {
    if (!courseId) return t('no_course');
    const course = courses.find((c) => c.course_id === courseId);
    if (!course) return t('no_course');
    return i18next.language == "ja" ? course.course_name : course.course_name_en;
  };

  // テーブル表示コンポーネント
  const StudentTable = () => (
    <>
      {selectedStudents.size > 0 && (
        <div className="mb-3 d-flex gap-2">
          <Button variant="primary" onClick={() => setShowBulkEditModal(true)}>
            選択した{selectedStudents.size}人を一括編集
          </Button>
          <Button variant="danger" onClick={handleBulkDelete}>
            選択した{selectedStudents.size}人を削除
          </Button>
          <Button variant="outline-secondary" onClick={() => {setSelectedStudents(new Set()); setSelectAll(false);}}>
            選択解除
          </Button>
        </div>
      )}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th style={{width: "50px"}}>
              <Form.Check
                type="checkbox"
                checked={selectAll}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            </th>
            <th>{t('student_id')}</th>
            <th style={{width: "90px"}}>{t('student_number')}</th>
            <th>{t('course')}</th>
            <th>{t('actions')}</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.student_id}>
              <td>
                <Form.Check
                  type="checkbox"
                  checked={selectedStudents.has(student.student_id)}
                  onChange={(e) => handleSelectStudent(student.student_id, e.target.checked)}
                />
              </td>
              <td>{student.student_id}</td>
              <td>{student.number}</td>
              <td>{getCourseName(student.course_id, courses)}</td>
              <td>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleShowModal("edit", student)}
                  className="me-2"
                >
                  {t('edit')}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(student.student_id)}
                >
                  {t('delete')}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );

  return (
    <Container className="common">
      <h3>{t('title')}</h3>

      {/* Class Filter and Action Buttons */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>{t('select_class')}</Form.Label>
            <Form.Select
              value={selectedClass}
              onChange={handleClassFilterChange}
              required
            >
              <option value="">{t('select_class_placeholder')}</option>
              <option value="unassigned">{t('unassigned')}</option>
              {classList.map((cls) => (
                <option
                  key={`${cls.grade}-${cls.class}`}
                  value={`${cls.grade}-${cls.class}`}
                >
                  {cls.grade}-{cls.class}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col
          md={6}
          className="d-flex align-items-end justify-content-end gap-2"
        >
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <Container className="register-button-group d-flex align-items-end justify-content-end gap-2">
            <Button variant="outline-secondary" onClick={handleCsvUpload}>
              {t('csv_bulk_upload')}
            </Button>
            <Button variant="primary" onClick={() => handleShowModal("create")}>
              {t('add_student')}
            </Button>
          </Container>
        </Col>
      </Row>

      {!loading && error && <Alert variant="danger">{error}</Alert>}

      <StudentTable />

      {paginationItems.length > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination>{paginationItems}</Pagination>
        </div>
      )}

      <div className="mt-3 d-flex justify-content-between text-muted">
        <span>
          {selectedClass !== "all" && `${students.length}${t('people_suffix')}`}
        </span>
        {selectedStudents.size > 0 && (
          <span>{selectedStudents.size}人選択中</span>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === "create" ? t('modal_title_add') : t('modal_title_edit')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{t('student_id')}</Form.Label>
              <Form.Control
                type="text"
                ref={studentIdRef}
                disabled={modalMode === "edit"}
              />
            </Form.Group>
            {modalMode === "create" && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>{t('password')}</Form.Label>
                  <Form.Control type="password" ref={passwordRef} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>{t('password_confirm')}</Form.Label>
                  <Form.Control type="password" ref={confirmPasswordRef} />
                </Form.Group>
              </>
            )}
            <Form.Group className="mb-3">
              <Form.Label>{t('student_number')}</Form.Label>
              <Form.Control type="number" ref={numberRef} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('class')}</Form.Label>
              <Form.Select ref={classSelectionRef}>
                <option value="">{t('select_class')}</option>
                <option value="unassigned">{t('unassigned')}</option>
                {classList.map((cls) => (
                  <option
                    key={`${cls.grade}-${cls.class}`}
                    value={`${cls.grade}-${cls.class}`}
                  >
                    {cls.grade}-{cls.class}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('course')}</Form.Label>
              <Form.Select ref={courseIdRef}>
                <option value="">{t('select_course')}</option>
                {courses.map((course) => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.course_name || course.course_name_en}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            {modalMode === "edit" && (
              <Form.Group className="mb-3">
                <Form.Label>{t('new_password')}</Form.Label>
                <Form.Control
                  type="password"
                  ref={newPasswordRef}
                  placeholder={t('new_password_placeholder')}
                />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            {t('cancel')}
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {t('save')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bulk Edit Modal */}
      <Modal show={showBulkEditModal} onHide={() => setShowBulkEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>一括編集 ({selectedStudents.size}人)</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>組 (変更しない場合は空白)</Form.Label>
              <Form.Select ref={bulkClassRef}>
                <option value="">変更しない</option>
                <option value="unassigned">{t('unassigned')}</option>
                {classList.map((cls) => (
                  <option
                    key={`${cls.grade}-${cls.class}`}
                    value={`${cls.grade}-${cls.class}`}
                  >
                    {cls.grade}-{cls.class}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>コース (変更しない場合は空白)</Form.Label>
              <Form.Select ref={bulkCourseRef}>
                <option value="">変更しない</option>
                {courses.map((course) => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.course_name || course.course_name_en}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBulkEditModal(false)}>
            {t('cancel')}
          </Button>
          <Button variant="primary" onClick={handleBulkEdit}>
            一括更新
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
