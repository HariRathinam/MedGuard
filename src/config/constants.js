module.exports = {
  tables: {
    medicines: 'Medicines',
    users: 'Users',
    batches: 'Batches',
    alerts: 'Alert_Logs'
  },
  roles: {
    admin: 'Admin',
    pharmacist: 'Pharmacist'
  },
  batchStatus: {
    active: 'Active',
    expiring: 'Expiring',
    expired: 'Expired',
    blocked: 'Blocked'
  },
  alertTypes: {
    days30: '30 Days',
    days15: '15 Days',
    days7: '7 Days',
    expired: 'Expired',
    lowStock: 'Low Stock'
  },
  lowStockThreshold: 20,
  dispatchEmailTemplate: {
    from: 'no-reply@medguard.example',
    subjectPrefix: '[MedGuard Alert]'
  }
};
