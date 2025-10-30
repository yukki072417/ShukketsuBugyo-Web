const timeslotModel = require("../models/timeslot.model");
const { formatTimeForMySQL, formatResponse } = require("../services/format");
const { errorHandle } = require('../services/errorHandle');

async function createTimeslot(req, res) {
  const tenantID = req.tenant_id;
  const body = req.body;
  
  
  if (!Array.isArray(body) || !tenantID) {
    return res.status(400).json({ result: "ERROR", message: "BAD_REQUEST" });
  }
  
  try {
    for (let item of body) {
      if (!item.period || !item.start_time || !item.end_time) {
        errorHandle("BAD_REQUEST", 400);
      }
    }

    const result = await timeslotModel.createTimeslots(tenantID, body);

    if (result.success)
      return res.status(result.status).json({ result: "SUCCESS" });
    else {
      errorHandle(result.message, result.status || 500);
    }
  } catch (error) {
    return res.status(error.status || 500).json({
      result: "ERROR",
      message: error.message || "SERVER_ERROR",
      status: error.status || 500,
    });
  }
}

async function getTimeslots(req, res) {
  const tenantID = req.tenant_id;

  if (!tenantID) return res.status(400).json({ result: "ERROR", message: "BAD_REQUEST" });

  try {
    const result = await timeslotModel.getTimeslots(tenantID);
    if (result.success === false)
      errorHandle(result.message, result.status || 500);
    result.data.map((item) => delete item.TENANT_ID);
    return res
      .status(result.status)
      .json({ result: "SUCCESS", data: formatResponse(result.data).data });
  } catch (error) {
    return res.status(error.status || 500).json({ result: "ERROR", message: error.message });
  }
}

async function patchTimeslots(req, res) {
  const tenantID = req.tenant_id;
  const currentPeriod = req.params.current_period;
  const { period, start_time: startTime, end_time: endTime } = req.body;

  if (!tenantID || !period || !startTime || !endTime)
    return res.status(400).json({ result: "ERROR", message: "BAD_REQUEST" });

  try {
    const result = await timeslotModel.patchTimeslots(
      tenantID,
      currentPeriod,
      period,
      formatTimeForMySQL(startTime),
      formatTimeForMySQL(endTime)
    );

    if (result.success === true)
      return res.status(200).json({ result: "SUCCESS" });
    else
      errorHandle(result.message, result.status || 500);
  } catch (error) {
    return res.status(error.status || 500).json({ result: "ERROR", message: error.message });
  }
}

async function deleteTimeslot(req, res) {
  const tenantID = req.tenant_id;
  const period = req.params.current_period;
  console.log(period);

  if (!tenantID || !period)
    return res.status(400).json({ result: "ERROR", message: "BAD_REQUEST" });

  try {
    const result = await timeslotModel.deleteTimeslot(tenantID, period);
    if (result.success === false) {
      return errorHandle(result.message, result.status || 500);
    }
    return res.status(200).json({ result: "SUCCESS" });
  } catch (error) {
    return res.status(error.status || 500).json({ result: "ERROR", message: error.message });
  }
}

module.exports = {
  createTimeslot,
  getTimeslots,
  patchTimeslots,
  deleteTimeslot,
};
