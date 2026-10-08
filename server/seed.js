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
  },
  {
    name: "Yellow Taxi Model",
    description: "Iconic yellow taxi die-cast model.",
    price: 15.99,
    category: "Cars",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    stock: 25
  },
  {
    name: "Remote Control Helicopter",
    description: "Rechargeable RC helicopter with gyro.",
    price: 49.99,
    category: "Toys",
    image: "https://images.unsplash.com/photo-1574345592868-b3f54bf565b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    stock: 12
  },
  {
    name: "Police Cruiser Toy",
    description: "Police car with lights and sirens.",
    price: 22.99,
    category: "Cars",
    image: "https://images.unsplash.com/photo-1627999815023-e18e388d55d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    stock: 18
  },
  {
    name: "Dinosaur Figurine Set",
    description: "Set of 10 realistic dinosaur figurines.",
    price: 18.99,
    category: "Toys",
    image: "https://images.unsplash.com/photo-1569992928881-a9f1a23861fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    stock: 40
  },
  {
    name: "Wooden Train Set",
    description: "Classic wooden train with tracks.",
    price: 39.99,
    category: "Toys",
    image: "https://images.unsplash.com/photo-1536768130543-0a7eb51d5c7c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    stock: 35
  },
  {
    name: "Off-Road Monster Truck",
    description: "Monster truck with oversized tires.",
    price: 28.99,
    category: "Cars",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    stock: 20
  },
  {
    name: "Educational Puzzle Board",
    description: "Wooden puzzle board for toddlers.",
    price: 12.99,
    category: "Toys",
    image: "https://images.unsplash.com/photo-1561736778-92e52a7769ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    stock: 60
  },
  {
    name: "Fire Truck Model",
    description: "Red fire truck with extendable ladder.",
    price: 25.99,
    category: "Cars",
    image: "https://images.unsplash.com/photo-1610300188941-b0db03657755?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    stock: 15
  },
  {
    name: "Robot Action Toy",
    description: "Interactive walking and talking robot.",
    price: 55.99,
    category: "Toys",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    stock: 8
  },
  {
    name: "Miniature Sports Car Set",
    description: "Pack of 5 miniature sports cars.",
    price: 16.99,
    category: "Cars",
    image: "https://images.unsplash.com/photo-1565022536102-f7645c84354a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    stock: 100
  },
  {
    name: "Dollhouse Starter Kit",
    description: "Beautiful wooden dollhouse with furniture.",
    price: 89.99,
    category: "Toys",
    image: "https://images.unsplash.com/photo-1590747443187-578ebbc68f56?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    stock: 5
  },
  {
    name: "Construction Dump Truck",
    description: "Sturdy yellow dump truck for sandbox play.",
    price: 21.99,
    category: "Cars",
    image: "https://images.unsplash.com/photo-1558227031-15b5cd91e2b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    stock: 22
  },
  {
    name: "Magic Chemistry Set",
    description: "Safe chemistry experiments for kids.",
    price: 32.99,
    category: "Toys",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    stock: 14
  },
  {
    name: "Electric Train Engine",
    description: "Battery operated train engine with sounds.",
    price: 27.99,
    category: "Toys",
    image: "https://images.unsplash.com/photo-1581452932371-c0627e90c8a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    stock: 19
  },
  {
    name: "Convertible Toy Car",
    description: "Pink convertible toy car.",
    price: 18.99,
    category: "Cars",
    image: "https://images.unsplash.com/photo-1520113412646-0428dbd6d376?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    stock: 30
  },
  {
    name: "Rubik's Cube Puzzle",
    description: "Classic 3x3 brain teaser puzzle.",
    price: 9.99,
    category: "Toys",
    image: "https://images.unsplash.com/photo-1591991731833-b4807cf7ef94?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    stock: 150
  },
  {
    name: "Racing Go-Kart Model",
    description: "Detailed go-kart die-cast.",
    price: 14.99,
    category: "Cars",
    image: "https://images.unsplash.com/photo-1563207011-85e8a7167664?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    stock: 40
  },
  {
    name: "Water Squirt Gun",
    description: "High capacity water blaster.",
    price: 19.99,
    category: "Toys",
    image: "https://images.unsplash.com/photo-1579708688461-3996238b7e2e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    stock: 80
  },
  {
    name: "Classic Muscle Car",
    description: "1:24 scale black muscle car.",
    price: 34.99,
    category: "Cars",
    image: "https://images.unsplash.com/photo-1611016186353-9af58c69a533?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    stock: 16
  },
  {
    name: "Plush Bunny",
    description: "Super soft long-eared plush bunny.",
    price: 11.99,
    category: "Toys",
    image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    stock: 90
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
