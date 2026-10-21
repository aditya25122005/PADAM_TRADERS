
const express = require("express");
const Product = require("../models/Product");

const {
    isLoggedIn,
    isSeller,
    isProductAuthor,
    validateProduct
} = require("../middleware");

const router = express.Router();

// =====================================================
// ADD PRODUCT
// POST /api/products
// Admin and approved sellers can add products.
// =====================================================
router.post(
    "/api/products",
    isLoggedIn,
    isSeller,
    validateProduct,
    async (req, res) => {
        try {
            const {
                name,
                img,
                price,
                quantity,
                desc,
                stock
            } = req.body;

            const product = await Product.create({
                name,
                img,
                price,
                quantity,
                desc,
                stock,
                author: req.user._id
            });

            return res.status(201).json({
                success: true,
                message: "Product added successfully",
                product
            });
        } catch (error) {
            console.error("Add product error:", error);

            return res.status(500).json({
                success: false,
                message: "Cannot add new product"
            });
        }
    }
);

// =====================================================
// UPDATE PRODUCT
// PATCH /api/products/:id
// Product owner or Admin can update the product.
// =====================================================
router.patch(
    "/api/products/:id",
    isLoggedIn,
    isProductAuthor,
    validateProduct,
    async (req, res) => {
        try {
            const {
                name,
                img,
                price,
                quantity,
                desc,
                stock
            } = req.body;

            const product = await Product.findByIdAndUpdate(
                req.params.id,
                {
                    name,
                    img,
                    price,
                    quantity,
                    desc,
                    stock
                },
                {
                    new: true,
                    runValidators: true
                }
            );

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            return res.json({
                success: true,
                message: "Product updated successfully",
                product
            });
        } catch (error) {
            console.error("Update product error:", error);

            return res.status(500).json({
                success: false,
                message: "Cannot update product"
            });
        }
    }
);

// =====================================================
// DELETE PRODUCT
// DELETE /api/products/:id
// Product owner or Admin can delete the product.
// =====================================================
router.delete(
    "/api/products/:id",
    isLoggedIn,
    isProductAuthor,
    async (req, res) => {
        try {
            const product = await Product.findByIdAndDelete(
                req.params.id
            );

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            return res.json({
                success: true,
                message: "Product deleted successfully"
            });
        } catch (error) {
            console.error("Delete product error:", error);

            return res.status(500).json({
                success: false,
                message: "Cannot delete product"
            });
        }
    }
);

module.exports = router;
