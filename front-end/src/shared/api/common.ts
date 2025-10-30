import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

// 認証関連
export async function login(
  tenant_id: string,
  teacher_id: string,
  teacher_password: string
) {
  const response = await axios.post(API_URL + "/api/teacher/login", {
    tenant_id,
    teacher_id,
    teacher_password,
  });
  return response.data;
}

export async function refreshToken() {
  const refreshToken: string | null = localStorage.getItem("refreshToken");
  const response = await axios.post(API_URL + "/api/auth/refresh", {
    refresh_token: refreshToken,
  });
  return response.data;
}

export async function verifyToken() {
  const token: string | null = localStorage.getItem("token");
  const response = await axios.post(API_URL + "/api/auth/verify", null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function whoami() {
  const token: string | null = localStorage.getItem("token");
  const response = await axios.get(API_URL + "/api/teacher/get/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function getTeachers() {
  const token: string | null = localStorage.getItem("token");
  const response = await axios.get(API_URL + "/api/teacher/get/all", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function getClasses() {
  const token: string | null = localStorage.getItem("token");
  const response = await axios.get(API_URL + "/api/class", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function getPeriods() {
  const token: string | null = localStorage.getItem("token");
  if (!token) throw new Error("認証トークンがありません");
  try {
    const response = await axios.get(API_URL + "/api/period", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error("API Error Details:", error.response);
    throw error;
  }
}