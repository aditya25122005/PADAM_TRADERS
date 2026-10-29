const express = require("express");
const passport = require("passport");
const otpGenerator = require("otp-generator");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const SignupOtp = require("../models/SignupOtp");
const sendOtpMail = require("../utils/sendOtp");

const {
    COOKIE_NAME,
    generateToken,
    setTokenCookie,
    clearTokenCookie,
} = require("../utils/jwt");

const router = express.Router();

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const FRONTEND_URL =
    process.env.CLIENT_URL || "http://localhost:5173";

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function parseApplySeller(value) {
    if (value === true) return true;
    if (typeof value !== "string") return false;

    return ["true", "on", "1"].includes(value.toLowerCase());
}

function generateOtp() {
    return otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: true,
        upperCaseAlphabets: true,
        specialChars: false,
    });
}

function hashOtp(email, otp) {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is missing.");
    }

    return crypto
        .createHmac("sha256", process.env.JWT_SECRET)
        .update(`${email}:${otp}`)
        .digest("hex");
}

async function storeSignupOtp(email, otp) {
    return SignupOtp.findOneAndUpdate(
        { email },
        {
            $set: {
                otpHash: hashOtp(email, otp),
                expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
                verifiedAt: null,
                attempts: 0,
            },
        },
        {
            upsert: true,
            new: true,
            runValidators: true,
        }
    );
}

function publicUser(user) {
    return {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        sellerStatus: user.sellerStatus,
        cartCount: Array.isArray(user.cart)
            ? user.cart.length
            : 0,
    };
}

function invalidTokenError(error) {
    return [
        "JsonWebTokenError",
        "TokenExpiredError",
        "NotBeforeError",
    ].includes(error.name);
}

// Send OTP
router.post("/send-otp", async (req, res) => {
    try {
        const email = String(req.body.email || "")
            .trim()
            .toLowerCase();

        if (!isValidEmail(email)) {
            return res.status(400).json({
                error: "Please enter a valid email address.",
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing.");
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                error: "Email already registered. Please login instead.",
            });
        }

        const otp = generateOtp();

        await storeSignupOtp(email, otp);
        await sendOtpMail(email, otp);

        return res.json({
            message: "OTP sent successfully.",
        });
    } catch (error) {
        console.error("Send OTP error:", error.message);

        return res.status(500).json({
            error: "Failed to send OTP. Please try again.",
        });
    }
});

// Resend OTP
router.post("/resend-otp", async (req, res) => {
    try {
        const email = String(req.body.email || "")
            .trim()
            .toLowerCase();

        if (!isValidEmail(email)) {
            return res.status(400).json({
                error: "Please enter a valid email address.",
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                error: "Email already registered. Please login instead.",
            });
        }

        const pendingOtp = await SignupOtp.findOne({ email });

        if (!pendingOtp) {
            return res.status(400).json({
                error: "Please request an OTP first.",
            });
        }

        if (pendingOtp.verifiedAt) {
            return res.status(400).json({
                error: "Email is already verified.",
            });
        }

        const otp = generateOtp();

        await storeSignupOtp(email, otp);
        await sendOtpMail(email, otp);

        return res.json({
            message: "New OTP sent successfully.",
        });
    } catch (error) {
        console.error("Resend OTP error:", error.message);

        return res.status(500).json({
            error: "Failed to resend OTP. Please try again.",
        });
    }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
    try {
        const email = String(req.body.email || "")
            .trim()
            .toLowerCase();

        const otp = String(req.body.otp || "").trim();

        if (!isValidEmail(email)) {
            return res.status(400).json({
                error: "Please enter a valid email address.",
            });
        }

        if (!/^[A-Za-z0-9]{6}$/.test(otp)) {
            return res.status(400).json({
                error: "Please enter the six-character OTP exactly as received.",
            });
        }

        const record = await SignupOtp.findOne({ email });

        if (!record) {
            return res.status(400).json({
                error: "OTP not found. Please request a new OTP.",
            });
        }

        if (record.expiresAt.getTime() <= Date.now()) {
            await SignupOtp.deleteOne({ _id: record._id });

            return res.status(400).json({
                error: "OTP expired. Please request a new OTP.",
            });
        }

        if (record.verifiedAt) {
            return res.json({
                message: "Email already verified successfully.",
            });
        }

        if (record.attempts >= 5) {
            return res.status(429).json({
                error: "Too many incorrect attempts. Please request a new OTP.",
            });
        }

        const expectedHash = Buffer.from(record.otpHash, "hex");
        const receivedHash = Buffer.from(
            hashOtp(email, otp),
            "hex"
        );

        const valid =
            expectedHash.length === receivedHash.length &&
            crypto.timingSafeEqual(expectedHash, receivedHash);

        if (!valid) {
            record.attempts += 1;
            await record.save();

            return res.status(400).json({
                error: "Invalid OTP. Try again.",
            });
        }

        record.verifiedAt = new Date();
        await record.save();

        return res.json({
            message: "OTP verified successfully.",
        });
    } catch (error) {
        console.error("Verify OTP error:", error.message);

        return res.status(500).json({
            error: "Could not verify OTP. Please try again.",
        });
    }
});

