import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from './model/product_model.js';

dotenv.config();

const dummyProducts = [
  {
    name: "Red Sports Car",
    description: "A fast dummy red sports car for kids.",
    price: 19.99,
    category: "Cars",
    image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    stock: 50
  },
  {
    name: "Blue SUV Model",
    description: "Die-cast blue SUV dummy model.",
    price: 24.99,
    category: "Cars",
    image: "https://images.unsplash.com/photo-1511407397940-d57f68e81203?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    stock: 30
  },
  {
    name: "Action Figure Hero",
    description: "A super hero action figure toy.",
    price: 14.99,
    category: "Toys",
    image: "https://images.unsplash.com/photo-1593085260707-5377ba37f868?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    stock: 100
  },
  {
    name: "Building Blocks Set",
    description: "Creative building blocks for all ages.",
    price: 29.99,
    category: "Toys",
    image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    stock: 45
  },
  {
    name: "Classic Racing Car",
    description: "Vintage racing dummy car.",
    price: 34.99,
    category: "Cars",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    stock: 15
  },
  {
    name: "Plush Bear",
    description: "Soft and cuddly plush bear toy.",
    price: 9.99,
    category: "Toys",
    image: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    stock: 200
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.dbURL);
    console.log('DB connected for seeding');
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    // Insert dummy products
    await Product.insertMany(dummyProducts);
    console.log('Dummy products seeded successfully');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding data:', error);
    mongoose.connection.close();
  }
};

seedDB();
