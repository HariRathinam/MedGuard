# Sample JSON Payloads

## POST /medicines
```json
{"medicine_id":"MED-001","medicine_name":"Amoxicillin 500mg","category":"Antibiotic","manufacturer":"HealthPharm","dosage":"500 mg"}
```

## POST /users
```json
{"user_id":"USR-001","name":"Priya Kumar","email":"priya.kumar@hospital.example","role":"Admin","branch":"Main Pharmacy","phone":"+91-9876543210"}
```

## POST /batches
```json
{"batch_id":"BATCH-001","medicine_rowid":"<Medicines.ROWID>","batch_no":"AMX-500-01","quantity":120,"manufacture_date":"2026-06-01","expiry_date":"2027-05-31","status":"Active","branch":"Main Pharmacy","created_by":"<Users.ROWID>"}
```

## PUT /batches/:rowid (Pharmacist)
```json
{"quantity":95}
```

## POST /alert-logs
```json
{"alert_id":"ALERT-MANUAL-001","batch_rowid":"<Batches.ROWID>","alert_type":"Low Stock","sent_to":"admin@hospital.example","status":"Pending"}
```
