const { Router, response } = require('express');
const productModel = require('./../dao/models/product.model');

const router = Router();

router.get('/', async (req, res) => {
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
		}

		// if limit is 'all', all products will be returned, no pagination
		if (limit === 'all') {
			const products = await productModel.find(query).lean().exec();
			const resObj = {
				status: 'success',
				payload: products,
				count: products.length
			}
			return res.send({ products: resObj });
		}

		// if there is no category or status, the query will be empty and all products will be returned
		const products = await productModel.paginate(query, { page: page || 1, limit: limit || 10, sort: sort ? { price: sort } : {} });

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
			totalCount: products.totalDocs
		}

		res.send({ products: resObj });
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
		}
		res.status(400).send({ products: resObj })
	}
});

router.get('/:id', async (req, res) => {
	const id = req.params.id;
	if (!id) {
		res.status(400).send({ error: 'Invalid ID' });
		return;
	}
	try{
		const product = await productModel.findOne({ _id: id }).lean().exec();
		if (product) res.send({ product }); else res.status(404).send({ 'Product not found' : id });
	} catch (error) {
		//console.log(error);
		res.status(404).send({ 'Product not found' : id });
	}
});


router.post('/', async (req, res) => {
	if (req.body.id || req.body._id) {
		res.status(400).send({ error: 'ID must not be provided' });
		return;
	}
	if (!req.body.title || !req.body.description || !req.body.price || !req.body.stock || !req.body.code || !req.body.category) {
		res.status(400).send({ error: 'Missing parameters' });
		return;
	}
	if(typeof req.body.title !== 'string' || typeof req.body.description !== 'string' || typeof req.body.code !== 'string' || typeof req.body.price !== 'number' || (req.body.status && typeof req.body.status !== 'boolean') || typeof req.body.stock !== 'number' || typeof req.body.category !== 'string' || (req.body.thumbnails && typeof req.body.thumbnails !== 'object')) {
		res.status(400).send({ error: 'Invalid parameters' });
		return;
	}

	const product = {
		title: req.body.title,
		description: req.body.description,
		price: req.body.price,
		stock : req.body.stock,
		code: req.body.code,
		status: req.body.status === undefined ? true : req.body.status,
		category: req.body.category,
		thumbnails: req.body.thumbnails ? req.body.thumbnails : [],
	};

	try {
		const newProduct = await productModel.create(product);
		res.send({ newProduct });
	} catch (error) {
		res.status(400).send({ error: error.message });
	}
});

router.put('/:id', async (req, res) => {
	const id = req.params.id;
	try{
		const toUpdateProduct = await productModel.findOne({ _id: id }).lean().exec();
		if (req.body.id) {
			res.status(400).send({ error: 'ID must not be provided' });
			return;
		}
		if((req.body.title && typeof req.body.title !== 'string') || (req.body.description && typeof req.body.description !== 'string') || (req.body.code && typeof req.body.code !== 'string') || (req.body.price && typeof req.body.price !== 'number') || (req.body.status && typeof req.body.status !== 'boolean') || (req.body.stock && typeof req.body.stock !== 'number') || (req.body.category && typeof req.body.category !== 'string') || (req.body.thumbnails && typeof req.body.thumbnails !== 'object')) {
			res.status(400).send({ error: 'Invalid parameters' });
			return;
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
			thumbnails: req.body.thumbnails ? req.body.thumbnails : toUpdateProduct.thumbnails,
		};
			const updatedProduct = await productModel.updateOne({ _id: id }, product);
			res.send({ updatedProduct });
	} catch (error) {
		res.status(400).send({ error: error.message });
	}
});

router.delete('/:id', async (req, res) => {
	const id = req.params.id;
	try {
		const deletedProduct = await productModel.deleteOne({ _id: id });
		res.send({ deletedProduct: { ...deletedProduct, _id: id } });
	} catch (error) {
		res.status(404).send({ 'Product not found' : id });
	}
});

module.exports = router;
