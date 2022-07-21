import request from 'supertest';
import { Connection, createConnection } from 'typeorm';
import { app } from '../../app';
import '../../database';

let connection: Connection;

describe('Create User Route', () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations({ transaction: 'all' });
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
})
