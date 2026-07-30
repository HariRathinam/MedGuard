# Catalyst Data Store Schema

Use [datastore-schema.json](datastore-schema.json) as the schema source of truth. Catalyst Data Store tables and lookup columns are created from the Catalyst console; this JSON file is intentionally a reviewable deployment manifest, not an unsupported schema migration format.

Create these tables with the exact case-sensitive names:

| Table | Column | Type | Required | Constraint |
|---|---|---|---|---|
| Medicines | medicine_id | String | Yes | Unique |
| Medicines | medicine_name, category, manufacturer, dosage | String | Yes | |
| Medicines | created_time | DateTime | Yes | |
| Users | user_id | String | Yes | Unique |
| Users | name, branch, phone | String | Yes | |
| Users | email | Email | Yes | |
| Users | role | String | Yes | `Admin` or `Pharmacist` |
| Batches | batch_id, batch_no, branch | String | Yes | `batch_id` and `batch_no` unique |
| Batches | medicine_rowid | Lookup | Yes | `Medicines.ROWID` |
| Batches | quantity | Number | Yes | |
| Batches | manufacture_date, expiry_date | Date | Yes | |
| Batches | status | String | Yes | `Active`, `Expiring`, `Expired`, `Blocked` |
| Batches | created_by | Lookup | Yes | `Users.ROWID` |
| Batches | updated_time | DateTime | Yes | |
| Alert_Logs | alert_id, sent_to, status | String | Yes | `alert_id` unique |
| Alert_Logs | batch_rowid | Lookup | Yes | `Batches.ROWID` |
| Alert_Logs | alert_type | String | Yes | `30 Days`, `15 Days`, `7 Days`, `Expired`, `Low Stock` |
| Alert_Logs | alert_date | DateTime | Yes | |

`ROWID` is Catalyst-generated for every table. Preserve the default lookup delete behavior and do not delete a parent record while child records exist. The API also enforces that rule.

## Relationships

```text
Medicines.ROWID  1 --- N  Batches.medicine_rowid
Users.ROWID      1 --- N  Batches.created_by
Batches.ROWID    1 --- N  Alert_Logs.batch_rowid
```
