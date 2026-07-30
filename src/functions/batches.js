const moment = require('moment');
const { tables, batchStatus } = require('../config/constants');
const datastore = require('../services/datastore');
const { success, error } = require('../utils/responses');
const { validateBatchPayload } = require('../utils/validation');

const addBatch = async (context) => {
  try {
    const payload = context.request.body;
    await validateBatchPayload(context, payload, datastore);

    const row = await datastore.insertRow(context, tables.batches, {
      batch_id: payload.batch_id,
      medicine_rowid: payload.medicine_rowid,
      batch_no: payload.batch_no,
      quantity: payload.quantity,
      manufacture_date: payload.manufacture_date,
      expiry_date: payload.expiry_date,
      status: payload.status,
      branch: payload.branch,
      created_by: payload.created_by,
      updated_time: new Date().toISOString()
    });

    return success(context.response, row, 'Batch added successfully');
  } catch (err) {
    return error(context.response, err.message);
  }
};

const updateBatch = async (context) => {
  try {
    const { rowid } = context.request.params;
    const payload = context.request.body;
    if (!rowid) {
      throw new Error('Batch rowid is required');
    }

    const existingBatch = await datastore.getTable(context, tables.batches).getRow(rowid);
    if (!existingBatch) {
      throw new Error('Batch not found');
    }

    if (payload.batch_id) {
      const existing = await datastore.fetchRowByField(context, tables.batches, 'batch_id', payload.batch_id);
      if (existing && existing.rowid !== rowid) {
        throw new Error('Duplicate batch_id is not allowed');
      }
    }

    if (payload.batch_no) {
      const existingBatchNo = await datastore.fetchRowByField(context, tables.batches, 'batch_no', payload.batch_no);
      if (existingBatchNo && existingBatchNo.rowid !== rowid) {
        throw new Error('Duplicate batch_no is not allowed');
      }
    }

    if (payload.quantity !== undefined && payload.quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    if (payload.manufacture_date && payload.expiry_date) {
      if (moment(payload.expiry_date).isBefore(moment(payload.manufacture_date), 'day')) {
        throw new Error('Expiry date cannot be earlier than manufacture date');
      }
    }

    payload.updated_time = new Date().toISOString();
    const row = await datastore.updateRow(context, tables.batches, rowid, payload);
    return success(context.response, row, 'Batch updated successfully');
  } catch (err) {
    return error(context.response, err.message);
  }
};

const deleteBatch = async (context) => {
  try {
    const { rowid } = context.request.params;
    if (!rowid) {
      throw new Error('Batch rowid is required');
    }
    await datastore.deleteRow(context, tables.batches, rowid);
    return success(context.response, null, 'Batch deleted successfully');
  } catch (err) {
    return error(context.response, err.message);
  }
};

const listBatches = async (context) => {
  try {
    const rows = await datastore.fetchAllRows(context, tables.batches);
    return success(context.response, rows, 'Batches retrieved successfully');
  } catch (err) {
    return error(context.response, err.message);
  }
};

module.exports = {
  addBatch,
  updateBatch,
  deleteBatch,
  listBatches
};
