# MedGuard API

Base URL: `/server/medguard-api`. All routes require a Catalyst Authentication session. Responses are JSON: `{ status, message, data }`.

| Method | Path | Role | Purpose |
|---|---|---|---|
| GET | `/health` | Signed in | Health check |
| GET | `/me` | Signed in | Current MedGuard profile and role |
| GET, POST | `/medicines` | Both, Admin | List; add medicine |
| PUT, DELETE | `/medicines/:rowid` | Admin | Update; delete if it has no batches |
| GET, POST | `/batches` | Both | List; create batch |
| PUT | `/batches/:rowid` | Admin/Pharmacist | Full update for Admin; `quantity` only for Pharmacist |
| DELETE | `/batches/:rowid` | Admin | Delete if it has no alerts |
| GET | `/users` | Admin | List user profiles |
| POST | `/users` | Admin | Add user profile |
| PUT, DELETE | `/users/:rowid` | Admin | Update; delete if not referenced |
| GET | `/alert-logs` | Both | List alerts |
| POST | `/alert-logs` | Admin | Manual alert entry |
| GET | `/dashboard` | Both | Summary metrics and 25 latest alerts |
| GET | `/reports/inventory` | Admin | Inventory report dataset |

Validation failures return `400`; duplicate IDs or batch numbers return `409`; unauthorized requests return `403`.

The daily `expiry-checker` Job Function scans every batch, changes status to `Expiring` or `Expired`, creates one durable alert per batch/type, emails an admin, and records low stock below `LOW_STOCK_THRESHOLD` (default `20`). Expired batch status is the dispensing block: dispensing clients must reject `Expired` and `Blocked` statuses.
