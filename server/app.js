const path = require("path");
require("dotenv").config({
    path: path.join(__dirname, "..", ".env"),
});

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");

const User = require("./models/User");

const productApi = require("./routes/api/productapi");
const productRoutes = require("./routes/product");
const authRoutes = require("./routes/auth");
const contactRoutes = require("./routes/contact");
const reviewRoutes = require("./routes/review");
const cartRoutes = require("./routes/cart");
const adminApiRoutes = require("./routes/api/admin");

const app = express();

app.set("trust proxy", 1);

// CORS configuration
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
        methods: [
            "GET",
            "HEAD",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
        ],
        optionsSuccessStatus: 204,
    })
);

// General middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "..", "public")));

// Passport configuration
app.use(passport.initialize());

const LocalStrategy = require("passport-local").Strategy;

passport.use(new LocalStrategy(User.authenticate()));

require("./config/googleStrategy");

// Routes
app.use(productApi);
app.use(productRoutes);
app.use(authRoutes);
app.use(reviewRoutes);
app.use(contactRoutes);
app.use(cartRoutes);
app.use(adminApiRoutes);

module.exports = app;