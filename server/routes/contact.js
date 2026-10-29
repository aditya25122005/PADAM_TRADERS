const express = require("express");

const Message = require("../models/Message");
const { isLoggedIn } = require("../middleware");

const router = express.Router();

// Submit contact message
router.post("/contact", isLoggedIn, async (req, res, next) => {
    try {
        const { name, email, contactNo, message } = req.body;

        const newMessage = await Message.create({
            name,
            email,
            contactNo,
            message,
            userId: req.user._id,
        });

        return res.status(200).json({
            success: true,
            message: "Message sent successfully!",
        });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;