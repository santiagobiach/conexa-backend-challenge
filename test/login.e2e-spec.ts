import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { ValidationPipe } from '@nestjs/common';
import mongoose from 'mongoose';

describe('AuthController (E2E)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let connection: mongoose.Connection;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri), // Use in-memory MongoDB
        AppModule, // Import your app module
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    connection = moduleFixture.get<mongoose.Connection>('DatabaseConnection');
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
    await mongod.stop();
    await app.close();
  });

  describe('register', () => {
    it('should create a user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@example.com', password: 'Password123@,' });

      expect(response.status).toBe(201);
      expect(response.body.message).toContain('User created successfully');
    });

    it('should fail if email is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'tesle.com', password: 'Password123@,' });
      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(['email must be an email']);
    });

    it('should fail if password is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@example.com', password: 'Passworasdf' });
      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(['password is not strong enough']);
    });

    it('should not allow duplicate emails', async () => {
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'duplicate@example.com',
        password: 'Password123@,',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'duplicate@example.com', password: 'Password123@,' });

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('Email is already in use');
    });
  });
  describe('login', () => {
    it('should return valid JWT for valid login', async () => {
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'duplicate@example.com',
        password: 'Password123@,',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'duplicate@example.com', password: 'Password123@,' });

      expect(response.status).toBe(200);
      expect(response.body.email).toContain('duplicate@example.com');
    });

    it('should return 401 if user does not exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'wrong@example.com', password: 'Wronpass123@,' });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Unauthorized');
    });

    it('should return 401 if password is different', async () => {
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'duplicate@example.com',
        password: 'Password123@,',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'duplicate@example.com',
          password: 'NOtTHeSAme123121@,',
        });

      expect(response.status).toBe(401);
    });
  });
  describe('users', () => {
    it('should fail if there is no JWT provided', async () => {
      const response = await request(app.getHttpServer()).get('/auth/users');
      expect(response.status).toBe(401);
    });

    it('should return all users', async () => {
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'duplicate@example.com',
        password: 'Password123@,',
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'duplicate@example.com', password: 'Password123@,' });
      const usersResponse = await request(app.getHttpServer())
        .get('/auth/users')
        .set('Authorization', `Bearer ${response.body.access_token}`);
      expect(usersResponse.status).toBe(200);
    });
  });
});
