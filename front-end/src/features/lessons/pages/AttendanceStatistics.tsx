import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Spinner,
  Badge,
  ProgressBar,
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { getAttendanceStatistics } from "../../../shared/api/attendance";
import { getLesson } from "../../../shared/api/lessons";
import AttendanceList from "../components/AttendanceList";
import PrintAttendanceModal from "../components/PrintAttendanceModal";
import ExportModal from "../components/ExportModal";
import * as XLSX from "xlsx";
import { loadTemplate, replaceTemplateVariables, printHTML } from "../../../utils/printTemplate";

interface StudentStatistic {
  student_id: string;
  attendance_count: number;
  total_lessons: number;
  attendance_rate: number;
}

interface AttendanceData {
  lesson_count: number;
  student_statistics: StudentStatistic[];
  average_attendance_rate: number;
}

const AttendanceStatistics = () => {
  const { t, i18n } = useTranslation("lesson");
  const [data, setData] = useState<AttendanceData | null>(null);
  const [lessonData, setLessonData] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const lessonID: string = location.href.split("?")[1];

  async function fetchAttendances() {
    try {
      const result = await getAttendanceStatistics(lessonID);
      setData(result);
    } catch (error) {
      console.error("Failed to fetch attendance statistics:", error);
    }
  }

  async function fetchLessonData() {
    try {
      const lesson = await getLesson(lessonID);
      setLessonData(lesson.data);
    } catch (error) {
      console.error("Failed to fetch lesson data:", error);
    }
  }

  useEffect(() => {
    if (lessonID) {
      fetchAttendances();
      fetchLessonData();
    }
  }, [lessonID]);

  const getLessonName = () => {
    if (!lessonData) return t("loading");
    return i18n.language === "en"
      ? lessonData.lesson_name_en
      : lessonData.lesson_name;
  };

  const handleShowAttendance = (studentId: string) => {
    setSelectedStudentId(studentId);
    setShowModal(true);
  };

  const handlePrintAttendance = (studentId: string) => {
    setSelectedStudentId(studentId);
    setShowPrintModal(true);
  };

  const handleExport = async (type: "csv" | "excel" | "print") => {
    if (!data) return;

    const fileName = `${getLessonName()}_${t("attendance_statistics")}`;

    switch (type) {
      case "csv":
        const csvContent = [
          [
            t("student_id"),
            t("attendance_count"),
            t("total_lessons"),
            t("attendance_rate"),
            t("promotion_status"),
          ],
          ...data.student_statistics.map((student) => [
            student.student_id,
            student.attendance_count,
            student.total_lessons,
            `${student.attendance_rate}%`,
            student.attendance_rate < 66.67
              ? t("cannot_promote")
              : t("can_promote"),
          ]),
        ]
          .map((row) => row.join(","))
          .join("\n");
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}.csv`;
        link.click();
        break;

      case "excel":
        const ws = XLSX.utils.json_to_sheet(
          data.student_statistics.map((student) => ({
            [t("student_id")]: student.student_id,
            [t("attendance_count")]: student.attendance_count,
            [t("total_lessons")]: student.total_lessons,
            [t("attendance_rate")]: `${student.attendance_rate}%`,
            [t("promotion_status")]:
              student.attendance_rate < 66.67
                ? t("cannot_promote")
                : t("can_promote"),
          }))
        );
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, t("attendance_statistics"));
        XLSX.writeFile(wb, `${fileName}.xlsx`);
        break;

      case "print":
        try {
          const template = await loadTemplate('attendance-statistics');
          const studentRows = data.student_statistics.map(student => `
            <tr>
              <td>${student.student_id}</td>
              <td>${student.attendance_count}</td>
              <td>${student.total_lessons}</td>
              <td>${student.attendance_rate}%</td>
              <td class="${student.attendance_rate < 66.67 ? 'status-fail' : 'status-pass'}">
                ${student.attendance_rate < 66.67 ? t("cannot_promote") : t("can_promote")}
              </td>
            </tr>
          `).join('');
          
          const variables = {
            LANGUAGE: i18n.language,
            LESSON_NAME: getLessonName(),
            ATTENDANCE_STATISTICS: t("attendance_statistics"),
            PRINT_DATE: new Date().toLocaleDateString(),
            TOTAL_LESSONS: t("total_lessons"),
            LESSON_COUNT: data.lesson_count.toString(),
            TIMES: t("times"),
            AVERAGE_ATTENDANCE_RATE: t("average_attendance_rate"),
            AVERAGE_RATE: data.average_attendance_rate.toString(),
            STUDENT_ATTENDANCE_STATUS: t("student_attendance_status"),
            STUDENT_ID: t("student_id"),
            ATTENDANCE_COUNT: t("attendance_count"),
            ATTENDANCE_RATE: t("attendance_rate"),
            PROMOTION_STATUS: t("promotion_status"),
            STUDENT_ROWS: studentRows
          };
          
          const printContent = replaceTemplateVariables(template, variables);
          printHTML(printContent);
        } catch (error) {
          const fallbackContent = `<!DOCTYPE html><html><head><title>${getLessonName()}</title><style>body{font-family:Arial,sans-serif;margin:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px}.status-pass{color:#28a745;font-weight:600}.status-fail{color:#dc3545;font-weight:600}</style></head><body><h1>${getLessonName()}</h1><h2>${t("attendance_statistics")}</h2><table><thead><tr><th>${t("student_id")}</th><th>${t("attendance_count")}</th><th>${t("total_lessons")}</th><th>${t("attendance_rate")}</th><th>${t("promotion_status")}</th></tr></thead><tbody>${data.student_statistics.map(s => `<tr><td>${s.student_id}</td><td>${s.attendance_count}</td><td>${s.total_lessons}</td><td>${s.attendance_rate}%</td><td class="${s.attendance_rate < 66.67 ? 'status-fail' : 'status-pass'}">${s.attendance_rate < 66.67 ? t("cannot_promote") : t("can_promote")}</td></tr>`).join('')}</tbody></table></body></html>`;
          printHTML(fallbackContent);
        }
        break;
    }
  };

  if (!data) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "50vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  const getAttendanceVariant = (rate: number) => {
    if (rate >= 90) return "success";
    if (rate >= 70) return "warning";
    return "danger";
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="text-center">
            <h1 className="mb-2">{getLessonName()}</h1>
            <h3 className="text-muted mb-3">
              <span
                className="material-icons me-2"
                style={{ verticalAlign: "middle" }}
              >
                analytics
              </span>
              {t("attendance_statistics")}
            </h3>
            <Button
              variant="outline-primary"
              onClick={() => setShowExportModal(true)}
            >
              <span
                className="material-icons me-1"
                style={{ fontSize: "14px" }}
              >
                download
              </span>
              {t("export_data")}
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <Card.Title className="text-primary">
                <span className="material-icons me-2">school</span>
                {t("total_lessons")}
              </Card.Title>
              <h3 className="display-4 text-primary">{data.lesson_count}</h3>
              <small className="text-muted">{t("times")}</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <Card.Title className="text-success">
                <span className="material-icons me-2">trending_up</span>
                {t("average_attendance_rate")}
              </Card.Title>
              <h3 className="display-4 text-success">
                {data.average_attendance_rate}%
              </h3>
              <ProgressBar
                variant={getAttendanceVariant(data.average_attendance_rate)}
                now={data.average_attendance_rate}
                className="mt-2"
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">
                <span
                  className="material-icons me-2"
                  style={{ verticalAlign: "middle" }}
                >
                  groups
                </span>
                {t("student_attendance_status")}
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive striped hover className="mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>{t("student_id")}</th>
                    <th>{t("attendance_count")}</th>
                    <th>{t("total_lessons")}</th>
                    <th>{t("attendance_rate")}</th>
                    <th>{t("promotion_status")}</th>
                    <th>{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.student_statistics.map((student) => (
                    <tr key={student.student_id}>
                      <td className="fw-bold">{student.student_id}</td>
                      <td>{student.attendance_count}</td>
                      <td>{student.total_lessons}</td>
                      <td style={{ width: "200px" }}>
                        <ProgressBar
                          variant={getAttendanceVariant(
                            student.attendance_rate
                          )}
                          now={student.attendance_rate}
                          label={`${student.attendance_rate}%`}
                          style={{ height: "20px" }}
                        />
                      </td>
                      <td>
                        <Badge
                          bg={
                            student.attendance_rate < 66.67
                              ? "danger"
                              : "success"
                          }
                        >
                          {student.attendance_rate < 66.67
                            ? t("cannot_promote")
                            : t("can_promote")}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          className="ms-2"
                          size="sm"
                          variant="outline-primary"
                          onClick={() =>
                            handleShowAttendance(student.student_id)
                          }
                        >
                          {t("show_attendance")}
                        </Button>
                        <Button
                          className="ms-2"
                          size="sm"
                          variant="outline-secondary"
                          onClick={() =>
                            handlePrintAttendance(student.student_id)
                          }
                        >
                          <span
                            className="material-icons me-1"
                            style={{ fontSize: "14px" }}
                          >
                            download
                          </span>
                          {t("export_data")}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <AttendanceList
        show={showModal}
        onHide={() => setShowModal(false)}
        lessonId={lessonID}
        studentId={selectedStudentId}
      />

      <PrintAttendanceModal
        show={showPrintModal}
        onHide={() => setShowPrintModal(false)}
        lessonId={lessonID}
        studentId={selectedStudentId}
        lessonName={getLessonName()}
      />

      <ExportModal
        show={showExportModal}
        onHide={() => setShowExportModal(false)}
        onExport={handleExport}
        title={`${getLessonName()} - ${t("attendance_statistics")}`}
      />
    </Container>
  );
};

export default AttendanceStatistics;
