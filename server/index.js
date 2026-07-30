'use strict';

const express = require('express');
const api = require('../functions/medguard-api');

const app = express();
const port = Number(process.env.PORT || 3001);

app.get('/health', (_req, res) => res.json({ service: 'medguard-express', status: 'ok' }));
app.use('/api', api);
app.listen(port, () => console.log(`MedGuard Express API listening on http://localhost:${port}`));
