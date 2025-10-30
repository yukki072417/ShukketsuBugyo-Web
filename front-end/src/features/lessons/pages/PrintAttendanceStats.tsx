import React, { useState, useEffect } from 'react';
import { Button, ButtonGroup, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { getAttendanceStatistics } from '../../../shared/api/attendance';
import { getLesson } from '../../../shared/api/lessons';

interface PrintAttendanceStatsProps {
  lessonId: string;
}

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

const PrintAttendanceStats: React.FC<PrintAttendanceStatsProps> = ({ lessonId }) => {
  const { t, i18n } = useTranslation('lesson');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AttendanceData | null>(null);
  const [lessonData, setLessonData] = useState<any>(null);

  useEffect(() => {
    if (lessonId) {
      fetchData();
    }
  }, [lessonId]);

  const fetchData = async () => {
    try {
      const [attendanceResult, lessonResult] = await Promise.all([
        getAttendanceStatistics(lessonId),
        getLesson(lessonId)
      ]);
      setData(attendanceResult);
      setLessonData(lessonResult.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const exportToCSV = () => {
    if (!data || !lessonData) return;
    
    setLoading(true);
    try {
      const lessonName = i18n.language === 'en' ? lessonData.lesson_name_en : lessonData.lesson_name;
      
      const csvContent = [
        [t('lesson_name'), lessonName],
        [t('total_lessons'), data.lesson_count],
        [t('average_attendance_rate'), `${data.average_attendance_rate}%`],
        [],
        [t('student_id'), t('attendance_count'), t('total_lessons'), t('attendance_rate')],
        ...data.student_statistics.map((student: StudentStatistic) => [
          student.student_id,
          student.attendance_count,
          student.total_lessons,
          `${student.attendance_rate}%`
        ])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${lessonName}_${t('attendance_statistics')}.csv`;
      link.click();
    } catch (error) {
      console.error('CSV export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const printReport = () => {
    if (!data || !lessonData) return;
    
    setLoading(true);
    try {
      const lessonName = i18n.language === 'en' ? lessonData.lesson_name_en : lessonData.lesson_name;
      
      const printContent = `
        <html>
          <head>
            <title>${lessonName} - ${t('attendance_statistics')}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; }
              table { border-collapse: collapse; width: 100%; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .summary { margin: 20px 0; }
            </style>
          </head>
          <body>
            <h1>${lessonName}</h1>
            <h2>${t('attendance_statistics')}</h2>
            <div class="summary">
              <p><strong>${t('total_lessons')}:</strong> ${data.lesson_count}</p>
              <p><strong>${t('average_attendance_rate')}:</strong> ${data.average_attendance_rate}%</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>${t('student_id')}</th>
                  <th>${t('attendance_count')}</th>
                  <th>${t('total_lessons')}</th>
                  <th>${t('attendance_rate')}</th>
                </tr>
              </thead>
              <tbody>
                ${data.student_statistics.map((student: StudentStatistic) => `
                  <tr>
                    <td>${student.student_id}</td>
                    <td>${student.attendance_count}</td>
                    <td>${student.total_lessons}</td>
                    <td>${student.attendance_rate}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (error) {
      console.error('Print failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ButtonGroup>
      <Button 
        variant="success" 
        onClick={exportToCSV}
        disabled={loading || !data}
      >
        {loading ? <Spinner size="sm" /> : <span className="material-icons me-1">download</span>}
        CSV
      </Button>
      <Button 
        variant="primary" 
        onClick={printReport}
        disabled={loading || !data}
      >
        {loading ? <Spinner size="sm" /> : <span className="material-icons me-1">print</span>}
        Print
      </Button>
    </ButtonGroup>
  );
};

export default PrintAttendanceStats;