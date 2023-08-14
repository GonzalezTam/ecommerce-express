import productModel from '../dao/models/product.model.js';
import { cartsService } from '../services/carts.service.js';

const getAllProducts = async (req) => {
  try {
    const limit = req.query.limit || undefined;
    const page = req.query.page || 1;
    const price = req.query.price || null;

    // query params for category and status
    const category = req.query.category || null;
    const status = req.query.status || null;
    const query = {
      ...(category && { category }),
      ...(status && { status }),
      ...(price && { price })
    };

    // if limit has a value, products will be returned with no pagination
    if (limit === 'all' || limit > 0) {
      const products = limit === 'all' ? await productModel.find(query).lean().exec() : await productModel.find(query).limit(parseInt(limit)).lean().exec();
      const resObj = {
        status: 200,
        payload: products,
        count: products.length
      };
      return resObj;
    }

    // if there is no category or status, the query will be empty and all products will be returned
    const products = await productModel.paginate(query, { page: page || 1, limit: 10 });

    const loopedPages = [];
    for (let i = 0; i < products.totalPages; i++) {
      loopedPages.push({
        page: i + 1,
        active: i === products.page - 1
      });
    }

    const resObj = {
      status: 200,
      payload: products.docs,
      totalPages: products.totalPages,
      prevPage: products.prevPage || null,
      nextPage: products.nextPage || null,
      page: products.page || null,
      hasPrevPage: products.hasPrevPage,
      hasNextPage: products.hasNextPage,
      prevLink: products.hasPrevPage ? `/products?page=${products.prevPage}` : null,
      nextLink: products.hasNextPage ? `/products?page=${products.nextPage}` : null,
      count: products.docs.length,
      totalCount: products.totalDocs,
      loopedPages
    };
    return resObj;
  } catch (error) {
    const resObj = {
      status: 400,
      message: 'There was an error while querying the database',
      payload: [],
      totalPages: 0,
      prevPage: null,
      nextPage: null,
      page: null,
      hasPrevPage: false,
      hasNextPage: false,
      prevLink: null,
      nextLink: null,
      count: null,
      totalCount: null
    };
    req.log.error(`[products-getAllProducts] ${error.message}`);
    return resObj;
  }
};

const getAllProductsManager = async (req) => {
  const user = req.session.user;
  try {
    const limit = req.query.limit || undefined;
    const page = req.query.page || 1;
    const price = req.query.price || null;

    // query params for category and status
    const category = req.query.category || null;
    const status = req.query.status || null;
    const query = {
      ...(category && { category }),
      ...(status && { status }),
      ...(price && { price }),
      // if user is premium, only products created by the user will be returned
      ...(user.role === 'premium' && { owner: user.email })
    };

    // if limit has a value, products will be returned with no pagination
    if (limit === 'all' || limit > 0) {
      const products = limit === 'all' ? await productModel.find(query).lean().exec() : await productModel.find(query).limit(parseInt(limit)).lean().exec();
      const resObj = {
        status: 200,
        payload: products,
        count: products.length
      };
      return resObj;
    }

    // if there is no category or status, the query will be empty and all products will be returned
    const products = await productModel.paginate(query, { page: page || 1, limit: 10 });

    const loopedPages = [];
    for (let i = 0; i < products.totalPages; i++) {
      loopedPages.push({
        page: i + 1,
        active: i === products.page - 1
      });
    }

    const resObj = {
      status: 200,
      payload: products.docs,
      totalPages: products.totalPages,
      prevPage: products.prevPage || null,
      nextPage: products.nextPage || null,
      page: products.page || null,
      hasPrevPage: products.hasPrevPage,
      hasNextPage: products.hasNextPage,
      prevLink: products.hasPrevPage ? `/productsmanager?page=${products.prevPage}` : null,
      nextLink: products.hasNextPage ? `/productsmanager?page=${products.nextPage}` : null,
      count: products.docs.length,
      totalCount: products.totalDocs,
      loopedPages
    };
    return resObj;
  } catch (error) {
    const resObj = {
      status: 400,
      message: 'There was an error while querying the database',
      payload: [],
      totalPages: 0,
      prevPage: null,
      nextPage: null,
      page: null,
      hasPrevPage: false,
      hasNextPage: false,
      prevLink: null,
      nextLink: null,
      count: null,
      totalCount: null
    };
    req.log.error(`[products-getAllProductsManager] ${error.message}`);
    return resObj;
  }
};

