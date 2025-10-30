const API_URL = import.meta.env.VITE_API_BASE_URL;

interface token {
    access_token: string,
    refresh_token: string
}

export async function login(tenantID: string, studentID: string, password: string): 
Promise<{result: string, token: token}>
{
    const peyload = JSON.stringify({
        tenant_id: tenantID,
        student_id: studentID,
        student_password: password
    });

    const response = await fetch(`${API_URL}/api/student/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: peyload
    });

    const json = await response.json();

    return json;
}