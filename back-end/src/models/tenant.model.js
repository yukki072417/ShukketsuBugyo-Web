const db = require("../models/db")();
const { errorHandle } = require('../services/errorHandle');

async function createTenant(tenantID, tenantName, tenantNameEN) {
  try {
    const existingTenant = await getTenantByID(tenantID);
    if (existingTenant.success === true) errorHandle('DUPLICATE', 409);

    const query =
      "INSERT INTO TENANTS (TENANT_ID, TENANT_NAME, TENANT_NAME_EN) VALUES (?, ?, ?)";
    const values = [tenantID, tenantName, tenantNameEN];

    const result = await db.query(query, values);
    return {success: true, result: result[0]};
  } catch (error) {
    throw error
  }
}

async function getTenantByID(tenantID) {
  try {
    const query = "SELECT * FROM TENANTS WHERE TENANT_ID = ?";
    const values = [tenantID];

    const result = await db.query(query, values);

    if(result[0].length > 0) return {success: true, result: result[0]};
    else return {success: false, message: 'NOT_FOUND', result: 404};

  } catch (error) {
    throw error
  }
}

async function patchTenant(tenantID, tenantName, tenantNameEN) {
  try {
    const existingTenant = await getTenantByID(tenantID);
    if (existingTenant.message === 'NOT_FOUND') errorHandle('NOT_FOUND', 404);

    const query = "UPDATE TENANTS SET TENANT_NAME = ?, TENANT_NAME_EN = ? WHERE TENANT_ID = ?";
    const values = [tenantName, tenantNameEN, tenantID];

    const result = await db.query(query, values);
    return {success: true, result: result};
  } catch (error) {
    throw error
  }
}

async function deleteTenant(tenantID) {
  try {
    const existingTenant = await getTenantByID(tenantID);
    if(existingTenant.message === 'NOT_FOUND') errorHandle('NOT_FOUND', 404);

    const query = "DELETE FROM TENANTS WHERE TENANT_ID = ?";
    const values = [tenantID];
    const result = await db.query(query, values);

    return {success: true, result: result};

  } catch (error) {
    throw error
  }
}

module.exports = {
  createTenant,
  getTenantByID,
  patchTenant,
  deleteTenant
};
