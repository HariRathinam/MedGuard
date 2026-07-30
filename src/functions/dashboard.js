const { tables, batchStatus, alertTypes, lowStockThreshold } = require('../config/constants');
const datastore = require('../services/datastore');
const { success, error } = require('../utils/responses');

const totalMedicines = async (context) => {
  try {
    const count = await datastore.countRows(context, tables.medicines);
    return success(context.response, { totalMedicines: count }, 'Total medicines count retrieved');
  } catch (err) {
    return error(context.response, err.message);
  }
};

const totalBatches = async (context) => {
  try {
    const count = await datastore.countRows(context, tables.batches);
    return success(context.response, { totalBatches: count }, 'Total batches count retrieved');
  } catch (err) {
    return error(context.response, err.message);
  }
};

const activeBatches = async (context) => {
  try {
    const rows = await datastore.queryRows(context, tables.batches, (query) => {
      query.equalTo('status', batchStatus.active);
    });
    return success(context.response, { activeBatches: rows.length, rows }, 'Active batches retrieved');
  } catch (err) {
    return error(context.response, err.message);
  }
};

const expiringBatches = async (context) => {
  try {
    const rows = await datastore.queryRows(context, tables.batches, (query) => {
      query.equalTo('status', batchStatus.expiring);
    });
    return success(context.response, { expiringBatches: rows.length, rows }, 'Expiring batches retrieved');
  } catch (err) {
    return error(context.response, err.message);
  }
};

const expiredBatches = async (context) => {
  try {
    const rows = await datastore.queryRows(context, tables.batches, (query) => {
      query.equalTo('status', batchStatus.expired);
    });
    return success(context.response, { expiredBatches: rows.length, rows }, 'Expired batches retrieved');
  } catch (err) {
    return error(context.response, err.message);
  }
};

const lowStockMedicines = async (context) => {
  try {
    const rows = await datastore.queryRows(context, tables.batches, (query) => {
      query.lessThan('quantity', lowStockThreshold);
    });
    return success(context.response, { lowStockMedicines: rows.length, rows }, 'Low stock medicines retrieved');
  } catch (err) {
    return error(context.response, err.message);
  }
};

const recentAlerts = async (context) => {
  try {
    const rows = await datastore.queryRows(context, tables.alerts, (query) => {
      query.orderBy('alert_date', 'DESC');
      query.limit(25);
    });
    return success(context.response, { recentAlerts: rows.length, rows }, 'Recent alerts retrieved');
  } catch (err) {
    return error(context.response, err.message);
  }
};

module.exports = {
  totalMedicines,
  totalBatches,
  activeBatches,
  expiringBatches,
  expiredBatches,
  lowStockMedicines,
  recentAlerts
};
