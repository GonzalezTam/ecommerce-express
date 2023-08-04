import cartModel from '../dao/models/cart.model.js';

const getAllCarts = async (req) => {
  try {
    const carts = await cartModel.find().lean().exec();
    return { status: 200, carts };
  } catch (error) {
    req.log.error(`[carts-getAllCarts] ${error.message}`);
    return { status: 500, error: error.message };
  }
};

const getCartById = async (req) => {
  const id = req.params.cid;
  try {
    const cart = await cartModel.findOne({ _id: id }).populate('products.productId').lean().exec();
    return { status: 200, cart };
  } catch (error) {
    req.log.error(`[carts-getCartById] ${error.message}`);
    return { status: 404, error: 'Cart not found' };
  }
};

const getCheckoutDetail = async (req) => {
  const id = req.params.cid;
  try {
    const cart = await cartModel.findOne({ _id: id }).populate('products.productId').lean().exec();
    const { products } = cart;
    const cartObj = {
      ...cart,
      products: products.map(p => {
        return {
          ...p.productId,
          quantity: p.quantity,
          subtotal: (p.productId.stock !== 0) ? p.quantity * p.productId.price : 0,
          notEnoughStockWarning: (p.productId.stock !== 0 && p.quantity > p.productId.stock) ? `There are only ${p.productId.stock} units left` : false
        };
      }),
      outOfStockFlag: products.some(p => p.productId.stock === 0)
    };

    const shippingPrice = 0; // hardcode shipping price
    const subTotal = cartObj?.products?.reduce((acc, curr) => acc + curr.subtotal, 0);
    const order = {
      user: req.user._id,
      shippingPrice: shippingPrice || 0,
      subTotal: subTotal || 0,
      total: subTotal + shippingPrice || 0
    };
    const userCartLength = products?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;

    const result = {
      cart: cartObj,
      order,
      userCartLength
    };

    return { status: 200, result };
  } catch (error) {
    req.log.error(`[carts-getCheckoutDetail] ${error.message}`);
    return { status: 500, error: error.message };
  }
};

const updateCartById = async (req) => {
  const id = req.params.cid;
  const { products } = req.body;
  if (!id) { return { status: 400, error: 'No Cart ID provided' }; }
  if (!products) { return { status: 400, error: 'No Products provided' }; }
  if (!Array.isArray(products)) { return { status: 400, error: 'Products must be an array' }; }
  try {
    const cartUpdated = await cartModel.updateOne({ _id: id }, { products }).lean().exec();
    req.log.info(`[carts-updateCartById] cart ${id} updated`);
    return { status: 200, cartUpdated };
  } catch (error) {
    req.log.error(`[carts-updateCartById] ${error.message}`);
    return { status: 404, error: 'Cart not found' };
  }
};

const deleteCartById = async (req) => {
  const id = req.params.cid;
  try {
    const cart = await cartModel.findOne({ _id: id }).lean().exec();
    await cartModel.deleteOne({ _id: id }).lean().exec();
    req.log.info(`[carts-deleteCartById] cart ${id} deleted`);
    return { status: 200, cart };
  } catch (error) {
    req.log.error(`[carts-deleteCartById] ${error.message}`);
    return { status: 404, error: 'Cart not found' };
  }
};

const createCart = async (req) => {
  const { products } = req.body;
  if (!products) return { status: 400, error: 'No Products provided' };
  if (!Array.isArray(products)) return { status: 400, error: 'Products must be an array' };
  try {
    const cart = await cartModel.create({ products });
    req.log.info(`[carts-createCart] cart ${cart._id} created`);
    return { status: 200, cartCreated: cart };
  } catch (error) {
    req.log.error(`[carts-createCart] ${error.message}`);
    return { status: 400, error: error.message };
  }
};

// Todo create remaining services.

export const cartsService = {
  getAllCarts,
  getCartById,
  getCheckoutDetail,
  updateCartById,
  deleteCartById,
  createCart
};
