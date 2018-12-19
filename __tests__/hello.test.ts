import 'jest';

import * as request from 'supertest';

import app from '../src/app';

describe('Hello world', () => {
  it('Hello world', async (done) => {
    const result = await request(app).get('/');
    expect(result.body.message).toEqual('Hello, World!');
    expect(result.status).toEqual(200);
    done();
  });

  it('Hello {name}', async (done) => {
    const body = {
      name: {
        first: 'John',
        last: 'Doe',
      },
    };
    const result = await request(app)
      .get('/hello')
      .send(body);
    expect(result.body.message).toEqual('Hello, John!');
    expect(result.status).toEqual(200);
    done();
  });

  it('Hello {name} validation failure', async (done) => {
    const body = {
      name: {
        last: 'Doe',
      },
    };
    const result = await request(app)
      .get('/hello')
      .send(body);
    expect(result.body.statusCode).toEqual(400);
    expect(result.body.error).toEqual('Bad Request');
    expect(result.body.message).toContain('ValidationError');
    done();
  });
});
