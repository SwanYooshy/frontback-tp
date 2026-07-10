import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

import authRoutes from '../src/routes/auth.routes.js';
import pool from '../src/config/db.js';

function buildApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/auth', authRoutes);
  return app;
}

const TEST_USER = {
  pseudo:   'testeur_vitest',
  email:    'vitest@test.com',
  password: 'motdepasse123',
};

beforeAll(async () => {
  await pool.query('DELETE FROM joueur WHERE email = ?', [TEST_USER.email]);
});

afterAll(async () => {
  await pool.query('DELETE FROM joueur WHERE email = ?', [TEST_USER.email]);
  await pool.end();
});

// REGISTER
describe('POST /auth/register', () => {
  test('crée un compte avec des données valides', async () => {
    const res = await request(buildApp())
      .post('/auth/register')
      .send(TEST_USER);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('joueur');
    expect(res.body.joueur.pseudo).toBe(TEST_USER.pseudo);
    expect(res.body.joueur.email).toBe(TEST_USER.email);
    expect(res.body.joueur).not.toHaveProperty('mdp_hash');
  });

  test('refuse si email déjà utilisé', async () => {
    const res = await request(buildApp())
      .post('/auth/register')
      .send(TEST_USER);

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Email déjà utilisé');
  });

  test('refuse si pseudo déjà utilisé', async () => {
    const res = await request(buildApp())
      .post('/auth/register')
      .send({ ...TEST_USER, email: 'autre_vitest@test.com' });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Pseudo déjà utilisé');
  });

  test('refuse si champ manquant', async () => {
    const res = await request(buildApp())
      .post('/auth/register')
      .send({ email: 'incomplet@test.com' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Tous les champs sont requis');
  });
});

// LOGIN
describe('POST /auth/login', () => {
  test('connecte un utilisateur avec des identifiants valides', async () => {
    const res = await request(buildApp())
      .post('/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('joueur');
    expect(res.body.joueur.email).toBe(TEST_USER.email);
  });

  test('refuse avec un mauvais mot de passe', async () => {
    const res = await request(buildApp())
      .post('/auth/login')
      .send({ email: TEST_USER.email, password: 'mauvais' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Identifiants incorrects');
  });

  test('refuse avec un email inconnu', async () => {
    const res = await request(buildApp())
      .post('/auth/login')
      .send({ email: 'inconnu@test.com', password: 'nimporte' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Identifiants incorrects');
  });

  test('refuse si champ manquant', async () => {
    const res = await request(buildApp())
      .post('/auth/login')
      .send({ email: TEST_USER.email });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email et mot de passe requis');
  });

  test('le token retourné est un JWT valide', async () => {
    const res = await request(buildApp())
      .post('/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    const parts = res.body.token.split('.');
    expect(parts).toHaveLength(3);
  });
});