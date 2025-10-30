import React, { useEffect, useState } from 'react';
import { Modal, Table, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { getStudentLessonAttendance } from '../../../shared/api/attendance';

interface AttendanceListProps {
  show: boolean;
  onHide: () => void;
  lessonId: string;
  studentId: string;
}

interface AttendanceRecord {
  date: string;
  period: number;
  student_id: string;
  status: number;
  notes: string;
}

const AttendanceList: React.FC<AttendanceListProps> = ({ show, onHide, lessonId, studentId }) => {
  const { t, i18n } = useTranslation('lessonStats');
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const statusLabels = {
    0: t('absent'),
    1: t('present'),
    2: t('late'),
    3: t('early_leave'),
    4: t('suspended'),
    5: t('official_absence'),
    6: t('other')
  };

  const getStatusVariant = (status: number) => {
    switch (status) {
      case 1: return 'success';
      case 2: case 3: return 'warning';
      case 0: return 'danger';
      default: return 'secondary';
    }
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
    if (show && lessonId) {
      fetchAttendanceData();
    }
  }, [show, lessonId]);

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

  return (
    <Modal show={show} onHide={onHide} size="lg" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>{t('attendance_details')} - {studentId}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
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
                      <span className={`badge bg-${getStatusVariant(record.status)}`}>
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
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AttendanceList;