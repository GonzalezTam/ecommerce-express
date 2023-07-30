import { productsService } from '../services/products.service.js';

const getAllProducts = async (req, res) => {
  const result = await productsService.getAllProducts(req);
  res.send({ products: result });
};

const getAllProductsManager = async (req, res) => {
  const result = await productsService.getAllProductsManager(req);
  res.send({ products: result });
};

const getProductsById = async (req, res) => {
  const result = await productsService.getProductsById(req);
  res.send(result);
};

const createProduct = async (req, res) => {
  const result = await productsService.createProduct(req);
  res.send(result);
};

const updateProduct = async (req, res) => {
  const result = await productsService.updateProduct(req);
  res.send(result);
};

const updateProductsStockByOrder = async (req, res) => {
  const result = await productsService.updateProductsStockByOrder(req);
  res.send(result);
};

const deleteProduct = async (req, res) => {
  const result = await productsService.deleteProduct(req);
  res.send(result);
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
