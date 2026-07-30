const { tables } = require('../config/constants');
const datastore = require('../services/datastore');
const { success, error } = require('../utils/responses');
const { validateMedicinePayload } = require('../utils/validation');

const addMedicine = async (context) => {
  try {
    const payload = context.request.body;
    await validateMedicinePayload(context, payload, datastore);
    const row = await datastore.insertRow(context, tables.medicines, {
      medicine_id: payload.medicine_id,
      medicine_name: payload.medicine_name,
      category: payload.category,
      manufacturer: payload.manufacturer,
      dosage: payload.dosage,
      created_time: new Date().toISOString()
    });
    return success(context.response, row, 'Medicine added successfully');
  } catch (err) {
    return error(context.response, err.message);
  }
};

const updateMedicine = async (context) => {
  try {
    const { rowid } = context.request.params;
    const payload = context.request.body;
    if (!rowid) {
      throw new Error('Medicine rowid is required');
    }

    if (payload.medicine_id) {
      const existing = await datastore.fetchRowByField(context, tables.medicines, 'medicine_id', payload.medicine_id);
      if (existing && existing.rowid !== rowid) {
        throw new Error('Duplicate medicine_id is not allowed');
      }
    }

    const row = await datastore.updateRow(context, tables.medicines, rowid, payload);
    return success(context.response, row, 'Medicine updated successfully');
  } catch (err) {
    return error(context.response, err.message);
  }
};

const deleteMedicine = async (context) => {
  try {
    const { rowid } = context.request.params;
    if (!rowid) {
      throw new Error('Medicine rowid is required');
    }
    await datastore.deleteRow(context, tables.medicines, rowid);
    return success(context.response, null, 'Medicine deleted successfully');
  } catch (err) {
    return error(context.response, err.message);
  }
};

const listMedicines = async (context) => {
  try {
    const rows = await datastore.fetchAllRows(context, tables.medicines);
    return success(context.response, rows, 'Medicines retrieved successfully');
  } catch (err) {
    return error(context.response, err.message);
  }
};

module.exports = {
  addMedicine,
  updateMedicine,
  deleteMedicine,
  listMedicines
};
