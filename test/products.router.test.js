/* eslint-disable no-undef */
import supertest from 'supertest';
import { expect } from 'chai';
import { faker } from '@faker-js/faker';

const requester = supertest('http://localhost:3000');
const product = {
  title: faker.commerce.productName(),
  description: faker.commerce.productDescription(),
  category: faker.commerce.department(),
  owner: 'admin',
  price: faker.number.float(),
  stock: faker.number.int({ min: 1, max: 300 }),
  code: faker.string.uuid(),
  status: faker.datatype.boolean(),
  thumbnails: [faker.image.url(), faker.image.url()]
};

describe('Test /api/products', () => {
  describe('Create a new product', () => {
    it('-Product _id should not be provided', async () => {
      expect(product).to.not.have.property('_id');
    });
    it('-should return 201 status code', async () => {
      const response = await requester.post('/api/products').send(product);
      expect(response.status).to.be.equal(201);
    });
  });
  describe('Get all products', () => {
    it('-should return 200 status code', async () => {
      const response = await requester.get('/api/products?limit=all');
      expect(response.status).to.be.equal(200);
    });
    it('-products response should return a payload', async () => {
      const response = await requester.get('/api/products?limit=all');
      expect(response.body.products).to.have.property('payload');
    });
  });
  describe('Get a product by ID', () => {
    it('-should return 200 status code', async () => {
      const getProducts = await requester.get('/api/products?limit=all');
      const products = getProducts.body.products.payload;
      const productId = products[products.length - 1]._id; // get the last product ID
      // test the endpoint with first product ID from the database
      const response = await requester.get(`/api/products/${productId}`); // use the last product ID
      expect(response.status).to.be.equal(200);
    });
  });
  describe('Update a product by ID', () => {
    it('-should return 200 status code', async () => {
      const getProducts = await requester.get('/api/products?limit=all');
      const products = getProducts.body.products.payload;
      const productId = products[products.length - 1]._id; // get the last product ID
      // test the endpoint with first product ID from the database
      const response = await requester.put(`/api/products/${productId}`).send({
        price: faker.number.float(),
        stock: faker.number.int({ min: 1, max: 300 }),
        status: faker.datatype.boolean(),
        thumbnails: [faker.image.url(), faker.image.url()]
      }); // use the last product ID
      expect(response.status).to.be.equal(200);
    });
  });
  describe('Delete a product by ID', () => {
    it('-should return 200 status code', async () => {
      const getProducts = await requester.get('/api/products?limit=all');
      const products = getProducts.body.products.payload;
      const productId = products[products.length - 1]._id; // get the last product ID
      // test the endpoint with the last product ID from the database (the one we just created)
      const response = await requester.delete(`/api/products/${productId}`);
      expect(response.status).to.be.equal(200);
    });
  });
});