const getProductsById = async (req) => {
  const id = req.params.id;
  if (!id) {
    req.log.error('[products-getProductsById] ID not provided');
    const result = { error: 'Invalid ID', status: 400 };
    return result;
  }
  try {
    const product = await productModel.findOne({ _id: id }).lean().exec();
    const result = { product, status: 200 };
    return result;
  } catch (error) {
    const result = { error: 'Product not found', status: 404 };
    req.log.error(`[products-getProductsById] ${error.message}`);
    return result;
  }
};

const createProduct = async (req) => {
  if (req.session.user.role === 'user') { return { error: 'You are not authorized to perform this action', status: 401 }; }

  if (req.body.id || req.body._id) {
    const result = { error: 'ID must not be provided', status: 400 };
    req.log.error('[products-createProduct] ID provided');
    return result;
  }
  if (!req.body.title || !req.body.description || !req.body.price || (!req.body.stock && req.body.stock !== 0) || !req.body.code || !req.body.category) {
    const result = { error: 'Missing parameters', status: 400 };
    req.log.error('[products-createProduct] Missing parameters');
    return result;
  }
  if (typeof req.body.title !== 'string' || typeof req.body.description !== 'string' || typeof req.body.code !== 'string' || typeof req.body.price !== 'number' || (req.body.status && typeof req.body.status !== 'boolean') || typeof req.body.stock !== 'number' || typeof req.body.category !== 'string' || (req.body.thumbnails && typeof req.body.thumbnails !== 'object')) {
    const result = { error: 'Invalid parameters', status: 400 };
    req.log.error('[products-createProduct] Invalid parameters');
    return result;
  }

  const product = {
    owner: req.session.user.role === 'admin' ? 'admin' : req.user.email,
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    stock: req.body.stock,
    code: req.body.code,
    status: req.body.status === undefined ? true : req.body.status,
    category: req.body.category,
    thumbnails: req.body.thumbnails ? req.body.thumbnails : []
  };

  try {
    const newProduct = await productModel.create(product);
    const result = { product: newProduct, status: 201 };
    req.log.info('[products-createProduct] product created successfully');
    return result;
  } catch (error) {
    const result = { error: 'There was an error while creating the product', status: 400 };
    req.log.error(`[products-createProduct] ${error.message}`);
    return result;
  }
};

const updateProduct = async (req) => {
  const id = req.params.id;
  try {
    // if the user is not admin, he can only update his own products
    const userUpdating = req.session.user.role === 'admin' ? 'admin' : req.user.email;
    const toUpdateProduct = await productModel.findOne({ _id: id }).lean().exec();
    const findProductByCode = await productModel.findOne({ code: req.body.code }).lean().exec();
    if (userUpdating !== 'admin' && userUpdating !== toUpdateProduct.owner) { return { error: 'You are not authorized to perform this action', status: 401 }; }
    if (req.body.id) {
      const result = { error: 'ID must not be provided', status: 400 };
      req.log.error('[products-updateProduct] ID provided');
      return result;
    }
    if ((req.body.title && typeof req.body.title !== 'string') || (req.body.description && typeof req.body.description !== 'string') || (req.body.code && typeof req.body.code !== 'string') || (req.body.price && typeof req.body.price !== 'number') || (req.body.status && typeof req.body.status !== 'boolean') || (req.body.stock && typeof req.body.stock !== 'number') || (req.body.category && typeof req.body.category !== 'string') || (req.body.thumbnails && typeof req.body.thumbnails !== 'object')) {
      const result = { error: 'Invalid parameters', status: 400 };
      req.log.error('[products-updateProduct] Invalid parameters');
      return result;
    }
    if (req.body.code === findProductByCode?.code) {
      const result = { error: 'A product with this code already exists', status: 400 };
      req.log.error('[products-updateProduct] Code already exists');
      return result;
    }
    const product = {
      ...toUpdateProduct,
      title: req.body.title ? req.body.title : toUpdateProduct.title,
      description: req.body.description ? req.body.description : toUpdateProduct.description,
      price: req.body.price ? req.body.price : toUpdateProduct.price,
      stock: (req.body.stock || req.body.stock === 0) ? req.body.stock : toUpdateProduct.stock,
      code: req.body.code ? req.body.code : toUpdateProduct.code,
      status: req.body.status === undefined ? toUpdateProduct.status : req.body.status,
      category: req.body.category ? req.body.category : toUpdateProduct.category,
      thumbnails: req.body.thumbnails ? req.body.thumbnails : toUpdateProduct.thumbnails
    };
    const updatedProduct = await productModel.updateOne({ _id: id }, product);
    const result = { product: updatedProduct, status: 200 };
    req.log.info('[products-updateProduct] product updated successfully');
    return result;
  } catch (error) {
    const result = { error: 'Product not found', status: 404 };
    req.log.error(`[products-updateProduct] ${error.message}`);
    return result;
  }
};

