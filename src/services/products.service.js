import productModel from '../dao/models/product.model.js';

const getAllProducts = async (req) => {
  try {
    const limit = req.query.limit;
    const page = req.query.page;
    const sort = req.query.sort;

    // query params for category and status
    const category = req.query.category || null;
    const status = req.query.status || null;
    const query = {
      ...(category && { category }),
      ...(status && { status })
    };

    // if limit is 'all', all products will be returned, no pagination
    if (limit === 'all') {
      const products = await productModel.find(query).lean().exec();
      const resObj = {
        status: 'success',
        payload: products,
        count: products.length
      };
      return resObj;
    }

    // if there is no category or status, the query will be empty and all products will be returned
    const products = await productModel.paginate(query, { page: page || 1, limit: limit || 10, sort: sort ? { price: sort } : {} });

    const loopedPages = [];
    for (let i = 0; i < products.totalPages; i++) {
      loopedPages.push({
        page: i + 1,
        active: i === products.page - 1
      });
    }

    const resObj = {
      status: 'success',
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
  } catch {
    const resObj = {
      status: 'error',
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
    return resObj;
  }
};

const getAllProductsManager = async (req) => {
  try {
    const limit = req.query.limit;
    const page = req.query.page;
    const sort = req.query.sort;

    // query params for category and status
    const category = req.query.category || null;
    const status = req.query.status || null;
    const query = {
      ...(category && { category }),
      ...(status && { status })
    };

    // if limit is 'all', all products will be returned, no pagination
    if (limit === 'all') {
      const products = await productModel.find(query).lean().exec();
      const resObj = {
        status: 'success',
        payload: products,
        count: products.length
      };
      return resObj;
    }

    // if there is no category or status, the query will be empty and all products will be returned
    const products = await productModel.paginate(query, { page: page || 1, limit: limit || 10, sort: sort ? { price: sort } : {} });

    const loopedPages = [];
    for (let i = 0; i < products.totalPages; i++) {
      loopedPages.push({
        page: i + 1,
        active: i === products.page - 1
      });
    }

    const resObj = {
      status: 'success',
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
  } catch {
    const resObj = {
      status: 'error',
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
    return resObj;
  }
};

const getProductsById = async (req) => {
  const id = req.params.id;
  if (!id) {
    const result = { error: 'Invalid ID', status: 400 };
    return result;
  }
  try {
    const product = await productModel.findOne({ _id: id }).lean().exec();
    const result = { product, status: 200 };
    return result;
  } catch (error) {
    const result = { error: 'Product not found', status: 404 };
    return result;
  }
};

const createProduct = async (req) => {
  if (req.body.id || req.body._id) {
    const result = { error: 'ID must not be provided', status: 400 };
    return result;
  }
  if (!req.body.title || !req.body.description || !req.body.price || !req.body.stock || !req.body.code || !req.body.category) {
    const result = { error: 'Missing parameters', status: 400 };
    return result;
  }
  if (typeof req.body.title !== 'string' || typeof req.body.description !== 'string' || typeof req.body.code !== 'string' || typeof req.body.price !== 'number' || (req.body.status && typeof req.body.status !== 'boolean') || typeof req.body.stock !== 'number' || typeof req.body.category !== 'string' || (req.body.thumbnails && typeof req.body.thumbnails !== 'object')) {
    const result = { error: 'Invalid parameters', status: 400 };
    return result;
  }

  const product = {
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
    return result;
  } catch (error) {
    const result = { error: 'There was an error while creating the product', status: 400 };
    return result;
  }
};

const updateProduct = async (req) => {
  const id = req.params.id;
  try {
    const toUpdateProduct = await productModel.findOne({ _id: id }).lean().exec();
    if (req.body.id) {
      const result = { error: 'ID must not be provided', status: 400 };
      return result;
    }
    if ((req.body.title && typeof req.body.title !== 'string') || (req.body.description && typeof req.body.description !== 'string') || (req.body.code && typeof req.body.code !== 'string') || (req.body.price && typeof req.body.price !== 'number') || (req.body.status && typeof req.body.status !== 'boolean') || (req.body.stock && typeof req.body.stock !== 'number') || (req.body.category && typeof req.body.category !== 'string') || (req.body.thumbnails && typeof req.body.thumbnails !== 'object')) {
      const result = { error: 'Invalid parameters', status: 400 };
      return result;
    }

    const product = {
      ...toUpdateProduct,
      title: req.body.title ? req.body.title : toUpdateProduct.title,
      description: req.body.description ? req.body.description : toUpdateProduct.description,
      price: req.body.price ? req.body.price : toUpdateProduct.price,
      stock: req.body.stock ? req.body.stock : toUpdateProduct.stock,
      code: req.body.code ? req.body.code : toUpdateProduct.code,
      status: req.body.status === undefined ? toUpdateProduct.status : req.body.status,
      category: req.body.category ? req.body.category : toUpdateProduct.category,
      thumbnails: req.body.thumbnails ? req.body.thumbnails : toUpdateProduct.thumbnails
    };
    const updatedProduct = await productModel.updateOne({ _id: id }, product);
    const result = { product: updatedProduct, status: 200 };
    return result;
  } catch (error) {
    const result = { error: 'Product not found', status: 404 };
    return result;
  }
};

const deleteProduct = async (req) => {
  const id = req.params.id;
  try {
    const deletedProduct = await productModel.deleteOne({ _id: id });
    const result = { deletedProduct: { ...deletedProduct, _id: id }, status: 200 };
    return result;
  } catch (error) {
    const result = { error: 'Product not found', status: 404 };
    return result;
  }
};

export const productsService = {
  getAllProducts,
  getAllProductsManager,
  getProductsById,
  createProduct,
  updateProduct,
  deleteProduct
};
