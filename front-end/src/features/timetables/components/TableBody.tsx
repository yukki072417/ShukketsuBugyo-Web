import { useEffect, useState } from "react";
import EnrollmentModal from "./EnrollmentModal";
import {
  Container,
  Table,
  Form,
  Button,
  Alert,
  ProgressBar,
  Modal,
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import {
  getTimetable,
  createTimetableEntry,
  deleteTimetableEntry,
} from "../../../shared/api/timetable";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  type Lesson,
  type Class,
  type PeriodTimes,
  getPeriods,
} from "../../../shared";
import "../styles/TableBody.css";

interface TableBodyProps {
  lessons: Lesson[];
  selectedClass: Class | null;
  onTimetableChange?: (timetable: { [key: string]: TimetableCell }) => void;
}

interface TimetableCell {
  id: string;
  lessons: Array<{ content: string; lessonId: string }>;
}

const DraggableLesson: React.FC<{ lesson: Lesson }> = ({ lesson }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: lesson.lesson_id,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`lesson-item ${isDragging ? "dragging" : ""}`}
    >
      {lesson.lesson_name}
    </div>
  );
};

const DraggableLessonInCell: React.FC<{
  lesson: { content: string; lessonId: string };
  cellId: string;
  index: number;
}> = ({ lesson, cellId, index }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `cell-${cellId}-lesson-${index}`,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`lesson-in-cell ${isDragging ? "dragging" : ""}`}
    >
      {lesson.content}
    </div>
  );
};

const DroppableCell: React.FC<{ cellId: string; cell: TimetableCell }> = ({
  cellId,
  cell,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${cellId}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`timetable-cell ${isOver ? "dragging-over" : ""}`}
    >
      {cell?.lessons && cell.lessons.length > 0 ? (
        <div className="lessons-in-cell">
          {cell.lessons.map((lesson, index) => (
            <DraggableLessonInCell
              key={index}
              lesson={lesson}
              cellId={cellId}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="empty-cell">空</div>
      )}
    </div>
  );
};

const DroppableLessons: React.FC<{ lessons: Lesson[] }> = ({ lessons }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: "lessons",
  });

  return (
    <div
      ref={setNodeRef}
      className={`lessons-list ${isOver ? "dragging-over" : ""}`}
    >
      {lessons.map((lesson) => (
        <DraggableLesson key={lesson.lesson_id} lesson={lesson} />
      ))}
    </div>
  );
};

const DeleteArea: React.FC = () => {
  const { setNodeRef, isOver } = useDroppable({
    id: "delete",
  });

  return (
    <div
      ref={setNodeRef}
      className={`delete-area ${isOver ? "delete-hover" : ""}`}
      style={{
        minHeight: "50px",
        backgroundColor: isOver ? "#f5c6cb" : "#f8d7da",
        border: "2px dashed #dc3545",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#721c24",
        transition: "background-color 0.2s",
      }}
    >
      ここに授業をドラッグして削除
    </div>
  );
};

const EnrollmentArea: React.FC = () => {
    const { setNodeRef, isOver } = useDroppable({
    id: "enrollment",
  });

  return (
    <div
      ref={setNodeRef}
      className={`delete-area ${isOver ? "delete-hover" : ""}`}
      style={{
        minHeight: "50px",
        backgroundColor: isOver ? "#c6daf5ff" : "#d7e2f8ff",
        border: "2px dashed #358bdcff",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#1c5e72ff",
        transition: "background-color 0.2s",
      }}
    >
      ここに授業をドラッグして履修登録
    </div>
  );
}

