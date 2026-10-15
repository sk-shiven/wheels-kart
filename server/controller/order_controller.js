import crypto from 'crypto';
import Order from '../model/order_model.js';
import User from '../model/user_model.js';
import { Product } from '../model/product_model.js';
import razorpay from '../config/razorpay.js';

export const createPaymentOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress } = req.body;

    // Validate shipping address
    if (!shippingAddress) {
      return res.status(400).json({ success: false, message: 'Shipping address is required' });
    }

    const { fullName, phone, addressLine1, city, state, pincode } = shippingAddress;

    if (
      !fullName?.trim() ||
      !phone?.trim() ||
      !addressLine1?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !pincode?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'All shipping address fields are required and cannot be empty'
      });
    }

    // Phone validation (at least 10 digits)
    const phoneClean = phone.trim().replace(/[\s\-()]/g, '');
    if (phoneClean.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number (at least 10 digits)'
      });
    }

    // Pincode validation (exactly 6 digits for Indian postal codes)
    if (!/^\d{6}$/.test(pincode.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Pincode must contain exactly 6 digits'
      });
    }

    // Load user cart
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add items before placing an order.'
      });
    }

    // Verify each product, validate live stock, calculate server-authoritative total, and create snapshots
    const orderItems = [];
    let calculatedTotal = 0;

    for (const item of user.cart) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'One or more products in your cart are no longer available.'
        });
      }

      if (item.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, requested: ${item.quantity}`
        });
      }

      const itemTotal = product.price * item.quantity;
      calculatedTotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      });
    }

    // Create pending ShopKart order
    const shopKartOrder = new Order({
      user: userId,
      items: orderItems,
      shippingAddress: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        addressLine1: addressLine1.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim()
      },
      totalAmount: calculatedTotal,
      paymentStatus: 'PENDING',
      status: 'PENDING_PAYMENT'
    });

    await shopKartOrder.save();

    // Validate minimum amount (minimum 100 paise = 1 INR for Razorpay)
    const amountInPaise = Math.round(calculatedTotal * 100);
    if (amountInPaise < 100) {
      return res.status(400).json({
        success: false,
        message: 'Order amount must be at least 100 paise (₹1.00) to process payment.'
      });
    }

    let razorpayOrderId;
    try {
      const rzpOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: shopKartOrder._id.toString()
      });
      razorpayOrderId = rzpOrder.id;
    } catch (rzpErr) {
      console.error('Razorpay API error creating order:', rzpErr);
      const statusCode = rzpErr.statusCode === 401 ? 401 : 500;
      return res.status(statusCode).json({
        success: false,
        message: rzpErr.error?.description || rzpErr.message || 'Failed to create payment order with Razorpay'
      });
    }

    shopKartOrder.razorpayOrderId = razorpayOrderId;
    await shopKartOrder.save();

    res.status(200).json({
      success: true,
      shopKartOrderId: shopKartOrder._id,
      order_id: razorpayOrderId,
      razorpayOrderId: razorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('createPaymentOrder error: ', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating payment order'
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user._id;

    if (!razorpay_payment_id || !razorpay_signature || (!razorpay_order_id && !shopKartOrderId)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification details (order_id, payment_id, or signature)'
      });
    }

    const orderQuery = shopKartOrderId
      ? { _id: shopKartOrderId }
      : { razorpayOrderId: razorpay_order_id };

    const order = await Order.findOne(orderQuery);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized order access' });
    }

    // Cryptographic signature verification using HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay secret key is not configured on the server'
      });
    }

    const orderIdToVerify = order.razorpayOrderId || razorpay_order_id;
    const body = orderIdToVerify + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      order.paymentStatus = 'FAILED';
      await order.save();
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Payment verification failed.'
      });
    }

    // Mark order confirmed and paid
    order.paymentStatus = 'PAID';
    order.status = 'PLACED';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // Decrement stock for purchased items
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear user cart
    await User.findByIdAndUpdate(userId, { $set: { cart: [] } });

    res.status(200).json({
      success: true,
      message: 'Payment verified and order placed successfully',
      order
    });
  } catch (error) {
    console.error('verifyPayment error: ', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying payment'
    });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('getUserOrders error: ', error);
    res.status(500).json({ success: false, message: 'Server error while fetching orders' });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('getOrderById error: ', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }
    res.status(500).json({ success: false, message: 'Server error while fetching order' });
  }
};

// Bonus challenge: Order Status Progression
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING_PAYMENT', 'PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });
  } catch (error) {
    console.error('updateOrderStatus error: ', error);
    res.status(500).json({ success: false, message: 'Server error while updating order status' });
  }
};
