'use strict';

const { tables } = require('./constants');

const alertId = (batchRowId, type) => `ALERT-${batchRowId}-${type.replace(/\s/g, '-').toUpperCase()}`;

async function createAlertOnce(store, batch, type, sentTo, status = 'Pending') {
  const id = alertId(store.rowId(batch), type);
  const existing = await store.first(tables.alerts, 'alert_id', id);
  if (existing) return { created: false, row: existing };
  const row = await store.insert(tables.alerts, {
    alert_id: id,
    batch_rowid: store.rowId(batch),
    alert_type: type,
    alert_date: new Date().toISOString(),
    sent_to: sentTo,
    status
  });
  return { created: true, row };
}

async function sendEmail(app, recipient, subject, message) {
  if (!recipient) return;
  const fromEmail = process.env.ALERT_FROM_EMAIL;
  if (!fromEmail) throw new Error('ALERT_FROM_EMAIL must be configured with a verified Catalyst sender');
  await app.email().sendMail({ from_email: fromEmail, to_email: [recipient], html_mode: false, subject, content: message });
}

module.exports = { createAlertOnce, sendEmail };
