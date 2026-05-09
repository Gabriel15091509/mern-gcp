require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const itemRoutes = require('./routes/items');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes items
app.use('/api/items', itemRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'service-items',
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connecté' : 'déconnecté'
  });
});

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('[service-items] MongoDB connecté');
    app.listen(PORT, '0.0.0.0', () =>
      console.log(`[service-items] Démarré sur port ${PORT}`)
    );
  })
  .catch(err => {
    console.error('[service-items] Erreur MongoDB:', err.message);
    process.exit(1);
  });

module.exports = app;
