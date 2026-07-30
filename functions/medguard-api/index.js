'use strict';

const express = require('express');
const { authenticate, allow, roles } = require('medguard-shared/auth');
const { tables, batchStatus, lowStockThreshold, maxPageSize } = require('medguard-shared/constants');
const { AppError, assert } = require('medguard-shared/errors');
const validate = require('medguard-shared/validation');
const { rowId } = require('medguard-shared/datastore');

const api = express();
api.use(express.json({ limit: '256kb' }));
api.use(authenticate);

const send = (res, status, data, message = 'OK') => res.status(status).json({ status: 'success', message, data });
const pageLimit = (value) => Math.min(Math.max(Number(value) || maxPageSize, 1), maxPageSize);
const entity = (row) => ({ ...row, rowid: rowId(row) });
const unique = async (store, table, field, value, currentId) => {
  if (value === undefined) return;
  const duplicate = await store.first(table, field, value);
  assert(!duplicate || rowId(duplicate) === String(currentId || ''), `Duplicate ${field} is not allowed`, 409, 'DUPLICATE');
};
const reference = async (store, table, id, name) => {
  try { await store.get(table, id); } catch (_) { throw new AppError(400, `${name} does not reference an existing row`, 'INVALID_LOOKUP'); }
};
const dependencies = async (store, table, field, id) => store.find(table, `${field} = ${store.quote(id)}`, 1);

api.get('/health', (_req, res) => send(res, 200, { service: 'medguard-api' }));
api.get('/me', (req, res) => send(res, 200, { user: req.medguard.user, role: req.medguard.role }));

api.route('/medicines')
  .get(async (req, res, next) => { try { send(res, 200, (await req.medguard.store.find(tables.medicines, '', pageLimit(req.query.limit))).map(entity)); } catch (e) { next(e); } })
  .post(allow(roles.ADMIN), async (req, res, next) => { try {
    validate.medicine(req.body); const { store } = req.medguard;
    await unique(store, tables.medicines, 'medicine_id', req.body.medicine_id);
    const row = await store.insert(tables.medicines, { ...req.body, created_time: new Date().toISOString() });
    send(res, 201, entity(row), 'Medicine created');
  } catch (e) { next(e); } });
api.route('/medicines/:rowid')
  .put(allow(roles.ADMIN), async (req, res, next) => { try { const { store } = req.medguard; validate.medicine(req.body, true); await unique(store, tables.medicines, 'medicine_id', req.body.medicine_id, req.params.rowid); send(res, 200, entity(await store.update(tables.medicines, await store.get(tables.medicines, req.params.rowid), req.body)), 'Medicine updated'); } catch (e) { next(e); } })
  .delete(allow(roles.ADMIN), async (req, res, next) => { try { const { store } = req.medguard; assert(!(await dependencies(store, tables.batches, 'medicine_rowid', req.params.rowid)).length, 'Cannot delete a medicine with batches', 409, 'DEPENDENCY_EXISTS'); await store.remove(tables.medicines, req.params.rowid); send(res, 200, null, 'Medicine deleted'); } catch (e) { next(e); } });

api.route('/users')
  .get(allow(roles.ADMIN), async (req, res, next) => { try { send(res, 200, (await req.medguard.store.find(tables.users, '', pageLimit(req.query.limit))).map(entity)); } catch (e) { next(e); } })
  .post(allow(roles.ADMIN), async (req, res, next) => { try { validate.user(req.body); const { store } = req.medguard; await unique(store, tables.users, 'user_id', req.body.user_id); send(res, 201, entity(await store.insert(tables.users, req.body)), 'User created'); } catch (e) { next(e); } });
api.route('/users/:rowid')
  .put(allow(roles.ADMIN), async (req, res, next) => { try { const { store } = req.medguard; validate.user(req.body, true); await unique(store, tables.users, 'user_id', req.body.user_id, req.params.rowid); send(res, 200, entity(await store.update(tables.users, await store.get(tables.users, req.params.rowid), req.body)), 'User updated'); } catch (e) { next(e); } })
  .delete(allow(roles.ADMIN), async (req, res, next) => { try { const { store } = req.medguard; assert(rowId(req.medguard.user) !== req.params.rowid, 'You cannot delete your own profile'); assert(!(await dependencies(store, tables.batches, 'created_by', req.params.rowid)).length, 'Cannot delete a user who created batches', 409, 'DEPENDENCY_EXISTS'); await store.remove(tables.users, req.params.rowid); send(res, 200, null, 'User deleted'); } catch (e) { next(e); } });

