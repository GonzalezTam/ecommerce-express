import { productsService } from '../services/products.service.js';

const getAllProducts = async (req, res) => {
  const result = await productsService.getAllProducts(req);
  res.status(result.status).send({ products: result });
};

const getAllProductsManager = async (req, res) => {
  const result = await productsService.getAllProductsManager(req);
  res.status(result.status).send({ products: result });
};

const getProductsById = async (req, res) => {
  const result = await productsService.getProductsById(req);
  res.status(result.status).send(result);
};

const createProduct = async (req, res) => {
  const result = await productsService.createProduct(req);
  res.status(result.status).send(result);
};

const updateProduct = async (req, res) => {
  const result = await productsService.updateProduct(req);
  res.status(result.status).send(result);
};

const updateProductsStockByOrder = async (req, res) => {
  const result = await productsService.updateProductsStockByOrder(req);
  res.status(result.status).send(result);
};

const deleteProduct = async (req, res) => {
  const result = await productsService.deleteProduct(req);
  res.status(result.status).send(result);
};

const productsController = {
  getAllProducts,
  getAllProductsManager,
  getProductsById,
  createProduct,
  updateProduct,
  updateProductsStockByOrder,
  deleteProduct
};

export default productsController;