const TableBody: React.FC<TableBodyProps> = ({
  lessons,
  selectedClass,
  onTimetableChange,
}) => {
  const { t } = useTranslation("timetable");
  const [periods, setPeriods] = useState<PeriodTimes[]>([]);
  const [timetable, setTimetable] = useState<{ [key: string]: TimetableCell }>(
    {}
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [gradeFilter, setGradeFilter] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState({ completed: 0, total: 0 });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [originalTimetable, setOriginalTimetable] = useState<{
    [key: string]: TimetableCell;
  }>({});

  const [showEnrollmentModal, setEnrollmentModal] = useState<boolean>(false);
  const [enrollmentLessonID, setEnrollmentLessonID] = useState<string>("");

  const weekdays = ["mon", "tue", "wed", "thr", "fri"];

  useEffect(() => {
    async function fetchPeriods(): Promise<PeriodTimes[]> {
      const fetchedTimeSlots: any = await getPeriods();
      const result: PeriodTimes[] = fetchedTimeSlots.data.map(
        (period: PeriodTimes) => ({
          period: period.period,
          start_time: period.start_time,
          end_time: period.end_time,
        })
      );
      setPeriods(result);
      return result;
    }
    fetchPeriods();
  }, []);

  useEffect(() => {
    if (periods.length > 0) {
      const initialTimetable: { [key: string]: TimetableCell } = {};
      periods.forEach((period) => {
        weekdays.forEach((day) => {
          const cellId = `${period.period}-${day}`;
          initialTimetable[cellId] = {
            id: cellId,
            lessons: [],
          };
        });
      });
      setTimetable(initialTimetable);
    }
  }, [periods]);

  useEffect(() => {
    const loadExistingTimetable = async () => {
      if (
        !selectedClass ||
        periods.length === 0 ||
        lessons.length === 0 ||
        Object.keys(timetable).length === 0
      )
        return;

      try {
        const response = await getTimetable(
          selectedClass.grade,
          selectedClass.class
        );

        if (response.success) {
          const updatedTimetable = { ...timetable };

          // まず全てのセルを空にリセット
          Object.keys(updatedTimetable).forEach((cellId) => {
            updatedTimetable[cellId].lessons = [];
          });

          if (response.data && response.data.length > 0) {
            response.data.forEach((entry: any) => {
              const dayMap: { [key: number]: string } = {
                1: "mon",
                2: "tue",
                3: "wed",
                4: "thr",
                5: "fri",
              };

              const dayName = dayMap[entry.day_of_week];
              if (dayName) {
                const cellId = `${entry.period}-${dayName}`;
                const lesson = lessons.find(
                  (l) => l.lesson_name === entry.lesson_name
                );

                if (lesson && updatedTimetable[cellId]) {
                  updatedTimetable[cellId].lessons.push({
                    content: entry.lesson_name,
                    lessonId: lesson.lesson_id,
                  });
                }
              }
            });
          }

          setTimetable(updatedTimetable);
          setOriginalTimetable(updatedTimetable);
        }
      } catch (error) {
        console.error("Failed to load existing timetable:", error);
      }
    };

    loadExistingTimetable();
  }, [selectedClass, periods, lessons]);

  const getFilteredLessons = () => {
    if (!gradeFilter) return lessons;
    return lessons.filter((lesson) => lesson.grade === gradeFilter);
  };

  const getAvailableGrades = () => {
    const grades = [...new Set(lessons.map((lesson) => lesson.grade))];
    return grades.sort();
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleShowEnrollmentModal = (lesson: {content: string, lessonId: string}) => {
    if(!lesson) return;

    setEnrollmentLessonID(lesson.lessonId);
    setEnrollmentModal(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (
      lessons.find((l) => l.lesson_id === activeId) &&
      overId.startsWith("cell-")
    ) {
      const cellId = overId.replace("cell-", "");
      const lesson = lessons.find((l) => l.lesson_id === activeId);

      if (lesson && timetable[cellId]) {
        const newTimetable = {
          ...timetable,
          [cellId]: {
            ...timetable[cellId],
            lessons: [
              ...(timetable[cellId]?.lessons || []),
              {
                content: lesson.lesson_name,
                lessonId: lesson.lesson_id,
              },
            ],
          },
        };
        setTimetable(newTimetable);
        onTimetableChange?.(newTimetable);
      }
    } else if (
      activeId.includes("-lesson-") &&
      (overId === "lessons" || overId === "delete")
    ) {
      const parts = activeId.split("-");
      
      // cell-{period}-{day}-lesson-{index} の形式を想定
      const lessonIndex = parts[parts.length - 1]; // 最後の要素がindex
      const cellId = parts.slice(1, -2).join('-'); // cellを除いてlessonとindexを除いた部分
      const index = parseInt(lessonIndex);

      if (timetable[cellId]?.lessons && timetable[cellId].lessons.length > index) {
        const newLessons = timetable[cellId].lessons.filter((_, i) => i !== index);
        
        const newTimetable = {
          ...timetable,
          [cellId]: {
            ...timetable[cellId],
            lessons: newLessons,
          },
        };
        setTimetable(newTimetable);
        onTimetableChange?.(newTimetable);
      } else {
        console.log('削除条件に合致しない:', {
          hasCell: !!timetable[cellId],
          hasLessons: !!timetable[cellId]?.lessons,
          lessonsLength: timetable[cellId]?.lessons?.length,
          index
        });
      }
    } else if (
      activeId.includes("-lesson-") &&
      overId === "enrollment"
    ) {
      const parts = activeId.split("-");

      // cell-{period}-{day}-lesson-{index} の形式を想定
      const lessonIndex = parts[parts.length - 1]; // 最後の要素がindex
      const cellId = parts.slice(1, -2).join('-'); // cellを除いてlessonとindexを除いた部分
      const index = parseInt(lessonIndex);

      if (timetable[cellId]?.lessons?.[index]) {
        const lessonInformation = timetable[cellId].lessons[index];
        handleShowEnrollmentModal(lessonInformation);
      }
    }
  };

  const getDragOverlay = () => {
    if (!activeId) return null;

    const lesson = lessons.find((l) => l.lesson_id === activeId);
    if (lesson) {
      return <div className="lesson-item dragging">{lesson.lesson_name}</div>;
    }

    if (activeId.includes("-lesson-")) {
      const [, cellId, , lessonIndex] = activeId.split("-");
      const index = parseInt(lessonIndex);
      const cell = timetable[cellId];
      if (cell && cell.lessons[index]) {
        return (
          <div className="lesson-in-cell dragging">
            {cell.lessons[index].content}
          </div>
        );
      }
    }

    return null;
  };

  const saveTimetable = async () => {
    if (!selectedClass) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const changes = detectTimetableChanges();
      let totalOperations = changes.create.length + changes.delete.length;
      let completedOperations = 0;

      // 削除処理
      for (const deleteEntry of changes.delete) {
        await deleteTimetableEntry(deleteEntry);
        completedOperations++;
        setSaveProgress({
          completed: completedOperations,
          total: totalOperations,
        });
      }

      // 作成処理
      for (const createEntry of changes.create) {
        await createTimetableEntry(createEntry);
        completedOperations++;
        setSaveProgress({
          completed: completedOperations,
          total: totalOperations,
        });
      }

      setOriginalTimetable({ ...timetable });
      setShowSuccessModal(true);
    } catch (error) {
      setSaveError("時間割の保存中にエラーが発生しました");
    } finally {
      setIsSaving(false);
    }
  };

  const detectTimetableChanges = () => {
    const currentEntries = new Set<string>();
    const originalEntries = new Set<string>();
    const createEntries: any[] = [];
    const deleteEntries: any[] = [];

    // 現在の時間割エントリを収集
    Object.entries(timetable).forEach(([cellId, cell]) => {
      cell.lessons.forEach((lesson) => {
        const [period, dayName] = cellId.split("-");
        const dayMap: { [key: string]: number } = {
          mon: 1,
          tue: 2,
          wed: 3,
          thr: 4,
          fri: 5,
        };
        const key = `${selectedClass!.grade}-${selectedClass!.class}-${
          dayMap[dayName]
        }-${period}-${lesson.lessonId}`;
        currentEntries.add(key);
        createEntries.push({
          grade: selectedClass!.grade,
          class: selectedClass!.class,
          day_of_week: dayMap[dayName],
          period: period,
          lesson_id: lesson.lessonId,
        });
      });
    });

    // 元の時間割エントリを収集
    Object.entries(originalTimetable).forEach(([cellId, cell]) => {
      cell.lessons.forEach((lesson) => {
        const [period, dayName] = cellId.split("-");
        const dayMap: { [key: string]: number } = {
          mon: 1,
          tue: 2,
          wed: 3,
          thr: 4,
          fri: 5,
        };
        const key = `${selectedClass!.grade}-${selectedClass!.class}-${
          dayMap[dayName]
        }-${period}-${lesson.lessonId}`;
        originalEntries.add(key);
        if (!currentEntries.has(key)) {
          deleteEntries.push({
            grade: selectedClass!.grade,
            class: selectedClass!.class,
            day_of_week: dayMap[dayName],
            period: period,
            lesson_id: lesson.lessonId,
          });
        }
      });
    });

    // 新規作成エントリをフィルタ
    const filteredCreateEntries = createEntries.filter((entry) => {
      const key = `${entry.grade}-${entry.class}-${entry.day_of_week}-${entry.period}-${entry.lesson_id}`;
      return !originalEntries.has(key);
    });

    return {
      create: filteredCreateEntries,
      delete: deleteEntries,
    };
  };

  if(!selectedClass) return (<Alert variant="primary" className="mt-3">時間割を選択してください</Alert>);

  return (
    <Container>
      <EnrollmentModal lessonID={enrollmentLessonID} show={showEnrollmentModal} onHide={() => setEnrollmentModal(false)}></EnrollmentModal>
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="timetable-container">
          <div className="lessons-panel">
            <div className="mb-3">
              <Form.Group>
                <Form.Label>{t("filterByGrade")}</Form.Label>
                <Form.Select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                >
                  <option value="">{t("allGrades")}</option>
                  {getAvailableGrades().map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
            <h5>{t("available_lessons")}</h5>
            <DroppableLessons lessons={getFilteredLessons()} />

            <div className="mt-3">
              <h6>削除エリア</h6>
              <DeleteArea />
            </div>

            <div className="mt-3">
              <h6>履修登録エリア</h6>
              <EnrollmentArea />
            </div>

            <div className="mt-3">
              <Button
                variant="primary"
                onClick={saveTimetable}
                disabled={isSaving}
              >
                {isSaving ? "保存中..." : "時間割を保存"}
              </Button>

              {isSaving && (
                <div className="mt-2">
                  <ProgressBar
                    now={
                      saveProgress.total > 0
                        ? (saveProgress.completed / saveProgress.total) * 100
                        : 0
                    }
                    label={`${saveProgress.completed}/${saveProgress.total}`}
                  />
                </div>
              )}

              {saveError && (
                <Alert variant="danger" className="mt-2">
                  {saveError}
                </Alert>
              )}
            </div>
          </div>

          <div className="timetable-panel">
            <Table bordered className="timetable">
              <thead>
                <tr>
                  <th>{t("period")}</th>
                  <th>{t("monday")}</th>
                  <th>{t("tuesday")}</th>
                  <th>{t("wednesday")}</th>
                  <th>{t("thursday")}</th>
                  <th>{t("friday")}</th>
                </tr>
              </thead>
              <tbody>
                {periods.map((period) => (
                  <tr key={period.period}>
                    <td className="period-cell">
                      <div>{period.period}</div>
                      <small>
                        {period.start_time} - {period.end_time}
                      </small>
                    </td>
                    {weekdays.map((day) => {
                      const cellId = `${period.period}-${day}`;
                      return (
                        <td key={cellId} className="timetable-td">
                          <DroppableCell
                            cellId={cellId}
                            cell={timetable[cellId]}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>

        <DragOverlay>{getDragOverlay()}</DragOverlay>
      </DndContext>

      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t("success")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{t("timetableSavedSuccessfully")}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowSuccessModal(false)}>
            {t("ok")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TableBody;
