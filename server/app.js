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

// Trust Render's reverse proxy for HTTPS cookie delivery
app.set("trust proxy", true);

// Clean CORS configuration allowing cross-origin credential sharing
const allowedOrigins = [
    "https://padam-traders-frontend.onrender.com",
    "http://localhost:5173",
    "http://localhost:3000"
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, origin); // Always return exact origin string
        }
        
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
}));

// Core middleware order
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "..", "public")));

// Passport initialization
app.use(passport.initialize());

const LocalStrategy = require("passport-local").Strategy;
passport.use(new LocalStrategy(User.authenticate()));

require("./config/googleStrategy");

// Register Routes
app.use(authRoutes);
app.use(productApi);
app.use(productRoutes);
app.use(reviewRoutes);
app.use(contactRoutes);
app.use(cartRoutes);
app.use(adminApiRoutes);

module.exports = app;