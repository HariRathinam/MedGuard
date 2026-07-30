const moment = require('moment');
const { tables, batchStatus, alertTypes, lowStockThreshold } = require('../config/constants');
const datastore = require('../services/datastore');
const emailService = require('../services/email');

const buildAlertPayload = (batch, type, sentTo) => ({
  alert_id: `${batch.batch_id}-${type}-${moment().unix()}`,
  batch_rowid: batch.rowid,
  alert_type: type,
  alert_date: new Date().toISOString(),
  sent_to: sentTo,
  status: 'Pending'
});

const createAlert = async (context, batch, alertType, recipientEmail) => {
  const payload = buildAlertPayload(batch, alertType, recipientEmail);
  await datastore.insertRow(context, tables.alerts, payload);
  await emailService.sendEmail(
    context,
    recipientEmail,
    `Batch ${batch.batch_no} ${alertType}`,
    `Alert for batch ${batch.batch_no} of medicine ${batch.medicine_rowid}: ${alertType}. Current status ${batch.status}. Please review immediately.`
  );
};

const runExpiryAndLowStockCheck = async (context) => {
  const batches = await datastore.fetchAllRows(context, tables.batches);
  const users = await datastore.fetchAllRows(context, tables.users);
  const adminEmails = users.filter((u) => u.role === 'Admin').map((u) => u.email);
  const today = moment().startOf('day');

  for (const batch of batches) {
    const expiryDate = moment(batch.expiry_date).startOf('day');
    const daysToExpiry = expiryDate.diff(today, 'days');
    const updates = {};
    const recipients = adminEmails.length ? adminEmails : ['admin@medguard.example'];

    if (daysToExpiry < 0) {
      updates.status = batchStatus.expired;
      await datastore.updateRow(context, tables.batches, batch.rowid, updates);
      await createAlert(context, batch, alertTypes.expired, recipients[0]);
      continue;
    }

    if (daysToExpiry <= 7) {
      updates.status = batchStatus.expiring;
      await datastore.updateRow(context, tables.batches, batch.rowid, updates);
      await createAlert(context, batch, alertTypes.days7, recipients[0]);
    } else if (daysToExpiry <= 15) {
      updates.status = batchStatus.expiring;
      await datastore.updateRow(context, tables.batches, batch.rowid, updates);
      await createAlert(context, batch, alertTypes.days15, recipients[0]);
    } else if (daysToExpiry <= 30) {
      updates.status = batchStatus.expiring;
      await datastore.updateRow(context, tables.batches, batch.rowid, updates);
      await createAlert(context, batch, alertTypes.days30, recipients[0]);
    }

    if (batch.quantity < lowStockThreshold) {
      await createAlert(context, batch, alertTypes.lowStock, recipients[0]);
    }
  }

  return { status: 'success', message: 'Expiry and low stock check completed' };
};

module.exports = {
  runExpiryAndLowStockCheck
};
