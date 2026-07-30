# Deployment

1. Install the Catalyst CLI and authenticate: `npm install -g catalyst-cli`, then `catalyst login`.
2. In Catalyst Console, create the four Data Store tables from [schema.md](schema.md), including unique constraints and the three lookup columns.
3. Enable Catalyst Authentication. Create user profiles named `Admin` and `Pharmacist`; grant the web client access to authenticated users only.
4. In `Users`, add an initial administrator row whose `email` exactly matches the Catalyst account email. After that, administrators create the remaining application profiles. The backend uses the profile table as the authorization source.
5. In each function directory run `npm install`. Configure a verified Catalyst email sender. Set `ALERT_FROM_EMAIL`, `ALERT_FALLBACK_EMAIL`, and optionally `LOW_STOCK_THRESHOLD` in Function environment variables.
6. Create `medguard-api` as an Advanced I/O Node.js 18 function with `functions/medguard-api/index.js` as its entry point. Create `expiry-checker` as a Node.js 18 Job Function with `functions/expiry-checker/index.js`.
7. Create a Catalyst Cron for 00:05 daily in the hospital timezone. Its target must be the `expiry-checker` Job Function in a Job Pool. Verify one execution with `catalyst functions:shell` or the Job Function log.
8. Run `catalyst serve`, authenticate through the client, test the API, then run `catalyst deploy`.

## Required Catalyst permissions

The API function's service account must have Data Store read/write access to all four tables and Email send access. The client must not be granted direct table write permissions; it calls the authenticated API instead.

## Operations

Monitor Job Function failures and email delivery in Catalyst Logs. The alert ID format (`ALERT-<batch-rowid>-<type>`) makes daily retries idempotent. Use backups and test table-level constraints in a development project before modifying production schema.
