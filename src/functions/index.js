const medicines = require('./medicines');
const users = require('./users');
const batches = require('./batches');
const alerts = require('./alerts');
const dashboard = require('./dashboard');
const expiryChecker = require('./expiryChecker');

module.exports = {
  addMedicine: medicines.addMedicine,
  updateMedicine: medicines.updateMedicine,
  deleteMedicine: medicines.deleteMedicine,
  listMedicines: medicines.listMedicines,

  addUser: users.addUser,
  updateUser: users.updateUser,
  deleteUser: users.deleteUser,
  listUsers: users.listUsers,

  addBatch: batches.addBatch,
  updateBatch: batches.updateBatch,
  deleteBatch: batches.deleteBatch,
  listBatches: batches.listBatches,

  addAlertLog: alerts.addAlertLog,
  listAlertLogs: alerts.listAlertLogs,

  totalMedicines: dashboard.totalMedicines,
  totalBatches: dashboard.totalBatches,
  activeBatches: dashboard.activeBatches,
  expiringBatches: dashboard.expiringBatches,
  expiredBatches: dashboard.expiredBatches,
  lowStockMedicines: dashboard.lowStockMedicines,
  recentAlerts: dashboard.recentAlerts,

  expiryChecker: expiryChecker.runExpiryAndLowStockCheck
};
