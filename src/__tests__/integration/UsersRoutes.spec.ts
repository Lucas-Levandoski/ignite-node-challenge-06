import request from 'supertest';
import { Connection, createConnection } from 'typeorm';
import { app } from '../../app';

let connection: Connection;

describe('Integration Tests - Users Routes', () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it('should be able to create, authenticate a user and get his profile ', async () => {
    const user = {
      name: 'create-user',
      email: 'create@user',
      password: '1234'
    }

    const createUserRes = await request(app).post('/api/v1/users').send({
      name: user.name,
      email: user.email,
      password: user.password
    });

    expect(createUserRes.status).toBe(201);

    const authUserRes = await request(app).post('/api/v1/sessions').send({
      email: user.email,
      password: user.password
    })

    expect(authUserRes.status).toBe(200);
    expect(authUserRes.body.token).toBeTruthy();

    const userProfileRes = await request(app).get('/api/v1/profile')
      .set('Authorization', 'bearer ' + authUserRes.body.token);

    expect(userProfileRes.status).toBe(200);
    expect(userProfileRes.body.name).toBe(user.name);
  })

  it('should fail to get a user profile for missing token', async () => {

    const res = await request(app).get('/api/v1/profile');

    expect(res.status).toBe(401);
  })

  it('should fail when trying to authenticate with wrong data', async () => {
    const user = {
      name: 'auth-user',
      email: 'auth@user',
      password: '1234'
    }

    await request(app).post('/api/v1/users').send({
      name: user.name,
      email: user.email,
      password: user.password
    });

    await request(app).post('/api/v1/sessions').send({
      email: user.email,
      password: '1111'
    }).expect(401);

    await request(app).post('/api/v1/sessions').send({
      email: 'not the real e-mail',
      password: user.password
    }).expect(401);
  })
})
