require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const apiRoutes = require('./routes/api');
 
const app  = express();
const PORT = process.env.PORT || 5000;
 
// Middleware
app.use(cors());
app.use(express.json());
// Routes
app.use('/api', apiRoutes);
 
// Health check (utilisé par les probes Kubernetes)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
 
// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connecté');
    app.listen(PORT,"0.0.0.0",() => console.log(`Serveur sur port ${PORT}`));
  })
  .catch(err => {
    console.error('Erreur MongoDB:', err.message);
    process.exit(1);
  });
 
module.exports = app;
