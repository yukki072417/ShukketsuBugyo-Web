import React, { useEffect, useState } from 'react';
import { Modal, Button, Table, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { getStudentLessonAttendance } from '../../../shared/api/attendance';
import ExportModal from './ExportModal';
import * as XLSX from 'xlsx';
import { loadTemplate, replaceTemplateVariables, printHTML } from '../../../utils/printTemplate';

interface PrintAttendanceModalProps {
  show: boolean;
  onHide: () => void;
  lessonId: string;
  studentId: string;
  lessonName: string;
}

interface AttendanceRecord {
  date: string;
  period: number;
  status: number;
  notes: string;
}

const PrintAttendanceModal: React.FC<PrintAttendanceModalProps> = ({ 
  show, onHide, lessonId, studentId, lessonName 
}) => {
  const { t, i18n } = useTranslation('lessonStats');
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const statusLabels = {
    0: t('absent'),
    1: t('present'),
    2: t('late'),
    3: t('early_leave'),
    4: t('suspended'),
    5: t('official_absence'),
    6: t('other')
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'en' ? 'en-US' : 'ja-JP';
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short'
    });
  };

  useEffect(() => {
    if (show && lessonId && studentId) {
      fetchAttendanceData();
    }
  }, [show, lessonId, studentId]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const result = await getStudentLessonAttendance(studentId, lessonId, 'all');
      setAttendanceData(result.data || []);
    } catch (error) {
      console.error('Failed to fetch attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'csv' | 'excel' | 'print') => {
    if (!attendanceData || attendanceData.length === 0) return;
    
    const fileName = `${lessonName}_${studentId}_${t('attendance_details')}`;
    
    switch (type) {
      case 'csv':
        const csvContent = [
          [t('date'), t('period'), t('status'), t('notes')],
          ...attendanceData.map(record => [
            formatDate(record.date),
            record.period,
            statusLabels[record.status as keyof typeof statusLabels] || t('unknown'),
            record.notes || '-'
          ])
        ].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}.csv`;
        link.click();
        break;
        
      case 'excel':
        const ws = XLSX.utils.json_to_sheet(attendanceData.map(record => ({
          [t('date')]: formatDate(record.date),
          [t('period')]: record.period,
          [t('status')]: statusLabels[record.status as keyof typeof statusLabels] || t('unknown'),
          [t('notes')]: record.notes || '-'
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
        XLSX.writeFile(wb, `${fileName}.xlsx`);
        break;
        
      case 'print':
        try {
          const template = await loadTemplate('student-attendance');
          const attendanceRows = attendanceData.map(record => {
            const statusClass = `status-${record.status === 1 ? 'present' : record.status === 0 ? 'absent' : record.status === 2 ? 'late' : record.status === 3 ? 'early-leave' : record.status === 4 ? 'suspended' : record.status === 5 ? 'official' : 'other'}`;
            return `
              <tr>
                <td>${formatDate(record.date)}</td>
                <td>${record.period}</td>
                <td class="${statusClass}">${statusLabels[record.status as keyof typeof statusLabels] || t('unknown')}</td>
                <td>${record.notes || '-'}</td>
              </tr>
            `;
          }).join('');
          
          const presentCount = attendanceData.filter(r => r.status === 1).length;
          const absentCount = attendanceData.filter(r => r.status === 0).length;
          const attendanceRate = attendanceData.length > 0 ? Math.round((presentCount / attendanceData.length) * 100) : 0;
          
          const variables = {
            LANGUAGE: i18n.language,
            LESSON_NAME: lessonName,
            STUDENT_ID: studentId,
            STUDENT_ID_LABEL: t('student_id'),
            ATTENDANCE_DETAILS: t('attendance_details'),
            PRINT_DATE: new Date().toLocaleDateString(),
            ATTENDANCE_SUMMARY: t('attendance_summary') || 'Attendance Summary',
            TOTAL_RECORDS: t('total_records') || 'Total Records',
            TOTAL_COUNT: attendanceData.length.toString(),
            PRESENT_COUNT: t('present_count') || 'Present',
            PRESENT_TOTAL: presentCount.toString(),
            ABSENT_COUNT: t('absent_count') || 'Absent',
            ABSENT_TOTAL: absentCount.toString(),
            ATTENDANCE_RATE: t('attendance_rate'),
            RATE_PERCENTAGE: attendanceRate.toString(),
            DETAILED_RECORDS: t('detailed_records') || 'Detailed Records',
            DATE: t('date'),
            PERIOD: t('period'),
            STATUS: t('status'),
            NOTES: t('notes'),
            ATTENDANCE_ROWS: attendanceRows
          };
          
          const printContent = replaceTemplateVariables(template, variables);
          printHTML(printContent);
        } catch (error) {
          const fallbackContent = `<!DOCTYPE html><html><head><title>${fileName}</title><style>body{font-family:Arial,sans-serif;margin:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px}.status-present{color:#28a745}.status-absent{color:#dc3545}</style></head><body><h1>${lessonName}</h1><h2>${t('student_id')}: ${studentId}</h2><table><thead><tr><th>${t('date')}</th><th>${t('period')}</th><th>${t('status')}</th><th>${t('notes')}</th></tr></thead><tbody>${attendanceData.map(r => `<tr><td>${formatDate(r.date)}</td><td>${r.period}</td><td class="status-${r.status === 1 ? 'present' : 'absent'}">${statusLabels[r.status as keyof typeof statusLabels] || t('unknown')}</td><td>${r.notes || '-'}</td></tr>`).join('')}</tbody></table></body></html>`;
          printHTML(fallbackContent);
        }
        break;
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          {t('print_attendance')} - {studentId}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <>
            <div className="mb-3 text-center">
              <Button 
                variant="outline-primary" 
                onClick={() => setShowExportModal(true)}
                disabled={attendanceData.length === 0}
              >
                <span className="material-icons me-1">download</span>
                {t('export_data')}
              </Button>
            </div>
            
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>{t('date')}</th>
                  <th>{t('period')}</th>
                  <th>{t('status')}</th>
                  <th>{t('notes')}</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.length > 0 ? (
                  attendanceData.map((record, index) => (
                    <tr key={index}>
                      <td>{formatDate(record.date)}</td>
                      <td>{record.period}</td>
                      <td>
                        <span className="badge bg-secondary">
                          {statusLabels[record.status as keyof typeof statusLabels] || t('unknown')}
                        </span>
                      </td>
                      <td>{record.notes || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center text-muted">
                      {t('no_attendance_data')}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </>
        )}
      </Modal.Body>
      
      <ExportModal 
        show={showExportModal}
        onHide={() => setShowExportModal(false)}
        onExport={handleExport}
        title={`${lessonName} - ${studentId}`}
      />
    </Modal>
  );
};

export default PrintAttendanceModal;