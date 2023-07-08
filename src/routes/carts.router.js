const { Router } = require('express');
const cartModel = require('./../dao/models/cart.model');
const productModel = require('./../dao/models/product.model');

const router = Router();

router.get('/', async (req, res) => {
	const carts = await cartModel.find().lean().exec();
	res.send({ carts });
});

router.get('/:cid', async (req, res) => {
	const id = req.params.cid;
	try{
		const cart = await cartModel.findOne({ _id: id }).populate('products.productId').lean().exec();
		if (cart) res.status(200).send({ cart }); else res.status(404).send({ 'Cart not found' : id });
	} catch (error) {
		console.log(error);
		res.status(404).send({ 'Cart not found' : id });
	}
});

router.put('/:cid', async (req, res) => {
	const id = req.params.cid;
	const { products } = req.body;
	if (!products) {
		res.status(400).send({ error: 'No Products provided' });
		return;
	}
	if (!Array.isArray(products)) {
		res.status(400).send({ error: 'Products must be an array' });
		return;
	}
	try{
		const cart = await cartModel.findOne({ _id: id }).lean().exec();
		await cartModel.updateOne({ _id: id }, { products }).lean().exec();
		res.status(200).send({ updatedCart: cart });
	} catch (error) {
		res.status(404).send({ 'Cart not found' : id });
	}
});

router.delete('/:cid', async (req, res) => {
	const id = req.params.cid;
	try{
		const cart = await cartModel.findOne({ _id: id }).lean().exec();
		await cartModel.deleteOne({ _id: id }).lean().exec();
		res.status(200).send({ cartDeleted : cart });
	} catch (error) {
		res.status(404).send({ 'Cart not found' : id });
	}
});

router.post('/', async (req, res) => {
	const { products } = req.body;
	if (!products) {
		res.status(400).send({ error: 'No Products provided' });
		return;
	}
	if (!Array.isArray(products)) {
		res.status(400).send({ error: 'Products must be an array' });
		return;
	}
	const cart = await cartModel.create({ products });
	res.status(200).send({ cartCreated: cart });
});

router.post('/:cid/products/:pid', async (req, res) => {
	const cartId = req.params.cid;
	const productId = req.params.pid;
	const quantity = 0;
	if (!req.params.cid) {
		res.status(400).send({ error: 'No Cart ID provided' });
		return;
	}
	if (!req.params.pid) {
		res.status(400).send({ error: 'No Product ID provided' });
		return;
	}
	try {
		const cart = await cartModel.findOne({ _id: cartId }).lean().exec();
		const product = await productModel.findOne({ _id: productId }).lean().exec();
		let productInCart = Object.values(cart.products).some(product => product.productId === productId);

		if (!productInCart) {
			//console.log('Adding new product to cart');
			const updatedCart = await cartModel.findOneAndUpdate({ _id: cartId }, { $push: { products: { productId, quantity: quantity+1 } } }).lean().exec();
			res.status(200).send({ updatedCart });
		} else {
			//console.log('Product already in cart, updating quantity');
			const updatedCart = await cartModel.updateOne({ _id: cartId, 'products.productId': productId }, { $inc: { 'products.$.quantity': 1 } }).lean().exec();
			res.status(200).send({ updatedCart });
		}
	} catch (error) {
		console.log(error);
		res.status(400).send({ 'Error adding product to cart' : error.message });
	}
});

router.put('/:cid/products/:pid', async (req, res) => {
	const cartId = req.params.cid;
	const productId = req.params.pid;
	const quantity = +req.body.quantity;
	if (!req.params.cid) {
		res.status(400).send({ error: 'No Cart ID provided' });
		return;
	}
	if (!req.params.pid) {
		res.status(400).send({ error: 'No Product ID provided' });
		return;
	}
	if (!req.body.quantity || isNaN(req.body.quantity)) {
		res.status(400).send({ error: 'Quantity is not a number' });
		return;
	}
	try {
		const cart = await cartModel.findOne({ _id: cartId }).lean().exec();
		let productInCart = Object.values(cart.products).some(product => product.productId === productId);
		if (!productInCart) {
			res.status(404).send({ error: 'Product not in cart' });
		} else {
			const updatedCart = await cartModel.updateOne({ _id: cartId, 'products.productId': productId }, { $set: { 'products.$.quantity': quantity } }).lean().exec();
			res.status(200).send({ updatedCart });
		}
	} catch (error) {
		res.status(400).send({ 'Error updating product quantity' : error.message });
	}
});

router.delete('/:cid/products/:pid', async (req, res) => {
	const cartId = req.params.cid;
	const productId = req.params.pid;
	try {
		const cart = await cartModel.findOne({ _id: cartId }).lean().exec();
		let productInCart = Object.values(cart.products).find(product => product.productId === productId);
		if (!productInCart) {
			res.status(404).send({ error: 'Product not in cart' });
		} else {
			if (productInCart.quantity === 1) { // if quantity is 1, remove product from cart
				const updatedCart = await cartModel.updateOne({ _id: cartId }, { $pull: { products: { productId } } }).lean().exec();
				res.status(200).send({ productRemoved : updatedCart });
			} else { // if quantity is greater than 1, decrement quantity
				const updatedCart = await cartModel.updateOne({ _id: cartId, 'products.productId': productId }, { $inc: { 'products.$.quantity': -1 } }).lean().exec();
				res.status(200).send({ productRemoved: updatedCart });
			}
		}
	} catch (error) {
		console.log(error);
		res.status(400).send({ 'Error removing product from cart' : `Could not remove product ${productId} from cart ${cartId}` });
	}
});

module.exports = router;
