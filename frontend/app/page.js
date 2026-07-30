'use client';

import { useEffect, useState } from 'react';

const pages = ['Dashboard', 'Medicines', 'Batches', 'Users', 'Alert Logs', 'Reports'];
const endpoints = { Medicines: '/medicines', Batches: '/batches', Users: '/users', 'Alert Logs': '/alert-logs', Reports: '/reports/inventory' };
const demo = {
  '/dashboard': { total_medicines: 128, total_batches: 342, active_batches: 305, expiring_batches: 21, expired_batches: 4, low_stock_medicines: 9, recent_alerts: [{ medicine: 'Amoxicillin 500 mg', batch: 'AMX-2407', alert_type: 'Expiring soon', date: '2026-08-18', status: 'Open' }, { medicine: 'Insulin Glargine', batch: 'ING-1209', alert_type: 'Low stock', date: '2026-07-29', status: 'Open' }] },
  '/medicines': [{ name: 'Amoxicillin 500 mg', category: 'Antibiotic', available_stock: 480, reorder_level: 150, status: 'In stock' }, { name: 'Insulin Glargine', category: 'Diabetes care', available_stock: 18, reorder_level: 30, status: 'Low stock' }, { name: 'Paracetamol 650 mg', category: 'Analgesic', available_stock: 960, reorder_level: 200, status: 'In stock' }],
  '/batches': [{ batch_no: 'AMX-2407', medicine: 'Amoxicillin 500 mg', quantity: 240, expiry_date: '2026-08-18', status: 'Expiring soon' }, { batch_no: 'ING-1209', medicine: 'Insulin Glargine', quantity: 18, expiry_date: '2027-03-12', status: 'Active' }],
  '/users': [{ name: 'Dr. Asha Menon', email: 'asha.menon@medguard.demo', role: 'Admin', status: 'Active' }, { name: 'Ravi Kumar', email: 'ravi.kumar@medguard.demo', role: 'Pharmacist', status: 'Active' }],
  '/alert-logs': [{ alert_type: 'Expiring soon', medicine: 'Amoxicillin 500 mg', created_on: '2026-07-30', status: 'Open' }, { alert_type: 'Low stock', medicine: 'Insulin Glargine', created_on: '2026-07-29', status: 'Open' }],
  '/reports/inventory': [{ medicine: 'Amoxicillin 500 mg', batches: 4, total_quantity: 480, nearest_expiry: '2026-08-18' }, { medicine: 'Insulin Glargine', batches: 2, total_quantity: 18, nearest_expiry: '2027-03-12' }]
};

function DataTable({ rows }) {
  if (!rows?.length) return <p className="muted">No records found.</p>;
  const columns = Object.keys(rows[0]);
  return <div className="table-wrap"><table><thead><tr>{columns.map((column) => <th key={column}>{column.replaceAll('_', ' ')}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{columns.map((column) => <td key={column}>{row[column]}</td>)}</tr>)}</tbody></table></div>;
}

export default function Home() {
  const [page, setPage] = useState('Dashboard');
  const [data, setData] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const path = page === 'Dashboard' ? '/dashboard' : endpoints[page];
    setLoading(true);
    fetch(`/server/medguard-api${path}`, { credentials: 'include' })
      .then(async (response) => { if (!response.ok) throw new Error(); const payload = await response.json(); return payload.data; })
      .then((payload) => { setData(payload); setIsDemo(false); })
      .catch(() => { setData(demo[path]); setIsDemo(true); })
      .finally(() => setLoading(false));
  }, [page]);

  return <main>
    <header><div><strong>MedGuard</strong><span>Pharmacy Inventory</span></div><nav>{pages.map((item) => <button key={item} className={page === item ? 'active' : ''} onClick={() => setPage(item)}>{item}</button>)}</nav></header>
    <section className="content">
      <div className="heading"><div><p className="eyebrow">{isDemo ? 'DEMO DATA' : 'LIVE INVENTORY'}</p><h1>{page}</h1></div><div className="profile">Admin</div></div>
      {loading ? <p className="muted">Loading inventory…</p> : page === 'Dashboard' ? <><div className="metrics">{[['Total medicines', data.total_medicines], ['Total batches', data.total_batches], ['Active batches', data.active_batches], ['Expiring soon', data.expiring_batches], ['Expired', data.expired_batches], ['Low stock', data.low_stock_medicines]].map(([label, value]) => <article className="metric" key={label}><span>{label}</span><b>{value}</b></article>)}</div><h2>Recent alerts</h2><DataTable rows={data.recent_alerts} /></> : <><div className="summary">{data.length} records</div><DataTable rows={data} /></>}
    </section>
  </main>;
}
