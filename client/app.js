'use strict';

const pages = ['Dashboard', 'Medicines', 'Batches', 'Users', 'Alert Logs', 'Reports'];
const apiBase = '/server/medguard-api';
let session;
const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value ?? '').replace(/[&<>"]/g, (char) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[char]));

async function api(path) {
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
$('#sign-out').onclick = () => catalyst.auth.signOut(window.location.origin);
if (window.catalyst) catalyst.auth.signIn('catalyst-login');
start();
