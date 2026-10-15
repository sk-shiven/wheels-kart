# WheelsKart (Shop Kart MERN)

A full-stack modern e-commerce web platform specialized for collectible die-cast cars, Hot Wheels, and toys, built with the MERN stack (MongoDB, Express.js, React 19, Node.js) and styled with Tailwind CSS v4.

---

## Description

**WheelsKart** is a feature-rich, high-performance e-commerce platform crafted specifically for toy collectors and automotive enthusiasts. It bridges an intuitive, modern client experience with a secure RESTful backend API and integrates Razorpay for streamlined payment handling.

### Key Features
- **Product Catalog & Discovery**: Browse, filter by category (Cars, Toys, Collectibles), sort, and view detailed product specs, stock levels, and gallery images.
- **Cart & Wishlist Management**: Seamless state synchronization to add, update, remove items, and save favorites to a personal wishlist.
- **Secure Authentication & Session Handling**: User registration, login, and protected routes backed by JWT (JSON Web Tokens), bcrypt password hashing, and HTTP-only cookie management.
- **Checkout & Razorpay Payment Gateway**: Complete order placement pipeline featuring address input, price calculations, and integrated Razorpay payment verification.
- **Order Tracking & History**: View past orders, track order statuses, inspect transaction IDs, and access granular item breakdowns.
- **Database Seeding**: Ready-to-use sample catalog data for fast local setup and development.

### Background & Context
WheelsKart was architected to demonstrate full-stack MERN architecture best practices, including decoupled client/server design, Vite proxying, controller-service routing patterns, and responsive UI components using React 19 and Tailwind CSS.

---

## Badges

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Bundler-Vite_8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

---

## Visuals

> **Architecture Overview**
>
> ```text
> ┌──────────────────────────┐           ┌──────────────────────────┐
> │   React 19 + Tailwind    │  /api/*   │     Express 5 Server     │
> │     Vite Frontend        │ ────────> │   (Routes, Middleware)   │
> │  (http://localhost:5173) │           │  (http://localhost:320)  │
> └──────────────────────────┘           └────────────┬─────────────┘
>                                                     │
>                                         Mongoose    │    Razorpay
>                                         ORM         │    API
>                                                     ▼
>                                        ┌──────────────────────────┐
>                                        │      MongoDB Atlas       │
>                                        │        Database          │
>                                        └──────────────────────────┘
> ```

*(Screenshots and interface demo previews can be added to the `docs/` directory and referenced here.)*

---

## Installation

Follow these steps to set up WheelsKart locally.

### Requirements
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn**
- **MongoDB**: A local MongoDB instance or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection URI
- **Razorpay Account**: Test API Key and Secret (from [Razorpay Dashboard](https://dashboard.razorpay.com/))

### Step-by-Step Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sk-shiven/wheels-kart.git
   cd wheels-kart
   ```

2. **Configure and install Server**:
   ```bash
   cd server
   npm install
   ```

   Create a `.env` file in the `server/` directory:
   ```env
   port=320
   dbURL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/shopkart?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key_here
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

3. **(Optional) Seed initial data**:
   Populate sample Hot Wheels and collectible products:
   ```bash
   node seed.js
   ```

4. **Install and configure Client**:
   Open a separate terminal window and run:
   ```bash
   cd ../client
   npm install
   ```

---

## Usage

### 1. Start Backend Server
From the `server/` folder:
```bash
npm start
# or with nodemon for live reload:
npx nodemon index.js
```
The server will start on `http://localhost:320`.

### 2. Start Frontend Application
From the `client/` folder:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 3. Verification & Example Flow
- **Register / Log In**: Create a new account at `/register` and sign in at `/login`.
- **Explore Products**: View cars and collectibles on the home catalog (`/`).
- **Cart & Wishlist**: Add items to your cart or bookmark them in your wishlist.
- **Checkout & Payment**: Proceed to `/checkout` to enter shipping details and complete payment using Razorpay's test mode credentials.
- **Review Orders**: Inspect your placed orders and delivery status under `/orders`.

---

## Support

If you encounter issues or have questions:
- Open an issue in the [GitHub Issues tracker](https://github.com/sk-shiven/wheels-kart/issues).
- Reach out to the maintainer via GitHub: [@sk-shiven](https://github.com/sk-shiven).

---

## Roadmap

- [ ] **Admin Dashboard**: Real-time product inventory, user management, and order status updates.
- [ ] **Advanced Filtering & Search**: Search by scale model, brand, release year, and price range.
- [ ] **Customer Reviews & Ratings**: Allow verified buyers to leave reviews and ratings.
- [ ] **Email Notifications**: Automated order confirmation and dispatch emails via Nodemailer or SendGrid.
- [ ] **Stripe / International Payments**: Multi-currency support for global collectors.

---

## Contributing

Contributions are welcome! To get started:

1. **Fork the repository**.
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**:
   ```bash
   git commit -m "Add amazing feature"
   ```
4. **Code Quality & Linting**:
   Before submitting, run ESLint in the client directory:
   ```bash
   cd client
   npm run lint
   ```
5. **Push to the branch**:
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request** explaining your modifications and testing steps.

---

## Authors and Acknowledgment

- **Shiven Kathuria** ([@sk-shiven](https://github.com/sk-shiven)) - Initial design, backend API, and frontend implementation.
- Special thanks to the open-source communities behind Express, React, Tailwind CSS, and Mongoose.

---

## License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).

---

## Project Status

**Active Development** — Currently maintained and expanding features for collectors, advanced checkout options, and admin tools. Contributions and suggestions are encouraged!
