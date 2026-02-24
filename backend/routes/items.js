const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all items
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM items ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ⚠️ GET withdrawal history — MUST be before /:id routes
router.get('/withdrawals/all', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT w.*, i.material, i.unit, i.project AS item_project
      FROM withdrawals w
      JOIN items i ON w.item_id = i.id
      ORDER BY w.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD item
router.post('/', async (req, res) => {
  const { project, material, unit, quantity, withdraw_qty, remarks } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO items (project, material, unit, quantity, withdraw_qty, remarks) VALUES (?, ?, ?, ?, ?, ?)',
      [project, material, unit, quantity, withdraw_qty || 0, remarks]
    );
    res.json({ id: result.insertId, message: 'Item added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE item
router.put('/:id', async (req, res) => {
  const { project, material, unit, quantity, withdraw_qty, remarks } = req.body;
  try {
    await db.query(
      'UPDATE items SET project=?, material=?, unit=?, quantity=?, withdraw_qty=?, remarks=? WHERE id=?',
      [project, material, unit, quantity, withdraw_qty, remarks, req.params.id]
    );
    res.json({ message: 'Item updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// WITHDRAW with project location
router.patch('/:id/withdraw', async (req, res) => {
  const { amount, project_location, remarks } = req.body;
  try {
    await db.query(
      'UPDATE items SET withdraw_qty = withdraw_qty + ? WHERE id = ?',
      [amount, req.params.id]
    );
    await db.query(
      'INSERT INTO withdrawals (item_id, project_location, quantity_used, withdraw_date, remarks) VALUES (?, ?, ?, CURDATE(), ?)',
      [req.params.id, project_location, amount, remarks || '']
    );
    res.json({ message: 'Withdrawal recorded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE item
// DELETE item
router.delete('/:id', async (req, res) => {
  try {
    // First delete related withdrawals
    await db.query('DELETE FROM withdrawals WHERE item_id = ?', [req.params.id]);
    // Then delete the item
    await db.query('DELETE FROM items WHERE id = ?', [req.params.id]);
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;