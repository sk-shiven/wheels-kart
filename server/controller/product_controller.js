import { Product } from '../model/product_model.js';

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;
    
    if (!name || !description || price === undefined || !category || !image || stock === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    if (price <= 0 || stock < 0) {
      return res.status(400).json({ success: false, message: 'Invalid price or stock' });
    }

    const product = new Product({ name, description, price, category, image, stock });
    await product.save();
    
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    const query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (category && category !== 'All') {
      query.category = category;
    }

    let sortOptions = {};
    if (sort === 'price_asc') sortOptions.price = 1;
    if (sort === 'price_desc') sortOptions.price = -1;

    const products = await Product.find(query).sort(sortOptions);
    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID format' });
    }
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
