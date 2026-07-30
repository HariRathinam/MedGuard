'use strict';

const catalyst = require('zcatalyst-sdk-node');
const { AppError } = require('./errors');

const rowId = (row) => String(row?.ROWID || row?.rowid || '');
const quote = (value) => `'${String(value).replace(/'/g, "\\'")}'`;
const unwrap = (rows, tableName) => rows.map((row) => row[tableName] || row);

const createStore = (requestOrContext) => {
  const app = catalyst.initialize(requestOrContext);
  const table = (name) => app.datastore().table(name);
  const zcql = app.zcql();

  async function find(tableName, where = '', limit = 300) {
    const result = await zcql.executeZCQLQuery(`SELECT * FROM ${tableName}${where ? ` WHERE ${where}` : ''} LIMIT ${Math.min(limit, 300)}`);
    return unwrap(result, tableName);
  }
  async function all(tableName) {
    const rows = [];
    let nextToken;
    let moreRecords = true;
    while (moreRecords) {
      const page = await table(tableName).getPagedRows({ nextToken, maxRows: 300 });
      rows.push(...page.data);
      nextToken = page.next_token;
      moreRecords = Boolean(page.more_records);
    }
    return rows;
  }
  async function get(tableName, id) {
    const row = await table(tableName).getRow(id);
    if (!row) throw new AppError(404, `${tableName} row not found`, 'NOT_FOUND');
    return row;
  }
  async function first(tableName, field, value) {
    const rows = await find(tableName, `${field} = ${quote(value)}`, 1);
    return rows[0] || null;
  }
  async function insert(tableName, data) { return table(tableName).insertRow(data); }
  async function update(tableName, existing, changes) { return table(tableName).updateRow({ ...existing, ...changes, ROWID: rowId(existing) }); }
  async function remove(tableName, id) { return table(tableName).deleteRow(id); }
  return { app, find, all, get, first, insert, update, remove, rowId, quote };
};

module.exports = { createStore, rowId };
