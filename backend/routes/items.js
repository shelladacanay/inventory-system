const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all items
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM items ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET withdrawal history
router.get('/withdrawals/all', async (req, res) => {
  try {
    const { rows } = await db.query(`
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
    const { rows } = await db.query(
      'INSERT INTO items (project, material, unit, quantity, withdraw_qty, remarks) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [project, material, unit, quantity, withdraw_qty || 0, remarks]
    );
    res.json({ id: rows[0].id, message: 'Item added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE item
router.put('/:id', async (req, res) => {
  const { project, material, unit, quantity, withdraw_qty, remarks } = req.body;
  try {
    await db.query(
      'UPDATE items SET project=$1, material=$2, unit=$3, quantity=$4, withdraw_qty=$5, remarks=$6 WHERE id=$7',
      [project, material, unit, quantity, withdraw_qty, remarks, req.params.id]
    );
    res.json({ message: 'Item updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// WITHDRAW
router.patch('/:id/withdraw', async (req, res) => {
  const { amount, project_location, remarks } = req.body;
  try {
    await db.query(
      'UPDATE items SET withdraw_qty = withdraw_qty + $1 WHERE id = $2',
      [amount, req.params.id]
    );
    await db.query(
      'INSERT INTO withdrawals (item_id, project_location, quantity_used, withdraw_date, remarks) VALUES ($1, $2, $3, NOW(), $4)',
      [req.params.id, project_location, amount, remarks || '']
    );
    res.json({ message: 'Withdrawal recorded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE item
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM withdrawals WHERE item_id = $1', [req.params.id]);
    await db.query('DELETE FROM items WHERE id = $1', [req.params.id]);
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;