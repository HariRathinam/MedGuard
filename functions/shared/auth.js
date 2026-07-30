'use strict';

const { createStore, rowId } = require('./datastore');
const { tables, roles } = require('./constants');
const { AppError } = require('./errors');

const authenticate = async (req, _res, next) => {
  try {
    const store = createStore(req);
    const catalystUser = await store.app.userManagement().getCurrentUser();
    const email = catalystUser.email_id || catalystUser.email;
    const user = await store.first(tables.users, 'email', email);
    if (!user) throw new AppError(403, 'No MedGuard user profile is associated with this Catalyst account', 'PROFILE_REQUIRED');
    req.medguard = { store, user: { ...user, rowid: rowId(user) }, role: user.role };
    next();
  } catch (error) { next(error); }
};

const allow = (...allowedRoles) => (req, _res, next) => {
  if (!allowedRoles.includes(req.medguard.role)) return next(new AppError(403, 'You do not have permission for this action', 'FORBIDDEN'));
  return next();
};

module.exports = { authenticate, allow, roles };
