const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
            quantity: Number,
            price: Number
        }
    ],

    totalAmount: Number,

    paymentMethod: {
        type: String,
        enum: ["COD", "ONLINE"],
        default: "COD"
    },

    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid"],
        default: "Pending"
    },

    orderStatus: {
        type: String,
        enum: ["Pending", "Processing", "Shipped", "Delivered"],
        default: "Pending"
    },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);
