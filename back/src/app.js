import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import pool from './config/db.js';
import authRoutes from './routes/auth.routes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);

// Test de connexion BDD
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

io.on('connection', (socket) => {
  console.log(`Socket connecté : ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`Socket déconnecté : ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});