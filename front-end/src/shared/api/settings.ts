import axios from "axios";
import { type EditTeacher, type PeriodTimes, type StudentCreateData, type StudentUpdateData } from "../utils/type";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export async function createTeacher(teacher: EditTeacher) {
  const token: string | null = localStorage.getItem("token");
  try {
    if (!token) throw new Error("認証トークンがありません");
    const response = await axios.post(API_URL + "/api/teacher/signup/", teacher, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("API Error Details:", error);
    throw error;
  }
}

export async function updateTeacher(teacherID: string, teacher: { password?: string; manager?: boolean }) {
  const token: string | null = localStorage.getItem('token');
  try {
    const response = await axios.patch(API_URL + `/api/teacher/${teacherID}`, teacher, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("API Error Details:", error);
    throw error;
  }
}

export async function deleteTeacher(teacherID: string) {
  const token: string | null = localStorage.getItem('token');
  try {
    const response = await axios.delete(API_URL + `/api/teacher/${teacherID}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("API Error Details:", error);
    throw error;
  }
}

// クラス関連
export async function createClass(
  teacherID: string,
  grade: string,
  className: string
) {
  const token: string | null = localStorage.getItem("token");
  if (!token) {
    throw new Error("認証トークンがありません");
  }

  const body = [
    {
      teacher_id: teacherID,
      grade,
      class: className,
    },
  ];

  try {
    const response = await axios.post(API_URL + "/api/class/", body, {
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

export async function updateClass(
  originalGrade: string,
  originalClass: string,
  updatedGrade: string,
  updatedClass: string,
  teacherID: string
) {
  const token: string | null = localStorage.getItem("token");
  if (!token) {
    throw new Error("認証トークンがありません");
  }

  const body = [
    {
      grade: originalGrade,
      class: originalClass,
      updated_grade: updatedGrade,
      updated_class: updatedClass,
      teacher_id: teacherID,
    },
  ];

  try {
    const response = await axios.patch(API_URL + `/api/class`, body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Update API Error Details:", error.response);
    throw error;
  }
}

export async function deleteClass(grade: string, className: string) {
  const token: string | null = localStorage.getItem("token");
  const response = await axios.delete(API_URL + `/api/class?grade=${grade}&class=${className}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
}

// コース関連
export async function createCourse(
  courses: { course_name: string; course_name_en: string }[]
) {
  const token: string | null = localStorage.getItem("token");
  if (!token) {
    throw new Error("認証トークンがありません");
  }

  try {
    const response = await axios.post(API_URL + "/api/course", courses, {
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

export async function getCourses() {
  const token: string | null = localStorage.getItem("token");
  if (!token) {
    throw new Error("認証トークンがありません");
  }
  try {
    const response = await axios.get(API_URL + "/api/course", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("API Error Details:", error.response);
    throw error;
  }
}

export async function updateCourse(
  course_id: string,
  course_name: string,
  course_name_en: string
) {
  const token: string | null = localStorage.getItem("token");
  if (!token) {
    throw new Error("認証トークンがありません");
  }

  const body = [{
    course_id,
    course_name,
    course_name_en
  }];

  try {
    const response = await axios.patch(
      API_URL + `/api/course`,
      body,
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

export async function deleteCourse(course_id: string) {
  const token: string | null = localStorage.getItem("token");
  if (!token) {
    throw new Error("認証トークンがありません");
  }
  try {
    const response = await axios.delete(API_URL + `/api/course/${course_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("API Error Details:", error.response);
    throw error;
  }
}

// 生徒関連
export async function createStudents(students: StudentCreateData[]) {
  const token: string | null = localStorage.getItem("token");
  if (!token) {
    throw new Error("認証トークンがありません");
  }

  try {
    const response = await axios.post(API_URL + "/api/student", students, {
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

export async function getStudents(limit: number, offset: number) {
  const token: string | null = localStorage.getItem("token");
  if (!token) throw new Error("認証トークンがありません");
  try {
    const response = await axios.get(
      API_URL + `/api/student/all?limit=${limit}&offset=${offset}`,
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

export async function getStudentsInClass(grade: string, className: string | undefined) {
  const token: string | null = localStorage.getItem("token");
  if (!token) throw new Error("認証トークンがありません");
  let URL;

  if(className == undefined){
    URL = API_URL + `/api/student/class?grade=all&class=all`;
  }else{
    URL = API_URL + `/api/student/class?grade=${grade}&class=${className}`;
  }

  try {
    const response = await axios.get(
      URL,
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

export async function updateStudent(student_id: string, studentData: StudentUpdateData) {
  const token: string | null = localStorage.getItem("token");
  if (!token) {
    throw new Error("認証トークンがありません");
  };

  try {
    const response = await axios.patch(
      API_URL + `/api/student/${student_id}`,
      studentData,
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

export async function deleteStudent(student_id: string) {
  const token: string | null = localStorage.getItem("token");
  if (!token) {
    throw new Error("認証トークンがありません");
  }
  try {
    const response = await axios.delete(API_URL + `/api/student/${student_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("API Error Details:", error.response);
    throw error;
  }
}

export async function getUnassignedStudents() {
  const token: string | null = localStorage.getItem("token");
  if (!token) throw new Error("認証トークンがありません");
  try {
    const response = await axios.get(API_URL + "/api/class/unassigned", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error("API Error Details:", error.response);
    throw error;
  }
}

// 時間割関連
export async function createPeriods(periods: PeriodTimes[]) {
  const token: string | null = localStorage.getItem("token");
  if (!token) {
    throw new Error("認証トークンがありません");
  }

  try {
    const formattedPeriods = periods.map(period => ({
      period: period.period,
      start_time: period.start_time.includes(':') && period.start_time.split(':').length === 2 
      ? period.start_time + ':00' 
      : period.start_time,
      end_time: period.end_time.includes(':') && period.end_time.split(':').length === 2 
      ? period.end_time + ':00' 
      : period.end_time
    }));
    
    const response = await axios.post(API_URL + "/api/period", formattedPeriods, {
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

export async function updatePeriod(currentPeriod: string, data: { period: string, start_time: string; end_time: string }) {
  const token: string | null = localStorage.getItem("token");
  if (!token) {
    throw new Error("認証トークンがありません");
  }
  try {
    const formattedData = {
      period: data.period,
      start_time: data.start_time.includes(':') && data.start_time.split(':').length === 2 
        ? data.start_time + ':00' 
        : data.start_time,
      end_time: data.end_time.includes(':') && data.end_time.split(':').length === 2 
        ? data.end_time + ':00' 
        : data.end_time
    };
    
    const response = await axios.patch(API_URL + `/api/period/${currentPeriod}`, formattedData, {
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

export async function deletePeriod(period: string) {
  const token: string | null = localStorage.getItem("token");
  if (!token) {
    throw new Error("認証トークンがありません");
  }
  try {
    const response = await axios.delete(API_URL + `/api/period/${period}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("API Error Details:", error.response);
    throw error;
  }
}