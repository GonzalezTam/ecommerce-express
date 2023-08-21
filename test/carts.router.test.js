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

// generate a random quantity to test endpoints that require a quantity
const quantity = faker.number.int({ min: 1, max: 10 });

// create a product to test endpoints that require a product
const createdProduct = await requester.post('/api/products').send(product);
const createdProductID = createdProduct.body.product._id;

describe('Test /api/carts', async () => {
  describe('Create a new empy cart', () => {
    const body = { products: [] };
    it('-body should have a products array', () => {
      expect(body).to.have.property('products');
      expect(body.products).to.be.an('array');
    });
    it('-should return 201 status code', async () => {
      const response = await requester.post('/api/carts').send(body);
      expect(response.status).to.be.equal(201);
    });
  });
  describe('Get all carts', () => {
    it('-should return 200 status code', async () => {
      const response = await requester.get('/api/carts');
      expect(response.status).to.be.equal(200);
    });
  });
  describe('Get a cart by ID', () => {
    it('-should return 200 status code', async () => {
      const getCarts = await requester.get('/api/carts');
      const carts = getCarts.body.carts;
      const cartId = carts[0]._id;
      const response = await requester.get(`/api/carts/${cartId}`);
      expect(response.status).to.be.equal(200);
    });
    it('-should return an object with products array', async () => {
      const getCarts = await requester.get('/api/carts');
      const carts = getCarts.body.carts;
      const cartId = carts[0]._id;
      const response = await requester.get(`/api/carts/${cartId}`);
      expect(response.body.cart).to.have.property('products');
      expect(response.body.cart.products).to.be.an('array');
    });
  });
  describe('Add a product to a cart', () => {
    it('- product _id should be a string', () => {
      expect(createdProductID).to.be.a('string');
    });
    it('-should return 200 status code', async () => {
      const getCarts = await requester.get('/api/carts');
      const carts = getCarts.body.carts;
      const cartId = carts[carts.length - 1]._id; // get the last cart ID
      const response = await requester.post(`/api/carts/${cartId}/products/${createdProductID}`);
      expect(response.status).to.be.equal(200);
    });
  });
  describe('Update a product quantity in a cart', () => {
    it('-quantity should be an int', () => {
      expect(quantity).to.satisfy(Number.isInteger);
    });
    it('-should return 200 status code', async () => {
      const getCarts = await requester.get('/api/carts');
      const carts = getCarts.body.carts;
      const cartId = carts[carts.length - 1]._id; // get the last cart ID
      const body = { quantity };
      const response = await requester.put(`/api/carts/${cartId}/products/${createdProductID}`).send(body);
      expect(response.status).to.be.equal(200);
    });
  });
  describe('Delete a cart', () => {
    it('-should return 200 status code', async () => {
      const getCarts = await requester.get('/api/carts');
      const carts = getCarts.body.carts;
      const cartId = carts[carts.length - 1]._id; // get the last cart ID
      const response = await requester.delete(`/api/carts/${cartId}`);
      expect(response.status).to.be.equal(200);
    });
  });
});
