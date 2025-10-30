import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

type AttendanceRecord = {
  lesson_id: string;
  student_id: string;
  date: string; // YYYY-MM-DD
  period: number;
  status: number;
  notes?: string;
};

export async function getAttendanceTimetable(grade: string, className: string) {
  const token: string | null = localStorage.getItem("token");
  if (!token) throw new Error("認証トークンがありません");
  try {
    const response = await axios.get(
      API_URL + `/api/timetable?grade=${grade}&class=${className}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("API Error Details:", error.response);
    throw error;
  }
}

export async function getAttendanceForClass(
  lesson_id: string,
  date: string,
  period: number,
  grade: string,
  class_name: string
) {
  const token: string | null = localStorage.getItem("token");
  if (!token) throw new Error("認証トークンがありません");
  try {
    const response = await axios.get(
      API_URL +
        `/api/attendance/${lesson_id}?date=${date}&period=${period}&grade=${grade}&class=${class_name}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("API Error Details:", error.response);
    throw error;
  }
}

export async function createAttendance(attendance: AttendanceRecord) {
  const token: string | null = localStorage.getItem("token");
  if (!token) {
    throw new Error("認証トークンがありません");
  }

  try {
    const response = await axios.post(API_URL + "/api/attendance", attendance, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("API Error Details:", error.response);
    throw error;
  }
}

export async function updateAttendance(attendance: AttendanceRecord) {
  const token: string | null = localStorage.getItem("token");
  if (!token) {
    throw new Error("認証トークンがありません");
  }

  try {
    const { lesson_id, student_id, date, period } = attendance;
    const response = await axios.patch(
      API_URL +
        `/api/attendance/${lesson_id}?date=${date}&period=${period}&student_id=${student_id}`,
      attendance,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("API Error Details:", error.response);
    throw error;
  }
}
export async function getEnrollmentsByLesson(lessonId: string) {
  const token: string | null = localStorage.getItem("token");
  if (!token) throw new Error("認証トークンがありません");
  try {
    const response = await axios.get(
      API_URL + `/api/enrollment?lesson_id=${lessonId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error: any) {
    console.error("API Error Details:", error.response);
    throw error;
  }
}

export async function getAttendanceByDate(lessonId: string, date: string, period: string) {
  const token: string | null = localStorage.getItem("token");
  if (!token) throw new Error("認証トークンがありません");
  try {
    const response = await axios.get(
      API_URL + `/api/attendance/date/${lessonId}?date=${date}&period=${period}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { data: [] };
    }
    console.error("API Error Details:", error.response);
    throw error;
  }
}

export async function createBulkAttendance(attendanceList: any[]) {
  const token: string | null = localStorage.getItem("token");
  if (!token) throw new Error("認証トークンがありません");
  try {
    const response = await axios.post(API_URL + "/api/attendance", attendanceList, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("API Error Details:", error.response);
    throw error;
  }
}

export async function updateBulkAttendance(attendanceList: any[]) {
  const token: string | null = localStorage.getItem("token");
  if (!token) throw new Error("認証トークンがありません");
  try {
    const response = await axios.patch(API_URL + "/api/attendance", attendanceList, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("API Error Details:", error.response);
    throw error;
  }
}

export async function getAttendanceStatistics(lessonId: string) {
  const token: string | null = localStorage.getItem("token");
  if (!token) throw new Error("認証トークンがありません");
  try {
    const response = await axios.get(
       `${API_URL}/api/attendance/id/${lessonId}?statistics=true`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error("API Error Details:", error.response);
    throw error;
  }
}

export async function getStudentLessonAttendance(studentId: string, lessonId: string, dateRange: string = 'all') {
  const token: string | null = localStorage.getItem("token");
  if (!token) throw new Error("認証トークンがありません");
  try {
    const response = await axios.post(
      `${API_URL}/api/attendance/student-lesson?date_range=${dateRange}`,
      {
        student_id: studentId,
        lesson_id: lessonId
      },
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("API Error Details:", error.response);
    throw error;
  }
}