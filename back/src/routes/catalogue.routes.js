import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

router.get('/blob-types', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM blob_type');
  res.json(rows);
});

router.get('/tour-types', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM tour_type');
  res.json(rows);
});

export default router;