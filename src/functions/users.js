const { tables } = require('../config/constants');
const datastore = require('../services/datastore');
const { success, error } = require('../utils/responses');
const { validateUserPayload } = require('../utils/validation');

const addUser = async (context) => {
  try {
    const payload = context.request.body;
    await validateUserPayload(context, payload, datastore);
    const row = await datastore.insertRow(context, tables.users, {
      user_id: payload.user_id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      branch: payload.branch,
      phone: payload.phone
    });
    return success(context.response, row, 'User added successfully');
  } catch (err) {
    return error(context.response, err.message);
  }
};

const updateUser = async (context) => {
  try {
    const { rowid } = context.request.params;
    const payload = context.request.body;
    if (!rowid) {
      throw new Error('User rowid is required');
    }

    if (payload.user_id) {
      const existing = await datastore.fetchRowByField(context, tables.users, 'user_id', payload.user_id);
      if (existing && existing.rowid !== rowid) {
        throw new Error('Duplicate user_id is not allowed');
      }
    }

    if (payload.role && !['Admin', 'Pharmacist'].includes(payload.role)) {
      throw new Error('Invalid role value. Allowed values: Admin, Pharmacist');
    }

    const row = await datastore.updateRow(context, tables.users, rowid, payload);
    return success(context.response, row, 'User updated successfully');
  } catch (err) {
    return error(context.response, err.message);
  }
};

const deleteUser = async (context) => {
  try {
    const { rowid } = context.request.params;
    if (!rowid) {
      throw new Error('User rowid is required');
    }
    await datastore.deleteRow(context, tables.users, rowid);
    return success(context.response, null, 'User deleted successfully');
  } catch (err) {
    return error(context.response, err.message);
  }
};

const listUsers = async (context) => {
  try {
    const rows = await datastore.fetchAllRows(context, tables.users);
    return success(context.response, rows, 'Users retrieved successfully');
  } catch (err) {
    return error(context.response, err.message);
  }
};

module.exports = {
  addUser,
  updateUser,
  deleteUser,
  listUsers
};
