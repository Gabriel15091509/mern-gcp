const express = require('express');
const router  = express.Router();
const Item    = require('../models/Item');
 
// GET tous les items
router.get('/items', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
 
// POST créer un item
router.post('/items', async (req, res) => {
  const item = new Item({ name: req.body.name, description: req.body.description });
  try {
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
 
// DELETE supprimer un item
router.delete('/items/:id', async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
 
module.exports = router;
