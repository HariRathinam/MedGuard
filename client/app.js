'use strict';

const pages = ['Dashboard', 'Medicines', 'Batches', 'Users', 'Alert Logs', 'Reports'];
const apiBase = '/server/medguard-api';
let session;
let demoMode = false;
const demoData = {
  '/dashboard': { total_medicines: 128, total_batches: 342, active_batches: 305, expiring_batches: 21, expired_batches: 4, low_stock_medicines: 9, recent_alerts: [{ medicine: 'Amoxicillin 500 mg', batch: 'AMX-2407', alert_type: 'Expiring soon', date: '2026-08-18', status: 'Open' }, { medicine: 'Insulin Glargine', batch: 'ING-1209', alert_type: 'Low stock', date: '2026-07-29', status: 'Open' }, { medicine: 'Paracetamol 650 mg', batch: 'PCM-0312', alert_type: 'Expired', date: '2026-07-27', status: 'Resolved' }] },
  '/medicines': [{ name: 'Amoxicillin 500 mg', category: 'Antibiotic', available_stock: 480, reorder_level: 150, status: 'In stock' }, { name: 'Insulin Glargine', category: 'Diabetes care', available_stock: 18, reorder_level: 30, status: 'Low stock' }, { name: 'Paracetamol 650 mg', category: 'Analgesic', available_stock: 960, reorder_level: 200, status: 'In stock' }],
  '/batches': [{ batch_no: 'AMX-2407', medicine: 'Amoxicillin 500 mg', quantity: 240, expiry_date: '2026-08-18', status: 'Expiring soon' }, { batch_no: 'ING-1209', medicine: 'Insulin Glargine', quantity: 18, expiry_date: '2027-03-12', status: 'Active' }, { batch_no: 'PCM-0312', medicine: 'Paracetamol 650 mg', quantity: 0, expiry_date: '2026-07-27', status: 'Expired' }],
  '/users': [{ name: 'Dr. Asha Menon', email: 'asha.menon@medguard.demo', role: 'Admin', status: 'Active' }, { name: 'Ravi Kumar', email: 'ravi.kumar@medguard.demo', role: 'Pharmacist', status: 'Active' }],
  '/alert-logs': [{ alert_type: 'Expiring soon', medicine: 'Amoxicillin 500 mg', created_on: '2026-07-30', status: 'Open' }, { alert_type: 'Low stock', medicine: 'Insulin Glargine', created_on: '2026-07-29', status: 'Open' }],
  '/reports/inventory': [{ medicine: 'Amoxicillin 500 mg', batches: 4, total_quantity: 480, nearest_expiry: '2026-08-18' }, { medicine: 'Insulin Glargine', batches: 2, total_quantity: 18, nearest_expiry: '2027-03-12' }]
};
const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value ?? '').replace(/[&<>"]/g, (char) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[char]));

async function api(path) {
  if (demoMode) return demoData[path];
  const response = await fetch(`${apiBase}${path}`, { credentials: 'include' });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || 'Request failed');
  return payload.data;
}
function renderNav() {
  $('#nav').innerHTML = pages.filter((page) => session.role === 'Admin' || !['Users', 'Reports'].includes(page)).map((page) => `<button data-page="${page}">${page}</button>`).join('');
  $('#nav').onclick = (event) => event.target.dataset.page && render(event.target.dataset.page);
}
function table(rows) {
  if (!rows.length) return '<p class="muted">No records found.</p>';
  const cols = Object.keys(rows[0]).filter((key) => !['CREATORID', 'CREATEDTIME', 'MODIFIEDTIME'].includes(key));
  return `<table><thead><tr>${cols.map((key) => `<th>${esc(key)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${cols.map((key) => `<td>${esc(row[key])}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
async function render(page) {
  $('#app').innerHTML = '<p class="muted">Loading...</p>';
  try {
    let body;
    if (page === 'Dashboard') { const d = await api('/dashboard'); body = `<h1>${session.role} Dashboard</h1><div class="grid">${[['Total medicines',d.total_medicines],['Total batches',d.total_batches],['Active',d.active_batches],['Expiring',d.expiring_batches],['Expired',d.expired_batches],['Low stock',d.low_stock_medicines]].map(([label,value]) => `<div class="metric">${label}<b>${value}</b></div>`).join('')}</div><h2>Recent Alerts</h2>${table(d.recent_alerts)}`; }
    else { const endpoint = {'Medicines':'/medicines','Batches':'/batches','Users':'/users','Alert Logs':'/alert-logs','Reports':'/reports/inventory'}[page]; const rows = await api(endpoint); body = `<div class="toolbar"><h1>${page}</h1><span class="muted">${rows.length} records</span></div>${table(rows)}`; }
    $('#app').innerHTML = body; document.querySelectorAll('[data-page]').forEach((button) => button.classList.toggle('active', button.dataset.page === page));
  } catch (error) { $('#app').innerHTML = `<p class="error">${esc(error.message)}</p>`; }
}
async function start() {
  try { session = await api('/me'); session = { ...session.user, role: session.role }; } catch (_) { /* Catalyst authentication redirects are configured in the console. */ }
  if (!session) return;
  $('#login').classList.remove('active'); $('#app').classList.add('active'); renderNav(); render('Dashboard');
}
function openDemo() {
  demoMode = true; session = { name: 'Dr. Asha Menon', role: 'Admin' };
  $('#login').classList.remove('active'); $('#app').classList.add('active'); renderNav(); render('Dashboard');
}
$('#open-demo').onclick = openDemo;
$('#sign-out').onclick = () => demoMode ? location.reload() : window.catalyst && catalyst.auth.signOut(window.location.origin);
if (window.catalyst) catalyst.auth.signIn('catalyst-login');
start();
