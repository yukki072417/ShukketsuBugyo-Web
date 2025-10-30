const db = require('./db')();
const { errorHandle } = require('../services/errorHandle');

async function createTimeslots(tenantID, timeslots) {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const exist = await getTimeslots(tenantID);
    const existingSlots = Array.isArray(exist.data) ? exist.data : [];

    const duplicates = timeslots.filter((ts) =>
      existingSlots.some((existing) => existing.PERIOD === ts.period)
    );

    if (duplicates.length > 0) {
      await connection.rollback();
      errorHandle(`DUPLICATE`, 409);
    }

    // 挿入処理（結果は後でまとめて確認）
    const results = [];
    for (const timeslot of timeslots) {
      const query = `
      INSERT INTO TIME_SLOTS (TENANT_ID, PERIOD, START_TIME, END_TIME)
      VALUES (?, ?, ?, ?)
      `;

      const values = [
        tenantID,
        timeslot.period,
        timeslot.start_time,
        timeslot.end_time,
      ];
      const [result] = await connection.query(query, values);
      results.push(result);
    }
    
    const allInserted = results.every((r) => r.affectedRows > 0);
    if (!allInserted) {
      await connection.rollback();
      errorHandle("INSERT_FAILED", 500);
    }
    
    await connection.commit();
    return { success: true, message: "ALL_INSERTED", status: 201 };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getTimeslots(tenantID) {
  try {
    const query = "SELECT * FROM TIME_SLOTS WHERE TENANT_ID = ?";
    const values = [tenantID];
    const result = await db.query(query, values);

    return { success: true, data: result[0], message: "SUCCESS", status: 200 }
  } catch (error) {
    throw error;
  }
}

async function patchTimeslots(tenantID, currentPeriod, updatedPeriod, startTime, endTime) {

  const connection = await db.getConnection();
  await connection.beginTransaction();
  try {
    const query =
      "UPDATE TIME_SLOTS SET PERIOD = ?, START_TIME = ?, END_TIME = ? WHERE TENANT_ID = ? AND PERIOD = ?";
    const values = [updatedPeriod, startTime, endTime, tenantID, currentPeriod];
    const result = await connection.query(query, values);

    connection.commit();
    return result[0].affectedRows > 0
      ? { success: true, data: result[0], message: "SUCCESS" }
      : { success: false, message: "FAILED", status: 500 };
  } catch (error) {
    connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function deleteTimeslot(tenantID, timeslot) {
  try {
    const exist = await getTimeslots(tenantID);
    if (exist.success === false && exist.message === "NOT_FOUND") {
      errorHandle("NOT_FOUND", exist.status);
    }

    const query =
      "DELETE FROM TIME_SLOTS WHERE TENANT_ID = ? AND PERIOD = ?";
    const values = [tenantID, timeslot];
    const result = await db.query(query, values);

    return result[0].affectedRows > 0
      ? { success: true, data: result[0], message: "SUCCESS" }
      : { success: false, message: "FAILED", status: 500 };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createTimeslots,
  getTimeslots,
  patchTimeslots,
  deleteTimeslot,
};