// Register
router.post("/api/auth/register", async (req, res) => {
    try {
        const username = String(req.body.username || "").trim();

        const email = String(req.body.email || "")
            .trim()
            .toLowerCase();

        const password = req.body.password;
        const applySeller = parseApplySeller(req.body.applySeller);

        if (!username || !email || !password) {
            return res.status(400).json({
                error: "Username, email and password are required.",
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                error: "Please enter a valid email address.",
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing.");
        }

        const [existingEmail, existingUsername] = await Promise.all([
            User.findOne({ email }),
            User.findOne({ username }),
        ]);

        if (existingEmail) {
            return res.status(409).json({
                error: "Email is already registered.",
            });
        }

        if (existingUsername) {
            return res.status(409).json({
                error: "Username already exists. Please choose another.",
            });
        }

        const otpRecord = await SignupOtp.findOne({ email });

        if (!otpRecord || !otpRecord.verifiedAt) {
            return res.status(400).json({
                error: "Please verify your email with OTP first.",
            });
        }

        if (otpRecord.expiresAt.getTime() <= Date.now()) {
            await SignupOtp.deleteOne({ _id: otpRecord._id });

            return res.status(400).json({
                error: "OTP expired. Please request a new OTP.",
            });
        }

        const user = new User({
            username,
            email,
            role: "Buyer",
            sellerStatus: applySeller ? "pending" : "none",
            ...(applySeller
                ? { sellerAppliedAt: new Date() }
                : {}),
        });

        const newUser = await User.register(user, password);
        const token = generateToken(newUser._id);

        await SignupOtp.deleteOne({ _id: otpRecord._id });

        setTokenCookie(res, token);

        return res.status(201).json({
            success: true,
            message: applySeller
                ? "Account created! Seller application submitted."
                : "Account created successfully!",
            user: publicUser(newUser),
        });
    } catch (error) {
        console.error("Register error:", error.message);

        if (
            error.code === 11000 ||
            error.name === "UserExistsError"
        ) {
            return res.status(409).json({
                error: "Email or username is already registered.",
            });
        }

        return res.status(500).json({
            error: "Signup failed. Please try again.",
        });
    }
});

// Login
router.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (error, user, info) => {
        if (error) {
            console.error("Login error:", error.message);

            return res.status(500).json({
                error: "Login failed. Please try again.",
            });
        }

        if (!user) {
            return res.status(401).json({
                error: info?.message || "Invalid email or password.",
            });
        }

        try {
            const token = generateToken(user._id);

            setTokenCookie(res, token);

            return res.json({
                message: "Login successful!",
                user: publicUser(user),
            });
        } catch (jwtError) {
            console.error("JWT creation error:", jwtError.message);

            return res.status(500).json({
                error: "Authentication configuration error.",
            });
        }
    })(req, res, next);
});

// Logout
router.post("/api/auth/logout", (req, res) => {
    clearTokenCookie(res);

    res.clearCookie("connect.sid", {
        path: "/",
    });

    return res.json({
        success: true,
        message: "Logged out successfully.",
    });
});

// Start Google OAuth
router.get(
    "/auth/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
        session: false,
    })
);

// Google OAuth callback
router.get(
    "/auth/google/callback",
    (req, res, next) => {
        passport.authenticate(
            "google",
            { session: false },
            (error, user) => {
                if (error || !user) {
                    if (error) {
                        console.error("Google login error:", error.message);
                    }

                    clearTokenCookie(res);

                    return res.redirect(
                        `${FRONTEND_URL}/login?error=google-auth-failed`
                    );
                }

                try {
                    const token = generateToken(user._id);

                    setTokenCookie(res, token);

                    return res.redirect(`${FRONTEND_URL}/`);
                } catch (tokenError) {
                    console.error(
                        "Google JWT error:",
                        tokenError.message
                    );

                    clearTokenCookie(res);

                    return res.redirect(
                        `${FRONTEND_URL}/login?error=google-auth-failed`
                    );
                }
            }
        )(req, res, next);
    }
);

// Current authenticated user
router.get("/api/auth/me", async (req, res, next) => {
    try {
        const token = req.cookies?.[COOKIE_NAME];

        if (!token) {
            return res.json({
                loggedIn: false,
                user: null,
            });
        }

        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            if (invalidTokenError(error)) {
                clearTokenCookie(res);

                return res.json({
                    loggedIn: false,
                    user: null,
                });
            }

            return next(error);
        }

        if (typeof decoded.sub !== "string") {
            clearTokenCookie(res);

            return res.json({
                loggedIn: false,
                user: null,
            });
        }

        const user = await User.findById(decoded.sub);

        if (!user) {
            clearTokenCookie(res);

            return res.json({
                loggedIn: false,
                user: null,
            });
        }

        return res.json({
            loggedIn: true,
            user: publicUser(user),
        });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;