import productModel from '../dao/models/product.model.js';

export const generateMockProducts = async () => {
  try {
    const mockProducts = [];

    for (let i = 0; i < 3; i++) {
      const newProduct = {
        title: `Product #${i}`,
        description: 'Random description',
        price: Math.floor(Math.random() * (1000 - 10 + 1) + 10), // 10 to 1000
        stock: Math.floor(Math.random() * 16), // 0 to 15
        code: `xxxdddddd-${i}`, // xxx-0 to xxx-99
        status: true,
        category: 'Category',
        thumbnails: [`https://picsum.photos/id/${i}/200/300`] // random image from picsum
      };
      mockProducts.push(newProduct);
    }
    await productModel.insertMany(mockProducts);
  } catch (error) {
    throw new Error(error);
  }
};

export default generateMockProducts;
