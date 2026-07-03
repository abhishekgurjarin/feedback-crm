import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import crypto from 'node:crypto';
import app from '../src/app.js';
import { prisma } from '../src/config/db.js';

let authToken = '';
let createdFeedbackId = '';

beforeAll(async () => {
  // Ensure we have a clean test database or seed basic user for auth tests
  await prisma.auditLog.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.adminUser.deleteMany();

  // Seed demo admin for test
  const passwordHash = crypto.scryptSync('AcowaleDemo2026', 'acowale_salt_2026', 64).toString('hex');
  await prisma.adminUser.create({
    data: {
      email: 'admin@acowale.com',
      passwordHash,
      name: 'Test Admin',
      role: 'SUPER_ADMIN',
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Acowale Pulse CRM — Backend API Suite', () => {
  describe('1. Health Check & Observability Endpoints', () => {
    it('GET /api/health should return 200 OK and database UP status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('UP');
      expect(res.body.data.database.status).toBe('connected');
    });

    it('GET /api/metrics should return 200 OK with runtime telemetry', async () => {
      const res = await request(app).get('/api/metrics');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(typeof res.body.data.totalRequests).toBe('number');
    });
  });

  describe('2. Public Feedback Form API', () => {
    it('POST /api/feedback should create feedback when payload is valid', async () => {
      const payload = {
        title: 'Super fast dashboard interface',
        category: 'Praise',
        rating: 5,
        comment: 'I really enjoy how snappy the filter animations and trend calculations are!',
        userEmail: 'reviewer@acowale.com',
        userName: 'Acowale Reviewer',
      };

      const res = await request(app).post('/api/feedback').send(payload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(payload.title);
      expect(res.body.data.status).toBe('NEW');
      createdFeedbackId = res.body.data.id;
    });

    it('POST /api/feedback should return 400 Validation Error for invalid category or short comment', async () => {
      const invalidPayload = {
        title: 'Hi', // too short
        category: 'InvalidCategory',
        rating: 10, // out of range
        comment: 'No', // too short
      };

      const res = await request(app).post('/api/feedback').send(invalidPayload);
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(Array.isArray(res.body.error.details)).toBe(true);
    });

    it('GET /api/feedback should return paginated results and search correctly', async () => {
      const res = await request(app).get('/api/feedback?search=snappy');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.pagination.total).toBeGreaterThanOrEqual(1);
    });
  });

  describe('3. Trend Analytics Summary API', () => {
    it('GET /api/analytics should compute accurate mathematical breakdown', async () => {
      const res = await request(app).get('/api/analytics');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(typeof res.body.data.averageRating).toBe('number');
      expect(typeof res.body.data.npsScore).toBe('number');
      expect(Array.isArray(res.body.data.categoryDistribution)).toBe(true);
      expect(res.body.data.sentimentBreakdown).toHaveProperty('positive');
    });
  });

  describe('4. Authentication & Protected Admin Actions', () => {
    it('POST /api/auth/login should return 401 for wrong credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@acowale.com', password: 'wrongpassword' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/login should return 200 and JWT token for correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@acowale.com', password: 'AcowaleDemo2026' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      authToken = res.body.data.token;
    });

    it('PATCH /api/feedback/:id/status should return 401 when no token is provided', async () => {
      const res = await request(app)
        .patch(`/api/feedback/${createdFeedbackId}/status`)
        .send({ status: 'RESOLVED' });
      expect(res.status).toBe(401);
    });

    it('PATCH /api/feedback/:id/status should update status when authenticated', async () => {
      const res = await request(app)
        .patch(`/api/feedback/${createdFeedbackId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'RESOLVED', adminNotes: 'Verified by Vitest automated suite' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('RESOLVED');
      expect(res.body.data.adminNotes).toBe('Verified by Vitest automated suite');
    });
  });
});
