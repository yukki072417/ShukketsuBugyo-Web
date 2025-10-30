import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

interface TimetableEntry {
  grade: string;
  class: string;
  period: string;
  lesson_id: string;
  day_of_week: number;
}

interface TimetableApiResponse {
  success: boolean;
  data: {
    day_of_week: number;
    period: string;
    lesson_name: string;
    lesson_name_en: string;
  }[];
}

export const saveTimetableEntry = async (entry: TimetableEntry) => {
  const token = localStorage.getItem('token');
  return await axios.post(`${API_URL}/api/timetable/`, entry, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
};

export const saveTimetableBatch = async (
  entries: TimetableEntry[],
  onProgress?: (progress: { completed: number; total: number }) => void
) => {
  const results = [];
  
  for (let i = 0; i < entries.length; i++) {
    const result = await saveTimetableEntry(entries[i]);
    results.push(result);
    onProgress?.({ completed: i + 1, total: entries.length });
  }
  
  return { success: true, results };
};

export const getTimetable = async (grade: string, className: string): Promise<TimetableApiResponse> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/api/timetable?grade=${grade}&class=${className}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.data;
};

export const createTimetableEntry = async (entry: TimetableEntry) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/api/timetable/`, entry, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const deleteTimetableEntry = async (entry: TimetableEntry) => {
  const token = localStorage.getItem('token');
  const response = await axios.delete(`${API_URL}/api/timetable/?grade=${entry.grade}&class=${entry.class}&period=${entry.period}&day_of_week=${entry.day_of_week}&lesson_id=${entry.lesson_id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};