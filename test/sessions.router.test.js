/* eslint-disable no-undef */
import supertest from 'supertest';
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
    it('-signup email should be valid', async () => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(body.email).to.match(regex);
    });
    it('-signup passwords should match', async () => {
      expect(body.password).to.be.equal(body.password2);
    });
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
  describe('Get users', () => {
    it('-should return 200 status code', async () => {
      const response = await requester.get('/api/users');
      expect(response.status).to.be.equal(200);
    });
    it('-users response result should be an array', async () => {
      const response = await requester.get('/api/users');
      expect(response.body.users.result).to.be.an('array');
    });
    it('-user array should not contain passwords', async () => {
      const response = await requester.get('/api/users');
      expect(response.body.users.result[0]).to.not.have.property('password');
    });
  });
});
