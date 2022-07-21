import request from 'supertest';
import { app } from '../../app';

describe('Create User Route', () => {
  beforeAll(() => {

  })

  it('should be able to create a user', (done) => {
    request(app)
      .get('./users')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(200, done);
  })
})
