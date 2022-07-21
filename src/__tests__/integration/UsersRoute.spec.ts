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

  it('should be able to create a user', async () => {
    const response = await request(app).post('/api/v1/users').send({
      name: 'int-test',
      email: 'int@test',
      password: '1234'
    });

    expect(response.status).toEqual(201);
  })
})
