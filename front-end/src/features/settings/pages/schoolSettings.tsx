import { useState, type ReactElement } from 'react';
import { Container, ListGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import '../styles/schoolSettings.css';
import CourseSettings from '../components/settings/CourseSettings';
import StudentSettings from '../components/settings/StudentSettings';
import ClassSettings from '../components/settings/ClassSettings';
import PeriodSettings from '../components/settings/PeriodSettings';
import TeacherSettings from '../components/settings/TeacherSettings';

export default function SchoolSettings(): ReactElement {

  type Settings = 'studentSettings' | 'courseSettings' | 'periodSettings' | 'teacherSettings' | 'classSettings';

  const { t } = useTranslation('schoolSettings');
  const [selectedSettings, setSelectedSettings] = useState<Settings>('classSettings');

  const settingsList: () => ReactElement = () => {
    return (
      <ListGroup className='school-settings-list' defaultActiveKey="#class-settings">
        <ListGroup.Item onClick={() => setSelectedSettings('classSettings')}   action href="#class-settings">{t('class_settings')}</ListGroup.Item>
        <ListGroup.Item onClick={() => setSelectedSettings('studentSettings')} action href="#student-settings">{t('student_settings')}</ListGroup.Item>
        <ListGroup.Item onClick={() => setSelectedSettings('courseSettings')}  action href="#course-settings">{t('course_settings')}</ListGroup.Item>
        <ListGroup.Item onClick={() => setSelectedSettings('periodSettings')}  action href="#period-settings">{t('period_settings')}</ListGroup.Item>
        <ListGroup.Item onClick={() => setSelectedSettings('teacherSettings')} action href="#teacher-settings">{t('teacher_settings')}</ListGroup.Item>
      </ListGroup>
    );
  }

  return (
    <Container className='school-settings'>
      {settingsList()}
      {selectedSettings === 'studentSettings' && <StudentSettings />}
      {selectedSettings === 'courseSettings' && <CourseSettings />}
      {selectedSettings === 'classSettings' && <ClassSettings />}
      {selectedSettings === 'periodSettings' && <PeriodSettings />}
      {selectedSettings === 'teacherSettings' && <TeacherSettings />}
    </Container>
  );
}