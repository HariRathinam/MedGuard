const moment = require('moment');
const { tables } = require('../config/constants');

const ensureRequired = (payload, fields = []) => {
  const missing = fields.filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === '');
  if (missing.length) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
};

const validateMedicinePayload = async (context, payload, datastore) => {
  ensureRequired(payload, ['medicine_id', 'medicine_name', 'category', 'manufacturer', 'dosage']);

  const duplicate = await datastore.fetchRowByField(context, tables.medicines, 'medicine_id', payload.medicine_id);
  if (duplicate) {
    throw new Error('Duplicate medicine_id is not allowed');
  }
};

const validateUserPayload = async (context, payload, datastore) => {
  ensureRequired(payload, ['user_id', 'name', 'email', 'role', 'branch', 'phone']);

  if (!['Admin', 'Pharmacist'].includes(payload.role)) {
    throw new Error('Invalid role value. Allowed values: Admin, Pharmacist');
  }

  const duplicate = await datastore.fetchRowByField(context, tables.users, 'user_id', payload.user_id);
  if (duplicate) {
    throw new Error('Duplicate user_id is not allowed');
  }
};

const validateBatchPayload = async (context, payload, datastore, existingBatchRowId = null) => {
  ensureRequired(payload, ['batch_id', 'medicine_rowid', 'batch_no', 'quantity', 'manufacture_date', 'expiry_date', 'status', 'branch', 'created_by']);

  if (payload.quantity < 0) {
    throw new Error('Quantity cannot be negative');
  }

  if (moment(payload.expiry_date).isBefore(moment(payload.manufacture_date), 'day')) {
    throw new Error('Expiry date cannot be earlier than manufacture date');
  }

  if (!['Active', 'Expiring', 'Expired', 'Blocked'].includes(payload.status)) {
    throw new Error('Invalid status. Allowed values: Active, Expiring, Expired, Blocked');
  }

  const duplicateId = await datastore.fetchRowByField(context, tables.batches, 'batch_id', payload.batch_id);
  if (duplicateId && duplicateId.rowid !== existingBatchRowId) {
    throw new Error('Duplicate batch_id is not allowed');
  }

  const duplicateBatchNo = await datastore.fetchRowByField(context, tables.batches, 'batch_no', payload.batch_no);
  if (duplicateBatchNo && duplicateBatchNo.rowid !== existingBatchRowId) {
    throw new Error('Duplicate batch_no is not allowed');
  }
};

const validateAlertPayload = async (context, payload, datastore) => {
  ensureRequired(payload, ['alert_id', 'batch_rowid', 'alert_type', 'alert_date', 'sent_to', 'status']);

  if (!['30 Days', '15 Days', '7 Days', 'Expired', 'Low Stock'].includes(payload.alert_type)) {
    throw new Error('Invalid alert_type. Allowed values: 30 Days, 15 Days, 7 Days, Expired, Low Stock');
  }

  const duplicate = await datastore.fetchRowByField(context, tables.alerts, 'alert_id', payload.alert_id);
  if (duplicate) {
    throw new Error('Duplicate alert_id is not allowed');
  }
};

module.exports = {
  ensureRequired,
  validateMedicinePayload,
  validateUserPayload,
  validateBatchPayload,
  validateAlertPayload
};
