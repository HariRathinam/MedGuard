'use strict';

const { assert } = require('./errors');
const { roles, batchStatus, alertTypes } = require('./constants');

const isPresent = (value) => value !== undefined && value !== null && String(value).trim() !== '';
const required = (data, fields) => fields.forEach((field) => assert(isPresent(data[field]), `${field} is required`));
const validDate = (value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
const dateOrder = (manufactureDate, expiryDate) => {
  assert(validDate(manufactureDate) && validDate(expiryDate), 'manufacture_date and expiry_date must be ISO dates (YYYY-MM-DD)');
  assert(new Date(expiryDate) >= new Date(manufactureDate), 'Expiry date cannot be earlier than manufacture date');
};

const medicine = (data, partial = false) => {
  if (!partial) required(data, ['medicine_id', 'medicine_name', 'category', 'manufacturer', 'dosage']);
};
const user = (data, partial = false) => {
  if (!partial) required(data, ['user_id', 'name', 'email', 'role', 'branch', 'phone']);
  if (isPresent(data.email)) assert(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email), 'email must be valid');
  if (isPresent(data.role)) assert(Object.values(roles).includes(data.role), 'role must be Admin or Pharmacist');
};
const batch = (data, partial = false) => {
  if (!partial) required(data, ['batch_id', 'medicine_rowid', 'batch_no', 'quantity', 'manufacture_date', 'expiry_date', 'branch', 'created_by']);
  if (isPresent(data.quantity)) assert(Number.isFinite(Number(data.quantity)) && Number(data.quantity) >= 0, 'Quantity cannot be negative');
  if (isPresent(data.status)) assert(Object.values(batchStatus).includes(data.status), 'Invalid batch status');
  if (isPresent(data.manufacture_date) && isPresent(data.expiry_date)) dateOrder(data.manufacture_date, data.expiry_date);
};
const alert = (data) => {
  required(data, ['alert_id', 'batch_rowid', 'alert_type', 'sent_to', 'status']);
  assert(alertTypes.includes(data.alert_type), 'Invalid alert_type');
};

module.exports = { medicine, user, batch, alert, dateOrder, isPresent };
