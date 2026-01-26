const express = require("express");
const User = require("../models/User");
const passport = require("passport");

const router = express.Router();

const otpGenerator = require("otp-generator");
const sendOtpMail = require("../utils/sendOtp");


// ✅ SEND OTP
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    // ✅ Prevent sending OTP if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: "Email already registered. Please login instead."
      });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCase: false,
      specialChars: false,
    });

    // Store OTP in session
    req.session.signupEmail = email;
    req.session.signupOtp = otp;
    req.session.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 min
    req.session.isEmailVerified = false;

    // Send mail
    await sendOtpMail(email, otp);

    res.json({ message: "OTP sent successfully ✅" });

  } catch (err) {
    console.log("Send OTP Error:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});


// ✅ RESEND OTP
router.post("/resend-otp", async (req, res) => {
  try {
    const email = req.session.signupEmail;

    if (!email) {
      return res.status(400).json({
        error: "Session expired. Please enter email again."
      });
    }

    // Generate New OTP
    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCase: false,
      specialChars: false,
    });

    // Update session OTP
    req.session.signupOtp = otp;
    req.session.otpExpiry = Date.now() + 5 * 60 * 1000;

    await sendOtpMail(email, otp);

    res.json({ message: "New OTP resent successfully ✅" });

  } catch (err) {
    console.log("Resend OTP Error:", err);
    res.status(500).json({ error: "Failed to resend OTP" });
  }
});


// ✅ VERIFY OTP
router.post("/verify-otp", (req, res) => {
  const { otp } = req.body;

  if (!req.session.signupOtp || !req.session.otpExpiry) {
    return res.status(400).json({
      error: "OTP not generated. Please send OTP first."
    });
  }

  // Expired OTP
  if (Date.now() > req.session.otpExpiry) {
    return res.status(400).json({
      error: "OTP Expired. Please resend OTP."
    });
  }

  // Invalid OTP
  if (req.session.signupOtp.toString() !== otp.toString()) {
    return res.status(400).json({
      error: "Invalid OTP. Try again."
    });
  }

  // ✅ OTP Verified
  req.session.isEmailVerified = true;

  res.json({ message: "OTP Verified Successfully ✅" });
});


// ✅ SHOW SIGNUP PAGE
router.get("/register", (req, res) => {
  res.render("auth/signup");
});


// ✅ REGISTER USER (AFTER OTP VERIFIED)
router.post("/register", async (req, res, next) => {
  try {

    if (!req.session.isEmailVerified) {
      req.flash("error", "Please verify OTP first!");
      return res.redirect("/register");
    }

    const { email, username, password, applySeller } = req.body;

    // ✅ Prevent duplicate signup again
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error", "Email already registered. Please login.");
      return res.redirect("/login");
    }

    // Create user
    const user = new User({
      email,
      username,
      role: "Buyer",
      sellerStatus: "none",
    });

    // Seller request
    if (applySeller) {
      user.sellerStatus = "pending";
      user.sellerAppliedAt = Date.now();
    }

    // Register user with password
    const newUser = await User.register(user, password);

    // ✅ Clear OTP session after signup
    req.session.signupOtp = null;
    req.session.otpExpiry = null;
    req.session.isEmailVerified = false;
    req.session.signupEmail = null;

    // Auto login
    req.login(newUser, function (err) {
      if (err) return next(err);

      req.flash(
        "success",
        applySeller
          ? "Account created! Seller request submitted ✅"
          : "Welcome to PADAM Traders ✅"
      );

      return res.redirect("/products");
    });

  } catch (e) {
    console.log("Signup Error:", e);
    req.flash("error", e.message || "Registration failed");
    return res.redirect("/register");
  }
});


// ✅ SHOW LOGIN PAGE
router.get("/login", (req, res) => {
  res.render("auth/login");
});


// ✅ LOGIN USER
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Welcome back to PADAM Traders ✅");
    res.redirect("/products");
  }
);


// ✅ LOGOUT USER
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.flash("success", "Logged Out Successfully!");

    req.session.destroy((destroyErr) => {
      if (destroyErr) return next(destroyErr);

      res.redirect("/login");
    });
  });
});


// ✅ GOOGLE LOGIN
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);


// ✅ GOOGLE CALLBACK
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Logged in with Google Successfully ✅");
    res.redirect("/products");
  }
);


module.exports = router;
