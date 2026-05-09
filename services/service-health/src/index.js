require('dotenv').config();
const express = require('express');
const axios   = require('axios');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

// URLs des autres services (via Kubernetes service discovery)
const SERVICES = {
  items: process.env.ITEMS_SERVICE_URL || 'http://service-items:3001',
  auth:  process.env.AUTH_SERVICE_URL  || 'http://service-auth:3002',
};

// GET /health — Status de tous les microservices
app.get('/health', async (req, res) => {
  const results = {};

  for (const [name, url] of Object.entries(SERVICES)) {
    try {
      const response = await axios.get(`${url}/health`, { timeout: 3000 });
      results[name] = {
        status: 'ok',
        data: response.data,
      };
    } catch (err) {
      results[name] = {
        status: 'error',
        message: err.message,
      };
    }
  }

  const allOk = Object.values(results).every(r => r.status === 'ok');

  res.status(allOk ? 200 : 207).json({
    service: 'service-health',
    status: allOk ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    services: results,
  });
});

// GET /health/live — Liveness probe Kubernetes
app.get('/health/live', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, '0.0.0.0', () =>
  console.log(`[service-health] Démarré sur port ${PORT}`)
);

module.exports = app;
