import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 20
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        match: [/^(\+?\d{1,3}[- ]?)?(\()?\d{3}(\))?[-.\s]?\d{3}[-.\s]?\d{4}$/, 'Please enter a valid phone number']
    },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    cart: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                default: 1,
                min: [1, 'Quantity cannot be less than 1']
            }
        }
    ]
}, { timestamps: true })

export default mongoose.model('User', userSchema);