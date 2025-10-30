import axios from "axios";
import { type Lesson } from "../utils/type";
const API_URL = import.meta.env.VITE_API_BASE_URL;

export type CreateLesson = {
  lesson_name: string;
  lesson_name_en: string;
  teacher_id: string;
  grade: string;
}

export const createLesson = async (lesson: CreateLesson): Promise<any> => {
  const token: string | null = localStorage.getItem("token");
  if(!token) throw new Error("認証トークンがありません");

  try {
    const response = await axios.post(`${API_URL}/api/lesson`, [lesson], {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const getLesson = async (lessonID: string): Promise<any> => {
  const token: string | null = localStorage.getItem("token");
  if (!token) throw new Error("認証トークンがありません");  

  try {
    const response = await axios.get(`${API_URL}/api/lesson/one/${lessonID}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export const getLessons = async (): Promise<Lesson[]> => {
  const token: string | null = localStorage.getItem("token");
  if (!token) throw new Error("認証トークンがありません");
  try {
    const response = await axios.get(`${API_URL}/api/lesson/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if(response.data.data.length === 0) return [];

    const result: Lesson[] = response.data.data.map((lesson: Lesson) => {
      return {
        lesson_id: lesson.lesson_id,
        lesson_name: lesson.lesson_name,
        lesson_name_en: lesson.lesson_name_en,
        teacher_id: lesson.teacher_id,
        grade: lesson.grade,
      };
    });
  return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export const updateLesson = async (lesson: Lesson): Promise<void> => {
  const token: string | null = localStorage.getItem("token");
  if(!token) throw new Error("認証トークンがありません");

  try {
    const response = await axios.patch(`${API_URL}/api/lesson/${lesson.lesson_id}`, lesson, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export const deleteLesson = async (lesson: Lesson): Promise<void> => {
  const token: string | null = localStorage.getItem("token");
  if(!token) throw new Error("認証トークンがありません");

  try {
    const response = await axios.delete(`${API_URL}/api/lesson/${lesson.lesson_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}