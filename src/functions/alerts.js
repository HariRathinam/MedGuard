const { tables, alertTypes } = require('../config/constants');
const datastore = require('../services/datastore');
const { success, error } = require('../utils/responses');
const { validateAlertPayload } = require('../utils/validation');

const addAlertLog = async (context) => {
  try {
    const payload = context.request.body;
    await validateAlertPayload(context, payload, datastore);
    const row = await datastore.insertRow(context, tables.alerts, {
      alert_id: payload.alert_id,
      batch_rowid: payload.batch_rowid,
      alert_type: payload.alert_type,
      alert_date: payload.alert_date,
      sent_to: payload.sent_to,
      status: payload.status
    });

    return success(context.response, row, 'Alert log added successfully');
  } catch (err) {
    return error(context.response, err.message);
  }
};

const listAlertLogs = async (context) => {
  try {
    const rows = await datastore.fetchAllRows(context, tables.alerts);
    return success(context.response, rows, 'Alert logs retrieved successfully');
  } catch (err) {
    return error(context.response, err.message);
  }
};

module.exports = {
  addAlertLog,
  listAlertLogs
};
