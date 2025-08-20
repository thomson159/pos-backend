import request from 'supertest';
import express from 'express';
import { HelloController } from 'src/controllers/HelloController';

const app = express();
app.use(express.json());

app.get('/hello', async (req, res) => {
  const ctrl = new HelloController();
  const result = await ctrl.getHello();
  res.json(result);
});

describe('HelloController', () => {
  it('GET /hello should return hello message', async () => {
    const response = await request(app).get('/hello');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Hello from TSOA!' });
  });
});
