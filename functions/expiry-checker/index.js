'use strict';

const { createStore } = require('medguard-shared/datastore');
const { tables, batchStatus, lowStockThreshold } = require('medguard-shared/constants');
const { createAlertOnce, sendEmail } = require('medguard-shared/alerts');

const daysUntil = (date) => Math.floor((Date.parse(`${date}T00:00:00Z`) - Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate())) / 86400000);

module.exports = async (_jobDetails, context) => {
  try {
    const store = createStore(context);
    const [batches, users] = await Promise.all([store.all(tables.batches), store.all(tables.users)]);
    const admins = users.filter((user) => user.role === 'Admin').map((user) => user.email).filter(Boolean);
    const recipient = admins[0] || process.env.ALERT_FALLBACK_EMAIL;
    const summary = { scanned: batches.length, expired: 0, expiring: 0, low_stock: 0, alerts_created: 0 };

    for (const batch of batches) {
      const days = daysUntil(batch.expiry_date);
      let alertType;
      let status;
      if (days < 0) { alertType = 'Expired'; status = batchStatus.EXPIRED; summary.expired += 1; }
      else if (days <= 7) { alertType = '7 Days'; status = batchStatus.EXPIRING; summary.expiring += 1; }
      else if (days <= 15) { alertType = '15 Days'; status = batchStatus.EXPIRING; summary.expiring += 1; }
      else if (days <= 30) { alertType = '30 Days'; status = batchStatus.EXPIRING; summary.expiring += 1; }
      if (status && batch.status !== batchStatus.BLOCKED) await store.update(tables.batches, batch, { status, updated_time: new Date().toISOString() });
      if (alertType) {
        const result = await createAlertOnce(store, batch, alertType, recipient || 'unconfigured');
        if (result.created) summary.alerts_created += 1;
        if (result.row.status !== 'Sent') {
          try { await sendEmail(store.app, recipient, `MedGuard: ${alertType} alert`, `Batch ${batch.batch_no} expires in ${days} day(s). Dispensing is blocked when a batch is expired.`); await store.update(tables.alerts, result.row, { status: 'Sent' }); }
          catch (error) { await store.update(tables.alerts, result.row, { status: 'Failed' }); throw error; }
        }
      }
      if (Number(batch.quantity) < lowStockThreshold) {
        summary.low_stock += 1;
        const result = await createAlertOnce(store, batch, 'Low Stock', recipient || 'unconfigured');
        if (result.created) summary.alerts_created += 1;
        if (result.row.status !== 'Sent') {
          try { await sendEmail(store.app, recipient, 'MedGuard: Low stock alert', `Batch ${batch.batch_no} quantity is ${batch.quantity}, below the configured threshold of ${lowStockThreshold}.`); await store.update(tables.alerts, result.row, { status: 'Sent' }); }
          catch (error) { await store.update(tables.alerts, result.row, { status: 'Failed' }); throw error; }
        }
      }
    }
    console.log(JSON.stringify(summary));
    context.closeWithSuccess();
  } catch (error) {
    console.error(error);
    context.closeWithFailure();
  }
};
