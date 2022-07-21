import request from 'supertest';
import { Connection, createConnection } from 'typeorm';
import { app } from '../../app';

let connection: Connection;

describe('Create User Route', () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  })

  // afterAll(async() => {

  // })

  it('should be able to create a user', (done) => {
    request(app)
      .post('/api/v1/users')
      // .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(200, done);
  })
})
