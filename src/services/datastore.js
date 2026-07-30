const Catalyst = require('@zcatalyst/sdk');

const { tables } = require('../config/constants');

const getCatalyst = (context) => {
  if (!context) {
    throw new Error('Catalyst request/context object is required');
  }
  return Catalyst.initialize(context);
};

const getTable = (context, tableName) => {
  const catalyst = getCatalyst(context);
  return catalyst.datastore().table(tableName);
};

const fetchAllRows = async (context, tableName) => {
  const table = getTable(context, tableName);
  return table.getRows();
};

const fetchRowByField = async (context, tableName, fieldName, value) => {
  const table = getTable(context, tableName);
  const query = table.getQuery();
  query.equalTo(fieldName, value);
  const rows = await query.find();
  return rows[0] || null;
};

const insertRow = async (context, tableName, rowData) => {
  const table = getTable(context, tableName);
  return table.insertRow(rowData);
};

const updateRow = async (context, tableName, rowId, updateData) => {
  const table = getTable(context, tableName);
  return table.updateRow(rowId, updateData);
};

const deleteRow = async (context, tableName, rowId) => {
  const table = getTable(context, tableName);
  return table.deleteRow(rowId);
};

const queryRows = async (context, tableName, queryBuilderFn) => {
  const table = getTable(context, tableName);
  const query = table.getQuery();
  if (typeof queryBuilderFn === 'function') {
    queryBuilderFn(query);
  }
  return query.find();
};

const countRows = async (context, tableName, queryBuilderFn) => {
  const rows = await queryRows(context, tableName, queryBuilderFn);
  return Array.isArray(rows) ? rows.length : 0;
};

module.exports = {
  getTable,
  fetchAllRows,
  fetchRowByField,
  insertRow,
  updateRow,
  deleteRow,
  queryRows,
  countRows
};
