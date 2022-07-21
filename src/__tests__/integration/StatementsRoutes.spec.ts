import request from 'supertest';
import { Connection, createConnection } from 'typeorm';
import { app } from '../../app';

let connection: Connection;
let token: string;

describe('Integration Tests - Statements Routes', () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();

    const user = {
      name: 'statements-user',
      email: 'statements@user',
      password: '1234'
    }

    await request(app).post('/api/v1/users').send({
      name: user.name,
      email: user.email,
      password: user.password
    });

    token = (await request(app).post('/api/v1/sessions').send({
      email: user.email,
      password: user.password
    })).body.token;
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it('Should be able to deposit, withdraw and get balance', async () => {

    const res = await request(app).post('/api/v1/statements/deposit').send({
      amount: 400,
      description: 'test'
    }).set('Authorization', 'bearer ' + token);

    expect(res.status).toBe(201);
  })
})
