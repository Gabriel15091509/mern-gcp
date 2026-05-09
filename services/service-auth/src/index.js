require('dotenv').config();
const express = require('express');
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

app.use(cors());
app.use(express.json());

// Utilisateurs en mémoire (démo — en prod utiliser MongoDB)
const users = [];

// POST /auth/register — Créer un compte
app.post('/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: 'Username et password requis' });

    const exists = users.find(u => u.username === username);
    if (exists)
      return res.status(409).json({ message: 'Utilisateur déjà existant' });

    const hash = await bcrypt.hash(password, 10);
    users.push({ username, password: hash });

    res.status(201).json({ message: 'Compte créé avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /auth/login — Se connecter
app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (!user)
      return res.status(401).json({ message: 'Utilisateur non trouvé' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ message: 'Mot de passe incorrect' });

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, username });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /auth/verify — Vérifier un token JWT
app.post('/auth/verify', (req, res) => {
  try {
    const { token } = req.body;
    if (!token)
      return res.status(400).json({ message: 'Token requis' });

    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (err) {
    res.status(401).json({ valid: false, message: 'Token invalide' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'service-auth',
    status: 'ok',
    timestamp: new Date().toISOString(),
    users_count: users.length
  });
});

app.listen(PORT, '0.0.0.0', () =>
  console.log(`[service-auth] Démarré sur port ${PORT}`)
);

module.exports = app;
