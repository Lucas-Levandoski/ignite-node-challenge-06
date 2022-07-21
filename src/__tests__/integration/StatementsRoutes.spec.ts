import request from 'supertest';
import { Connection, createConnection } from 'typeorm';
import { app } from '../../app';

let connection: Connection;
let token: string;
let user_id: string;

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

    const session = await request(app).post('/api/v1/sessions').send({
      email: user.email,
      password: user.password
    });

    token = session.body.token;
    user_id = session.body.user.id;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('Should be able to deposit, withdraw and get balance', async () => {
    expect(token).toBeTruthy();

    const depositRes = await request(app).post('/api/v1/statements/deposit').send({
      amount: 500,
      description: 'test'
    }).set('Authorization', 'bearer ' + token);

    expect(depositRes.status).toBe(201);

    const withdrawRes = await request(app).post('/api/v1/statements/withdraw').send({
      amount: 250,
      description: 'test'
    }).set('Authorization', 'bearer ' + token);

    expect(withdrawRes.status).toBe(201);

    const balanceExpected = depositRes.body.amount - withdrawRes.body.amount
    const balanceRes = await request(app).get('/api/v1/statements/balance').set('Authorization', 'bearer ' + token);

    expect(balanceRes.status).toBe(200);
    expect(balanceRes.body.balance).toBe(balanceExpected);
  });

  it('should not be able to get any statement endpoint by missing token', async () => {
    await request(app).post('/api/v1/statements/deposit').send({
      amount: 500,
      description: 'test'
    }).expect(401);

    await request(app).post('/api/v1/statements/withdraw').send({
      amount: 500,
      description: 'test'
    }).expect(401);

    await request(app).get('/api/v1/statements/balance').expect(401);

    await request(app).get('/api/v1/statements/statement-id-right-here-as-url-param').expect(401);
  });
})
