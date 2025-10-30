const tenantModel = require('../models/tenant.model');
const { errorHandle } = require('../services/errorHandle');

async function createTenant(req, res) {
    const { tenant_id: tenantID, tenant_name: tenantName, tenant_name_en: tenantNameEN } = req.body;
    if (!tenantID || !tenantName || !tenantNameEN) return res.json({ message: 'BAD_REQUEST' }).status(400);

    try {
        const result = await tenantModel.createTenant(tenantID, tenantName, tenantNameEN);
        
        if (result.success) return res.json({ message: 'SUCCESS' }).status(201);
        else if(result.success === false && result.message === 'DUPLICATE') errorHandle('DUPLICATE', 409);
        else errorHandle('SERVER_ERROR', 500);
    } catch (error) {
        return res.json({ result: "ERROR", message: error.message }).status(error.status);
    }
}

async function getTenantByID(req, res) {
    const tenantID = req.params.tenant_id;
    if (!tenantID) return res.json({ message: 'BAD_REQUEST' }).status(400);

    try {
        const tenant = await tenantModel.getTenantByID(tenantID);
        if (tenant.success === false) errorHandle(tenant.message, tenant.status);

        const response = {
            tenant_name: tenant.result[0].TENANT_NAME,
            tenant_name_en: tenant.result[0].TENANT_NAME_EN
        };
        
        return res.json({ message: 'SUCCESS', data: response }).status(200);
    } catch(error){
        return res.json({ result: "ERROR", message: error.message }).status(error.status);
    }
}

async function patchTenant(req, res) {
    const tenantID = req.params.tenant_id;
    const {tenant_name: tenantName, tenant_name_en: tenantNameEN} = req.body;
    if(!tenantID) return res.json({ message: 'BAD_REQUEST' }).status(400);
    try {
        const tenant = await tenantModel.patchTenant(tenantID, tenantName, tenantNameEN);
        
        if(tenant.success === true) return res.json({ message: 'SUCCESS' }).status(200);
        else if(tenant.success === false) errorHandle(tenant.message, tenant.status);
        else errorHandle(tenant.message, 500);
        
    } catch (error) {
        return res.json({ result: "ERROR", message: error.message }).status(error.status);
    }
}

async function deleteTenant(req, res) {
    const tenantID = req.params.tenant_id;
    if(!tenantID) return res.json({ message: 'BAD_REQUEST' }).status(400);

    try {
        const deletion = await tenantModel.deleteTenant(tenantID);
        if(deletion.success === true) return res.json({ message: 'SUCCESS' }).status(200);
        else if(deletion.success === false) errorHandle(deletion.message, deletion.status);
        else errorHandle(deletion.message, 500);
    } catch (error) {
        return res.json({ result: "ERROR", message: error.message }).status(error.status);
    }
}
module.exports = {
    createTenant,
    getTenantByID,
    patchTenant,
    deleteTenant
};