const attendanceModel = require("../models/attendance.model");
const { errorHandle } = require("../services/errorHandle");
const { formatResponse } = require("../services/format");

async function createAttendances(req, res) {
  const tenantID = req.tenant_id;
  const attendances = req.body;

  if (!Array.isArray(attendances)) {
    return errorHandle("BAD_REQUEST", 400);
  }

  try {
    await attendanceModel.createAttendances(tenantID, attendances);
    return res.status(201).json({ result: "SUCCESS" });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
}

async function getAttendanceByLesson(req, res) {
  const tenantID = req.tenant_id;
  const lessonID = req.params.lesson_id;
  const statistics = req.query.statistics === 'true';
  
  if (!tenantID || !lessonID) return res.status(400).json({ result: "ERROR", message: "BAD_REQUEST" });

  try {
    const result = await attendanceModel.getAttendanceByLesson(tenantID, lessonID, statistics);
    return res.json(result);
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ result: "ERROR", message: error.message });
  }
}

async function getAttendanceByStudentLesson(req, res) {
  const tenantID = req.tenant_id;
  const { student_id, lesson_id } = req.body;
  const { date_range } = req.query;
  
  if (!tenantID || !student_id || !lesson_id) {
    return res.status(400).json({ result: "ERROR", message: "BAD_REQUEST" });
  }

  try {
    const result = await attendanceModel.getAttendanceByStudentLesson(tenantID, student_id, lesson_id, date_range);
    return res.json({ result: "SUCCESS", data: result });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ result: "ERROR", message: error.message });
  }
}

async function getAttendanceInDate(req, res) {
  const tenantID = req.tenant_id;
  const lessonID = req.params.lesson_id;

  const { date, period } = req.query;

  if (!tenantID || !date || !period) return errorHandle("BAD_REQUEST", 400);

  try {
    const result = await attendanceModel.getAttendanceInDate(
      tenantID,
      lessonID,
      date,
      period
    );

    return res.json(formatResponse(result));
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
}

async function patchAttendances(req, res) {
  const tenantID = req.tenant_id;
  const attendances = req.body;

  if (!Array.isArray(attendances)) {
    return errorHandle("BAD_REQUEST", 400);
  }

  try {
    await attendanceModel.patchAttendances(tenantID, attendances);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
}

async function deleteAttendance(req, res) {
  const tenantID = req.tenant_id;
  const enrollmentID = req.params.enrollment_id;
  const { date, period } = req.query;

  if (!tenantID || !enrollmentID || !date || !period)
    return errorHandle("BAD_REQUEST", 400);

  try {
    const result = await attendanceModel.deleteAttendance(
      tenantID,
      enrollmentID,
      date,
      period
    );
    return res.json(formatResponse(result));
  } catch {
    return res.json({
      success: false,
      message: error.message,
      status: error.status,
    });
  }
}

module.exports = {
  createAttendances,
  getAttendanceInDate,
  getAttendanceByLesson,
  getAttendanceByStudentLesson,
  patchAttendances,
  deleteAttendance,
};
