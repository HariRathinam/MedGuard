'use strict';

module.exports = Object.freeze({
  tables: Object.freeze({ medicines: 'Medicines', users: 'Users', batches: 'Batches', alerts: 'Alert_Logs' }),
  roles: Object.freeze({ ADMIN: 'Admin', PHARMACIST: 'Pharmacist' }),
  batchStatus: Object.freeze({ ACTIVE: 'Active', EXPIRING: 'Expiring', EXPIRED: 'Expired', BLOCKED: 'Blocked' }),
  alertTypes: Object.freeze(['30 Days', '15 Days', '7 Days', 'Expired', 'Low Stock']),
  lowStockThreshold: Number(process.env.LOW_STOCK_THRESHOLD || 20),
  maxPageSize: 100
});
