const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
    },

    username: {
        type: String,
        unique: true,
        sparse: true,
    },

    googleId: {
        type: String,
        default: null,
    },

    role: {
        type: String,
        enum: ["Admin", "Seller", "Buyer"],
        default: "Buyer",
    },

    sellerStatus: {
        type: String,
        enum: ["none", "pending", "approved", "rejected"],
        default: "none",
    },

    sellerAppliedAt: {
        type: Date,
    },

    sellerApprovedAt: {
        type: Date,
    },

    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        },
    ],

    cart: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        },
    ],

    address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        phone: String,
    },

    orders: [
        {
            items: [
                {
                    productId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Product",
                    },
                    quantity: Number,
                    price: Number,
                },
            ],

            totalAmount: Number,

            paymentMethod: {
                type: String,
                enum: ["COD", "ONLINE"],
                default: "COD",
            },

            paymentStatus: {
                type: String,
                enum: ["Pending", "Paid"],
                default: "Pending",
            },

            orderStatus: {
                type: String,
                enum: [
                    "Pending",
                    "Processing",
                    "Shipped",
                    "Delivered",
                ],
                default: "Pending",
            },

            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
});

// Required for existing username/password authentication.
// Passport Local Mongoose manages password hashing and verification.
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

module.exports = User;