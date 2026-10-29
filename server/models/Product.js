const mongoose = require("mongoose");
const Review = require("./Review");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },

    img: {
        type: String,
        trim: true,
    },

    price: {
        type: Number,
        min: 0,
        required: true,
    },

    quantity: {
        type: String,
        trim: true,
        required: true,
    },

    desc: {
        type: String,
        trim: true,
    },

    stock: {
        type: Number,
        required: true,
    },

    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
});

// Delete associated reviews when a product is deleted.
productSchema.post("findOneAndDelete", async function (product) {
    if (product?.reviews?.length) {
        await Review.deleteMany({
            _id: { $in: product.reviews },
        });
    }
});

// Calculate average rating from populated reviews.
productSchema.virtual("avgRating").get(function () {
    if (this.reviews?.length > 0) {
        const totalRating = this.reviews.reduce(
            (sum, review) => sum + review.rating,
            0
        );

        return (totalRating / this.reviews.length).toFixed(1);
    }

    return 0;
});

module.exports = mongoose.model("Product", productSchema);