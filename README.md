# MedGuard

MedGuard is a Zoho Catalyst application for hospital pharmacy inventory, batch expiry tracking, alerts, and role-controlled workflows.

## Project layout

```text
client/                         Catalyst web client: Login, dashboards, Medicines, Batches, Users, Alerts, Reports
functions/medguard-api/         Advanced I/O Express API
functions/expiry-checker/       Daily Job Function
functions/shared/               Data Store, authorization, validation, and alert helpers
docs/datastore-schema.json      Source of truth for table and lookup configuration
docs/schema.md                  Console setup instructions
docs/api.md                     Route contract and sample calls
docs/deployment.md              Deployment and authentication setup
docs/queries.zcql               Dashboard ZCQL queries
catalyst-config.json            Catalyst component targets
```

## Prerequisites

- Node.js 18+
- Catalyst CLI (`npm install -g catalyst-cli`)
- A Catalyst project with Authentication enabled

## Run and deploy

1. Create the tables and lookup columns from [docs/schema.md](docs/schema.md).
2. Configure the two Catalyst user profiles (`Admin`, `Pharmacist`) and create a matching `Users` table row for each Catalyst account.
3. Install dependencies in each function directory (the local `medguard-shared` package is installed automatically), then run `catalyst serve` from the repository root.
4. Configure the daily job and email sender as described in [docs/deployment.md](docs/deployment.md).
5. Run `catalyst deploy` after local verification.

The API never trusts a browser-supplied role. It resolves the signed-in Catalyst user and the matching `Users.email` profile on every request.
