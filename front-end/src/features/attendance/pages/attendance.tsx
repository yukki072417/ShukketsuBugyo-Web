import { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Table,
  Card,
  Button,
  Alert,
  Spinner,
  Badge,
  Modal,
  ListGroup,
} from "react-bootstrap";
import { type Student, type Attendance, type Enrollment, type TimetableEntry, type Period, ATTENDANCE_STATUS, getClasses, type Class } from "../../../shared";
import {
  getPeriods,
  getLessons,
  getAttendanceTimetable,
  getStudentsInClass,
  getEnrollmentsByLesson,
  getAttendanceByDate,
  createBulkAttendance,
  updateBulkAttendance
} from "../../../shared";

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setHours(0, 0, 0, 0);
  return new Date(d.setDate(diff));
}

const formatDateForAPI = (date: Date) => date.toISOString().split('T')[0];

// Helper to generate a color from a string
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}

export default function Attendance() {
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(getMonday(new Date()));
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [periods, setPeriods] = useState<Period[]>([]);
  const [lessonMap, setLessonMap] = useState<Record<string, { lesson_id: string; lesson_name: string; lesson_name_en: string }>>({});
  const [timetable, setTimetable] = useState<Record<string, TimetableEntry[]>>({});
  
  const [selectedCell, setSelectedCell] = useState<{ day: number; period: string; lessons: TimetableEntry[] } | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<TimetableEntry | null>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);

  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<Record<string, Enrollment>>({});

  const [classes, setClasses] = useState<string[]>();
  const [grades, setGrades] = useState<string[]>();

  const [attendanceData, setAttendanceData] = useState<Record<string, Attendance>>({});
  const [isSheetVisible, setIsSheetVisible] = useState<boolean>(false);
  const [isExistingRecord, setIsExistingRecord] = useState<boolean>(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStatus, setDragStatus] = useState<number | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [showCreateButton, setShowCreateButton] = useState(false);

  const weekDates = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = getMonday(new Date(selectedWeekStart));
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [selectedWeekStart]);

  useEffect(() => {
    const handleDragMove = (clientX: number, clientY: number) => {
      setCursorPosition({ x: clientX, y: clientY });
      const targetElement = document.elementFromPoint(clientX, clientY);
      if (targetElement && targetElement instanceof HTMLElement) {
        const studentId = targetElement.dataset.studentId;
        if (studentId && dragStatus !== null && attendanceData[studentId]?.status !== dragStatus) {
          handleStatusUpdate(studentId, dragStatus);
        }
      }
    };
    const handleMouseMove = (e: MouseEvent) => isDragging && handleDragMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
        handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleDragEnd = () => {
      setIsDragging(false);
      setDragStatus(null);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleDragEnd);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleDragEnd);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleDragEnd);
    };
  }, [isDragging, dragStatus, attendanceData]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [periodsData, lessonsData] = await Promise.all([
          getPeriods(),
          getLessons()
        ]);
        
        setPeriods(Array.isArray(periodsData) ? periodsData : periodsData.data || []);
        
        const map: Record<string, any> = {};
        (Array.isArray(lessonsData) ? lessonsData : []).forEach((lesson: any) => {
          map[lesson.lesson_name] = lesson;
        });
        setLessonMap(map);
      } catch (err) {
        console.error(err);
        setError("初期データの取得に失敗しました");
      }
    };

    const fetchClasses = async (): Promise<void> => {
      try {
        const response = await getClasses();
        const datas: Class[] = response.data;

        if(datas.length === 0) return;
        
        const uniqueGrades = [...new Set(datas.map(data => data.grade))].sort();
        const uniqueClasses = [...new Set(datas.map(data => data.class))].sort();
        
        setGrades(uniqueGrades);
        setClasses(uniqueClasses);

      } catch (error) {
        setError("クラスの取得に失敗しました。");
      }
    }
    
    fetchClasses();
    fetchInitialData();
  }, []);
  
  useEffect(() => {
    if (!selectedGrade || !selectedClass) {
      setTimetable({});
      return;
    }
    const fetchTimetable = async () => {
      setError(null);
      try {
        const resData = await getAttendanceTimetable(selectedGrade, selectedClass);
        const data = Array.isArray(resData) ? resData : resData.data || [];
        
        const groupedTimetable = data.reduce((acc: Record<string, TimetableEntry[]>, entry: any) => {
          const key = `${entry.day_of_week}-${entry.period}`;
          if (!acc[key]) {
            acc[key] = [];
          }
          const lesson = lessonMap[entry.lesson_name];
          if (lesson) {
            acc[key].push({
              day_of_week: entry.day_of_week,
              period: String(entry.period),
              lesson_id: lesson.lesson_id,
              lesson_name: entry.lesson_name,
              lesson_name_en: entry.lesson_name_en,
            });
          }
          return acc;
        }, {});

        setTimetable(groupedTimetable);
      } catch (err) {
        console.error(err);
        setError("時間割の取得に失敗しました");
      }
    };
    fetchTimetable();
  }, [selectedGrade, selectedClass, lessonMap]);

  useEffect(() => {
    if (!selectedGrade || !selectedClass) {
      setStudents([]);
      return;
    }
    const fetchStudents = async () => {
      try {
        const resData = await getStudentsInClass(selectedGrade, selectedClass);
        setStudents(Array.isArray(resData) ? resData : resData.data || []);
      } catch (err) {
        console.error(err);
        setError("生徒一覧の取得に失敗しました");
      }
    };
    fetchStudents();
  }, [selectedGrade, selectedClass]);

  // 週の開始日変更時に出席簿を更新
  useEffect(() => {
    if (selectedLesson && selectedCell) {
      handleLessonSelect(selectedLesson);
    }
  }, [selectedWeekStart]);

  const handleLessonSelect = async (lesson: TimetableEntry) => {
    if (!selectedCell) return;

    setSelectedLesson(lesson);
    setShowLessonModal(false);
    setAttendanceLoading(true);
    setError(null);
    setIsSheetVisible(false);

    try {
      const enrollmentsRes = await getEnrollmentsByLesson(lesson.lesson_id);
      const enrollmentList = enrollmentsRes.data || [];
      const newEnrollments: Record<string, Enrollment> = {};
      enrollmentList.forEach((enr: Enrollment) => {
        newEnrollments[enr.student_id] = enr;
      });
      setEnrollments(newEnrollments);

      const selectedDate = weekDates.find((d) => d.getDay() === selectedCell.day);
      if (!selectedDate) throw new Error("選択された日付が見つかりません。");
      const dateString = formatDateForAPI(selectedDate);

      const attendanceRes = await getAttendanceByDate(lesson.lesson_id, dateString, selectedCell.period);
      const attendanceList = Array.isArray(attendanceRes) ? attendanceRes : attendanceRes.data || [];

      if (attendanceList.length > 0) {
        setIsExistingRecord(true);
        const newAttendanceData: Record<string, Attendance> = {};
        attendanceList.forEach((att: Attendance) => {
          newAttendanceData[att.student_id] = att;
        });
        setAttendanceData(newAttendanceData);
        setIsSheetVisible(true);
        setShowCreateButton(false);
      } else {
        setIsExistingRecord(false);
        setAttendanceData({});
        setIsSheetVisible(false);
        setShowCreateButton(Object.keys(newEnrollments).length > 0);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "出席データの取得に失敗しました。");
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleCellClick = (day: number, period: string) => {
    const key = `${day}-${period}`;
    const lessons = timetable[key];
    if (lessons && lessons.length > 0) {
      setSelectedCell({ day, period, lessons });
      if (lessons.length === 1) {
        handleLessonSelect(lessons[0]);
      } else {
        setShowLessonModal(true);
      }
    } else {
      setSelectedCell(null);
      setSelectedLesson(null);
    }
  };

  const handleCreateAttendanceSheet = () => {
    if (!selectedCell || !selectedLesson) return;
    
    const selectedDate = weekDates.find((d) => d.getDay() === selectedCell.day);
    if (!selectedDate) return;
    const dateString = formatDateForAPI(selectedDate);

    const newAttendanceData: Record<string, Attendance> = {};
    students.forEach((student) => {
      const enrollment = enrollments[student.student_id];
      if (enrollment) {
        newAttendanceData[student.student_id] = {
          enrollment_id: enrollment.enrollment_id,
          student_id: student.student_id,
          date: dateString,
          period: selectedCell.period,
          status: 1,
          notes: "",
        };
      }
    });

    setAttendanceData(newAttendanceData);
    setIsSheetVisible(true);
    setShowCreateButton(false);
  };

  const handleStatusUpdate = (student_id: string, newStatus: number) => {
    setAttendanceData((prev) => {
      const existingData = prev[student_id];
      if (existingData) {
        return { ...prev, [student_id]: { ...existingData, status: newStatus } };
      }

      const enrollment = enrollments[student_id];
      if (enrollment && selectedCell && selectedLesson) {
        const selectedDate = weekDates.find((d) => d.getDay() === selectedCell.day);
        if (!selectedDate) return prev;
        const dateString = formatDateForAPI(selectedDate);

        return {
          ...prev,
          [student_id]: {
            enrollment_id: enrollment.enrollment_id,
            student_id: student_id,
            date: dateString,
            period: selectedCell.period,
            status: newStatus,
            notes: "",
          },
        };
      }
      return prev;
    });
  };

  const handleNoteChange = (student_id: string, newNote: string) => {
    setAttendanceData((prev) => {
      if (!prev[student_id]) return prev;
      return { ...prev, [student_id]: { ...prev[student_id], notes: newNote } };
    });
  };

  const handleStatusClick = (student_id: string) => {
    if (isDragging) return;
    const currentStatus = attendanceData[student_id]?.status ?? 0;
    const statusValues = Object.keys(ATTENDANCE_STATUS).map(Number).filter(v => !isNaN(v));
    const currentIndex = statusValues.indexOf(currentStatus);
    const nextStatusIndex = (currentIndex + 1) % statusValues.length;
    const nextStatus = statusValues[nextStatusIndex];
    handleStatusUpdate(student_id, nextStatus);
  };

  const handleDragStart = (clientX: number, clientY: number, student_id: string) => {
    setIsDragging(true);
    const status = attendanceData[student_id]?.status;
    setDragStatus(status ?? 0);
    setCursorPosition({ x: clientX, y: clientY });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    const currentLesson = selectedLesson;

    try {
      const payload = Object.values(attendanceData);
      if (payload.length === 0) throw new Error("保存するデータがありません。");
      if (!currentLesson) throw new Error("授業が選択されていません。");

      if (isExistingRecord) {
        await updateBulkAttendance(payload);
      } else {
        await createBulkAttendance(payload);
      }

      setSuccess("出席簿を保存しました。");
      
      if (currentLesson) {
        await handleLessonSelect(currentLesson);
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "出席簿の保存中にエラーが発生しました。");
    } finally {
      setSaving(false);
    }
  };

  const renderAttendanceTable = () => (
    <>
      <Table striped bordered hover responsive onMouseLeave={() => setIsDragging(false)}>
        <thead>
          <tr>
            <th>学生ID</th>
            <th>番号</th>
            <th>出席状況</th>
            <th>備考</th>
          </tr>
        </thead>
        <tbody>
          {students
            .filter(student => enrollments[student.student_id])
            .map((student) => {
              const attendance = attendanceData[student.student_id];
              const status = attendance?.status ?? 1;
              const statusInfo = ATTENDANCE_STATUS[status as keyof typeof ATTENDANCE_STATUS] || { text: '不明', color: 'secondary' };
              return (
                <tr key={student.student_id}>
                  <td>{student.student_id}</td>
                  <td>{student.number}</td>
                  <td
                    data-student-id={student.student_id}
                    style={{ cursor: "pointer", userSelect: "none" }}
                    onClick={() => handleStatusClick(student.student_id)}
                    onMouseDown={(e) => handleDragStart(e.clientX, e.clientY, student.student_id)}
                    onTouchStart={(e) => handleDragStart(e.touches[0].clientX, e.touches[0].clientY, student.student_id)}
                  >
                    <Badge bg={statusInfo.color}>{statusInfo.text}</Badge>
                  </td>
                  <td>
                    <Form.Control
                      type="text"
                      value={attendance?.notes || ""}
                      onChange={(e) => handleNoteChange(student.student_id, e.target.value)}
                      disabled={!attendance}
                    />
                  </td>
                </tr>
              );
          })}
        </tbody>
      </Table>
      <Button onClick={handleSave} disabled={saving || Object.keys(attendanceData).length === 0}>
        {saving ? <Spinner as="span" animation="border" size="sm" /> : "保存"}
      </Button>
    </>
  );

  return (
    <Container fluid className="p-4">
      {isDragging && (
        <div style={{ position: "fixed", top: cursorPosition.y, left: cursorPosition.x, width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "rgba(0, 123, 255, 0.3)", transform: "translate(-50%, -50%)", pointerEvents: "none", zIndex: 9999 }} />
      )}
      
      <h2 className="mb-4">週間時間割 出席管理</h2>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>週の開始日</Form.Label>
                <Form.Control 
                  type="date" 
                  value={selectedWeekStart.toISOString().split("T")[0]} 
                  onChange={(e) => {
                    setSelectedWeekStart(getMonday(new Date(e.target.value)));
                    // 出席簿の状態をリセット
                    setIsSheetVisible(false);
                    setShowCreateButton(false);
                  }} 
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>学年</Form.Label>
                <Form.Select value={selectedGrade} onChange={(e) => { setSelectedGrade(e.target.value); setSelectedClass(''); setSelectedCell(null); setSelectedLesson(null); }}>
                  <option value="">学年を選択</option>
                  {grades?.map((grade) => (<option key={grade} value={grade}>{grade}年</option>))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>クラス</Form.Label>
                <Form.Select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setSelectedCell(null); setSelectedLesson(null); }} disabled={!selectedGrade}>
                  <option value="">クラスを選択</option>
                  {classes?.map((_class) => (<option key={_class} value={_class}>{_class}組</option>))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {selectedGrade && selectedClass && (
        <>
          <Card className="mb-4">
            <Card.Header as="h5">時間割</Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table bordered hover className="timetable-table">
                  <thead className="table-light">
                    <tr>
                      <th style={{ minWidth: "80px" }}>時限</th>
                      {weekDates.map((date, idx) => (
                        <th key={idx} className="text-center" style={{ minWidth: "120px" }}>
                          {DAY_NAMES[date.getDay()]}<br /><small>{date.getMonth() + 1}/{date.getDate()}</small>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {periods.map((p) => (
                      <tr key={p.period}>
                        <td className="text-center align-middle fw-bold">{p.period}限</td>
                        {weekDates.map((date, index) => {
                          const day = date.getDay();
                          const key = `${day}-${p.period}`;
                          const lessons = timetable[key] || [];
                          const isSelected = selectedCell?.day === day && selectedCell?.period === p.period;
                          return (
                            <td
                              key={index}
                              className={`align-middle p-2 ${isSelected ? "table-primary" : ""}`}
                              style={{ cursor: lessons.length > 0 ? "pointer" : "default", minHeight: '80px' }}
                              onClick={() => lessons.length > 0 && handleCellClick(day, p.period)}
                            >
                              <div className="d-flex flex-wrap gap-1">
                                {lessons.map(lesson => (
                                  <Badge key={lesson.lesson_id} pill style={{ backgroundColor: stringToColor(lesson.lesson_name), color: '#fff' }}>
                                    {lesson.lesson_name}
                                  </Badge>
                                ))}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>

          {selectedLesson && selectedCell &&
            (() => {
              const selectedDate = weekDates.find((d) => d.getDay() === selectedCell.day);
              if (!selectedDate) return null;
              return (
                <Card>
                  <Card.Header className="bg-primary text-white">
                    <h5 className="mb-0 d-flex justify-content-between align-items-center">
                      <span>
                        {selectedLesson.lesson_name} - {selectedCell.period}限目 - 
                        {selectedDate.getMonth() + 1}/{selectedDate.getDate()}({DAY_NAMES[selectedDate.getDay()]})
                      </span>
                      <Button variant="close" aria-label="Close" onClick={() => { setSelectedLesson(null); setSelectedCell(null); }} />
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    {attendanceLoading ? (
                      <div className="text-center"><Spinner animation="border" /></div>
                    ) : isSheetVisible ? (
                      renderAttendanceTable()
                    ) : showCreateButton ? (
                      <div className="text-center">
                        <p>出席データが見つかりません。</p>
                        <Button variant="primary" onClick={handleCreateAttendanceSheet}>
                          出席簿を作成
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p>この授業を履修している生徒がいません。</p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              );
            })()}
        </>
      )}

      <Modal show={showLessonModal} onHide={() => setShowLessonModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>授業を選択</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {selectedCell?.lessons.map(lesson => (
              <ListGroup.Item action key={lesson.lesson_id} onClick={() => handleLessonSelect(lesson)}>
                {lesson.lesson_name}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
      </Modal>

    </Container>
  );
}