// This function is used to update the stock of a product after a purchase
const updateProductsStockByOrder = async (req, res) => {
  const successfullyBought = [];
  const notEnoughRequested = [];
  const notFound = [];
  try {
    // get the cart detail
    const orderDetail = await cartsService.getCheckoutDetail(req);
    if (!orderDetail.result) return { status: 404, error: 'Cart not found' };

    if (orderDetail.error) throw new Error(orderDetail.error);
    const products = orderDetail.result?.cart?.products;

    if (!products) throw new Error('No Products provided');
    if (!Array.isArray(products)) throw new Error('Products must be an array');

    // update the stock of each product regarding the quantity requested
    const promises = products.map(async (p) => {
      // check if the product exists and if there is enough stock
      const product = await productModel.findOne({ _id: p._id }).lean().exec();
      if (!product) { notFound.push(p); return; }
      const quantityRequested = p.quantity;

      // if there is not enough stock, add the product to the notEnoughWanted array
      if (product.stock < quantityRequested) {
        notEnoughRequested.push({ id: product._id, product: product.title, quantityRequested, stock: product.stock, price: product.price });
        return;
      }

      // update the stock of the product in the database
      const newStock = product.stock - quantityRequested;
      const updateOne = await productModel.updateOne({ _id: p._id }, { stock: newStock });
      if (updateOne) {
        successfullyBought.push({ id: product._id, product: product.title, quantityBought: quantityRequested, price: product.price });
        return updateOne;
      }
    });
    // wait for all the updates to finish
    await Promise.all(promises);

    // return the result with stock or unavailability warnings
    const result = {
      operations: { successfullyBought, notEnoughRequested, notFound },
      toCharge: successfullyBought.reduce((acc, curr) => acc + curr.price * curr.quantityBought, 0)
    };
    // if any product was updated (bought), return the result.
    if (successfullyBought.length) {
      req.log.info('[products-updateProductsStockByOrder] Successfully bought');
      return { status: 200, result };
    }

    // if no product was updated, return an error
    req.log.error('[products-updateProductsStockByOrder] Not enough stock');
    return { status: 400, result, error: 'Not enough stock' };
  } catch (error) {
    const result = { status: 400, error: error.message };
    req.log.error(`[products-updateProductsStockByOrder] ${error.message}`);
    return result;
  }
};

const deleteProduct = async (req) => {
  const id = req.params.id;
  try {
    // check if the user is authorized to delete the product
    const userDeleting = req.session.user.role === 'admin' ? 'admin' : req.user.email;
    const toDeleteProduct = await productModel.findOne({ _id: id }).lean().exec();
    if (userDeleting !== 'admin' && userDeleting !== toDeleteProduct.owner) { return { error: 'You are not authorized to perform this action', status: 401 }; }

    // delete the product
    const deletedProduct = await productModel.deleteOne({ _id: id });
    const result = { deletedProduct: { ...deletedProduct, _id: id }, status: 200 };
    req.log.info('[products-deleteProduct] product deleted successfully');
    return result;
  } catch (error) {
    const result = { error: 'Product not found', status: 404 };
    req.log.error(`[products-deleteProduct] ${error.message}`);
    return result;
  }
};

export const productsService = {
  getAllProducts,
  getAllProductsManager,
  getProductsById,
  createProduct,
  updateProduct,
  updateProductsStockByOrder,
  deleteProduct
};
