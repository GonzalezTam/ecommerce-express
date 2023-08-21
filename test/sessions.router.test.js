/* eslint-disable no-undef */
import supertest from 'supertest';
import mongoose from 'mongoose';
import { expect } from 'chai';
import { faker } from '@faker-js/faker';

const requester = supertest('http://localhost:3000');
const user = {
  email: faker.internet.email(),
  password: faker.internet.password(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  age: faker.number.int({ min: 18, max: 100 })
};

describe('Test /api/session', async () => {
  const body = { ...user, password2: user.password };
  describe('Register a new user', () => {
    it('-should return 302 status code', async () => {
      const response = await requester.post('/api/session/register').send(body);
      expect(response.status).to.be.equal(302); // 302 Found is what we get when we redirect (in this case to /login)
    });
  });
  describe('Login user', () => {
    it('-should return 200 status code', async () => {
      const response = await requester.post('/api/session/login').send({
        email: body.email,
        password: body.password
      });
      expect(response.status).to.be.equal(200);
    });
  });
  describe('Logout user', () => {
    it('-should return 200 status code', async () => {
      const response = await requester.get('/api/session/logout');
      expect(response.status).to.be.equal(200);
    });
  });
  // drop user collection from the database
  await mongoose.connection.dropCollection('users');
});
