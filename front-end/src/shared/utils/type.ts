export type Teacher = {
    tenant_id: string;
    teacher_id: string;
    manager: boolean;
    password?: string;
}

export type Class = {
  teacher_id: string;
  grade: string;
  class: string;
}

export type EditTeacher = {
  tenant_id: string;
  teacher_id: string;
  teacher_password: string;
  manager: boolean;
}

export type StudentCreateData = {
  student_id: string;
  grade: string;
  class: string;
  number: number;
  password: string;
  course_name: string | null;
  course_name_en: string | null;
};

export type StudentUpdateData = {
  password?: string | null;
  grade?: string;
  class?: string;
  number?: number;
  course_id?: string | null;
};

export type PeriodTimes = {
  period: string;
  start_time: string;
  end_time: string;
};

export type Lesson = {
  lesson_id: string;
  teacher_id: string;
  grade: string;
  lesson_name: string;
  lesson_name_en: string;
};

export type Student = {
  student_id: string;
  number: number;
  last_name: string;
  first_name: string;
  grade: string;
  class: string;
};

export type Attendance = {
  id?: number;
  enrollment_id: string;
  student_id: string;
  date: string;
  period: string;
  status: number;
  notes?: string;
};

export type Enrollment = {
  enrollment_id: string;
  student_id: string;
  lesson_id: string;
  status: number;
};

export type TimetableEntry = {
  day_of_week: number;
  period: string;
  lesson_id: string;
  lesson_name: string;
  lesson_name_en: string;
};

export type Period = {
  period: string;
  start_time: string;
  end_time: string;
};

export const ATTENDANCE_STATUS = {
  0: { text: '欠席', color: 'danger' },
  1: { text: '出席', color: 'success' },
  2: { text: '遅刻', color: 'warning' },
  3: { text: '早退', color: 'info' },
  4: { text: '出席停止', color: 'secondary' },
  5: { text: '公欠', color: 'primary' },
  6: { text: 'その他', color: 'dark' },
} as const;
