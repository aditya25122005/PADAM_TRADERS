
const path = require("path");
const cors = require("cors");
require("dotenv").config({
    path: path.join(__dirname, "..", ".env")
});

const express = require("express");
const app = express();

// =====================================
// CORS CONFIGURATION
// =====================================
const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true,
    methods: [
        "GET",
        "HEAD",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS"
    ],
    allowedHeaders: [
        "Content-Type",
        "Authorization"
    ],
    optionsSuccessStatus: 204
};

// =====================================
// CORS DEBUG LOGGER
// IMPORTANT: This must be BEFORE cors()
// =====================================
app.use((req, res, next) => {
    if (req.method === "OPTIONS") {
        console.log("\n========== CORS PREFLIGHT ==========");
        console.log("URL:", req.originalUrl);
        console.log("Origin:", req.headers.origin);
        console.log(
            "Requested method:",
            req.headers["access-control-request-method"]
        );
        console.log(
            "Requested headers:",
            req.headers["access-control-request-headers"]
        );

        res.on("finish", () => {
            console.log("Response status:", res.statusCode);
            console.log(
                "Allow-Origin:",
                res.getHeader("Access-Control-Allow-Origin")
            );
            console.log(
                "Allow-Methods:",
                res.getHeader("Access-Control-Allow-Methods")
            );
            console.log(
                "Allow-Headers:",
                res.getHeader("Access-Control-Allow-Headers")
            );
            console.log("====================================\n");
        });
    }

    next();
});

// Apply CORS to API and other routes
app.use(cors(corsOptions));

// =====================================
// IMPORTS
// =====================================

const cookieParser = require("cookie-parser");

const passport = require("passport");
const localStrategy = require("passport-local");


const User = require("./models/User");

const productApi = require("./routes/api/productapi");
const productRoutes = require("./routes/product");
const authRoutes = require("./routes/auth");
const contactRoutes = require("./routes/contact");
const reviewRoutes = require("./routes/review");
const cartRoutes = require("./routes/cart");
const adminApiRoutes = require("./routes/api/admin");





// =====================================
// GENERAL MIDDLEWARE
// =====================================
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.set("trust proxy", 1);





// =====================================
// PASSPORT CONFIGURATION
// =====================================
app.use(passport.initialize());


passport.use(new localStrategy(User.authenticate()));

require("./config/googleStrategy");


// =====================================
// ROUTES
// =====================================
app.use(productApi);
app.use(productRoutes);
app.use(authRoutes);

app.use(reviewRoutes);
app.use(contactRoutes);
app.use(cartRoutes);
app.use(adminApiRoutes);



// =====================================
// EXPORT APP
// =====================================
module.exports = app;
