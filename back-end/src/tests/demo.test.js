const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const agent = new https.Agent({
    rejectUnauthorized: false
});

const BASE_URL = 'https://localhost:3000/api';
const API_KEY = process.env.SERVICES_API_KEY || 'Yukki';

describe('デモデータ挿入テスト', () => {
    let teacherToken = '';
    let lessonIds = [];

    beforeAll(async () => {
        // テナント作成
        await axios.post(`${BASE_URL}/admin/tenant`, {
            tenant_id: 'demo_school',
            tenant_name: 'デモ学校',
            tenant_name_en: 'Demo School'
        }, {
            headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
            httpsAgent: agent
        });

        // 先生作成
        await axios.post(`${BASE_URL}/admin/teacher/signup`, {
            tenant_id: 'demo_school',
            teacher_id: 'demo_teacher',
            password: 'password',
            manager: true
        }, {
            headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
            httpsAgent: agent
        });

        // 先生ログイン
        const loginRes = await axios.post(`${BASE_URL}/teacher/login`, {
            tenant_id: 'demo_school',
            teacher_id: 'demo_teacher',
            teacher_password: 'password'
        }, { httpsAgent: agent });
        teacherToken = loginRes.data.token.access_token;
    });

    it('時間枠を作成', async () => {
        const timeSlots = [
            { period: '1', start_time: '08:30:00', end_time: '09:20:00' },
            { period: '2', start_time: '09:30:00', end_time: '10:20:00' },
            { period: '3', start_time: '10:30:00', end_time: '11:20:00' },
            { period: '4', start_time: '11:30:00', end_time: '12:20:00' },
            { period: '5', start_time: '13:20:00', end_time: '14:10:00' },
            { period: '6', start_time: '14:20:00', end_time: '15:10:00' }
        ];

        const response = await axios.post(`${BASE_URL}/period/`, timeSlots, {
            headers: { 'Authorization': `Bearer ${teacherToken}`, 'Content-Type': 'application/json' },
            httpsAgent: agent
        });
        expect(response.status).toBe(201);
    });

    it('クラスを作成', async () => {
        const classes = [
            { grade: '1', class: 'A', teacher_id: 'demo_teacher' },
            { grade: '1', class: 'B', teacher_id: 'demo_teacher' },
            { grade: '2', class: 'A', teacher_id: 'demo_teacher' }
        ];

        for (const cls of classes) {
            const response = await axios.post(`${BASE_URL}/class/`, cls, {
                headers: { 'Authorization': `Bearer ${teacherToken}`, 'Content-Type': 'application/json' },
                httpsAgent: agent
            });
            expect(response.status).toBe(201);
        }
    });

    it('生徒を作成', async () => {
        const students = [
            { student_id: 'student001', student_password: 'password', grade: '1', class: 'A', number: 1 },
            { student_id: 'student002', student_password: 'password', grade: '1', class: 'A', number: 2 },
            { student_id: 'student003', student_password: 'password', grade: '1', class: 'B', number: 1 },
            { student_id: 'student004', student_password: 'password', grade: '2', class: 'A', number: 1 }
        ];

        const response = await axios.post(`${BASE_URL}/student/`, students, {
            headers: { 'Authorization': `Bearer ${teacherToken}`, 'Content-Type': 'application/json' },
            httpsAgent: agent
        });
        expect(response.status).toBe(201);
    });

    it('授業を作成', async () => {
        const lessons = [
            { lesson_name: '数学', lesson_name_en: 'Mathematics', teacher_id: 'demo_teacher' },
            { lesson_name: '国語', lesson_name_en: 'Japanese', teacher_id: 'demo_teacher' },
            { lesson_name: '英語', lesson_name_en: 'English', teacher_id: 'demo_teacher' }
        ];

        const response = await axios.post(`${BASE_URL}/lesson`, lessons, {
            headers: { 'Authorization': `Bearer ${teacherToken}`, 'Content-Type': 'application/json' },
            httpsAgent: agent
        });
        expect(response.status).toBe(201);

        // 作成された授業IDを取得
        const lessonsRes = await axios.get(`${BASE_URL}/lesson/all`, {
            headers: { 'Authorization': `Bearer ${teacherToken}` },
            httpsAgent: agent
        });
        lessonIds = lessonsRes.data.data.map(lesson => lesson.lesson_id);
    });

    it('時間割を作成', async () => {
        const timetables = [
            { grade: '1', class: 'A', period: '1', lesson_id: lessonIds[0], day_of_week: 1 },
            { grade: '1', class: 'A', period: '2', lesson_id: lessonIds[1], day_of_week: 1 },
            { grade: '1', class: 'B', period: '1', lesson_id: lessonIds[2], day_of_week: 1 },
            { grade: '2', class: 'A', period: '1', lesson_id: lessonIds[0], day_of_week: 2 }
        ];

        for (const timetable of timetables) {
            const response = await axios.post(`${BASE_URL}/timetable/`, timetable, {
                headers: { 'Authorization': `Bearer ${teacherToken}`, 'Content-Type': 'application/json' },
                httpsAgent: agent
            });
            expect(response.status).toBe(201);
        }
    });

    it('履修登録を作成', async () => {
        const enrollments = [
            { lesson_id: lessonIds[0], student_id: 'student001' },
            { lesson_id: lessonIds[1], student_id: 'student001' },
            { lesson_id: lessonIds[0], student_id: 'student002' },
            { lesson_id: lessonIds[2], student_id: 'student003' },
            { lesson_id: lessonIds[0], student_id: 'student004' }
        ];

        const response = await axios.post(`${BASE_URL}/enrollment/`, enrollments, {
            headers: { 'Authorization': `Bearer ${teacherToken}`, 'Content-Type': 'application/json' },
            httpsAgent: agent
        });
        expect(response.status).toBe(201);
    });

    it('出席情報を作成', async () => {
        const today = new Date().toISOString().split('T')[0];
        const attendances = [
            { student_id: 'student001', lesson_id: lessonIds[0], date: today, period: 1, status: 1, notes: '出席' },
            { student_id: 'student002', lesson_id: lessonIds[0], date: today, period: 1, status: 2, notes: '遅刻' },
            { student_id: 'student001', lesson_id: lessonIds[1], date: today, period: 2, status: 1, notes: '出席' },
            { student_id: 'student003', lesson_id: lessonIds[2], date: today, period: 1, status: 0, notes: '欠席' },
            { student_id: 'student004', lesson_id: lessonIds[0], date: today, period: 1, status: 1, notes: '出席' }
        ];

        for (const attendance of attendances) {
            const response = await axios.post(`${BASE_URL}/attendance/`, attendance, {
                headers: { 'Authorization': `Bearer ${teacherToken}`, 'Content-Type': 'application/json' },
                httpsAgent: agent
            });
            expect(response.status).toBe(201);
        }
    });

    afterAll(async () => {
        // テナント削除（関連データも削除される）
        await axios.delete(`${BASE_URL}/admin/tenant/demo_school`, {
            headers: { 'x-api-key': API_KEY },
            httpsAgent: agent
        });
    });
});