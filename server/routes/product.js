const express = require("express");

const Product = require("../models/Product");
const {
    isLoggedIn,
    isSeller,
    isProductAuthor,
    validateProduct,
} = require("../middleware");

const router = express.Router();

// Add product
router.post(
    "/api/products",
    isLoggedIn,
    isSeller,
    validateProduct,
    async (req, res, next) => {
        try {
            const {
                name,
                img,
                price,
                quantity,
                desc,
                stock,
            } = req.body;

            const product = await Product.create({
                name,
                img,
                price,
                quantity,
                desc,
                stock,
                author: req.user._id,
            });

            return res.status(201).json({
                success: true,
                message: "Product added successfully",
                product,
            });
        } catch (error) {
            return next(error);
        }
    }
);

// Update product
router.patch(
    "/api/products/:id",
    isLoggedIn,
    isProductAuthor,
    validateProduct,
    async (req, res, next) => {
        try {
            const {
                name,
                img,
                price,
                quantity,
                desc,
                stock,
            } = req.body;

            const product = await Product.findByIdAndUpdate(
                req.params.id,
                {
                    name,
                    img,
                    price,
                    quantity,
                    desc,
                    stock,
                },
                {
                    new: true,
                    runValidators: true,
                }
            );

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found",
                });
            }

            return res.json({
                success: true,
                message: "Product updated successfully",
                product,
            });
        } catch (error) {
            return next(error);
        }
    }
);

// Delete product
router.delete(
    "/api/products/:id",
    isLoggedIn,
    isProductAuthor,
    async (req, res, next) => {
        try {
            const product = await Product.findByIdAndDelete(
                req.params.id
            );

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found",
                });
            }

            return res.json({
                success: true,
                message: "Product deleted successfully",
            });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;