api.route('/batches')
  .get(async (req, res, next) => { try { send(res, 200, (await req.medguard.store.find(tables.batches, '', pageLimit(req.query.limit))).map(entity)); } catch (e) { next(e); } })
  .post(allow(roles.ADMIN, roles.PHARMACIST), async (req, res, next) => { try {
    const { store, user, role } = req.medguard; const data = { ...req.body, created_by: role === roles.PHARMACIST ? user.rowid : req.body.created_by, status: req.body.status || batchStatus.ACTIVE };
    validate.batch(data); await unique(store, tables.batches, 'batch_id', data.batch_id); await unique(store, tables.batches, 'batch_no', data.batch_no); await reference(store, tables.medicines, data.medicine_rowid, 'medicine_rowid'); await reference(store, tables.users, data.created_by, 'created_by');
    send(res, 201, entity(await store.insert(tables.batches, { ...data, quantity: Number(data.quantity), updated_time: new Date().toISOString() })), 'Batch created');
  } catch (e) { next(e); } });
api.route('/batches/:rowid')
  .put(allow(roles.ADMIN, roles.PHARMACIST), async (req, res, next) => { try {
    const { store, role } = req.medguard; const current = await store.get(tables.batches, req.params.rowid);
    if (role === roles.PHARMACIST) assert(Object.keys(req.body).every((key) => key === 'quantity'), 'Pharmacists can only update quantity', 403, 'FORBIDDEN');
    const data = { ...current, ...req.body }; validate.batch(data, true); await unique(store, tables.batches, 'batch_id', req.body.batch_id, req.params.rowid); await unique(store, tables.batches, 'batch_no', req.body.batch_no, req.params.rowid);
    if (req.body.medicine_rowid) await reference(store, tables.medicines, req.body.medicine_rowid, 'medicine_rowid'); if (req.body.created_by) await reference(store, tables.users, req.body.created_by, 'created_by');
    const changes = { ...req.body, updated_time: new Date().toISOString() };
    if (changes.quantity !== undefined) changes.quantity = Number(changes.quantity);
    send(res, 200, entity(await store.update(tables.batches, current, changes)), 'Batch updated');
  } catch (e) { next(e); } })
  .delete(allow(roles.ADMIN), async (req, res, next) => { try { const { store } = req.medguard; assert(!(await dependencies(store, tables.alerts, 'batch_rowid', req.params.rowid)).length, 'Cannot delete a batch with alert logs', 409, 'DEPENDENCY_EXISTS'); await store.remove(tables.batches, req.params.rowid); send(res, 200, null, 'Batch deleted'); } catch (e) { next(e); } });

api.route('/alert-logs')
  .get(async (req, res, next) => { try { send(res, 200, (await req.medguard.store.find(tables.alerts, '', pageLimit(req.query.limit))).map(entity)); } catch (e) { next(e); } })
  .post(allow(roles.ADMIN), async (req, res, next) => { try { validate.alert(req.body); const { store } = req.medguard; await unique(store, tables.alerts, 'alert_id', req.body.alert_id); await reference(store, tables.batches, req.body.batch_rowid, 'batch_rowid'); send(res, 201, entity(await store.insert(tables.alerts, { ...req.body, alert_date: req.body.alert_date || new Date().toISOString() })), 'Alert log created'); } catch (e) { next(e); } });

api.get('/dashboard', async (req, res, next) => { try {
  const { store } = req.medguard; const [medicines, batches, alerts] = await Promise.all([store.all(tables.medicines), store.all(tables.batches), store.all(tables.alerts)]);
  const active = batches.filter((batch) => batch.status === batchStatus.ACTIVE);
  const expiring = batches.filter((batch) => batch.status === batchStatus.EXPIRING);
  const expired = batches.filter((batch) => batch.status === batchStatus.EXPIRED);
  const lowStock = batches.filter((batch) => Number(batch.quantity) < lowStockThreshold);
  const recentAlerts = alerts.sort((a, b) => new Date(b.alert_date) - new Date(a.alert_date)).slice(0, 25).map(entity);
  send(res, 200, { total_medicines: medicines.length, total_batches: batches.length, active_batches: active.length, expiring_batches: expiring.length, expired_batches: expired.length, low_stock_medicines: lowStock.length, recent_alerts: recentAlerts });
} catch (e) { next(e); } });
api.get('/reports/inventory', allow(roles.ADMIN), async (req, res, next) => { try { const batches = await req.medguard.store.find(tables.batches); send(res, 200, batches.map(entity)); } catch (e) { next(e); } });

api.use((error, _req, res, _next) => { console.error(error); const status = error instanceof AppError ? error.status : 500; res.status(status).json({ status: 'error', code: error.code || 'INTERNAL_ERROR', message: status === 500 ? 'Internal server error' : error.message }); });
module.exports = api;
