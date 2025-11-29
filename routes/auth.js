const express = require('express');
const User = require('../models/User');
const passport = require('passport');

const router = express.Router();

// Show registration form
router.get('/register', (req, res) => {
    res.render('auth/signup');
});

// register user
router.post('/register', async (req, res, next) => {
    try {
        const { email, username, password, applySeller } = req.body;

        // ALWAYS enforce Buyer role at registration
        const user = new User({
            email,
            username,
            role: "Buyer",        
            sellerStatus: "none"    
        });

        
        if (applySeller) {
            user.sellerStatus = "pending";
            user.sellerAppliedAt = Date.now();
        }

        const newUser = await User.register(user, password);

        // Auto-login after registration
        req.login(newUser, function (err) {
            if (err) return next(err);

            req.flash(
                'success',
                applySeller
                    ? 'Account created! Seller application submitted for approval.'
                    : 'Welcome to PADAM Traders!'
            );

            return res.redirect('/products');
        });

    } catch (e) {
        console.log(e);
        req.flash('error', e.message || 'Registration failed');
        return res.redirect('/register');
    }
});

// Show Login Page
router.get('/login', (req, res) => {
    res.render('auth/login');
});

// Login
router.post('/login',
    passport.authenticate('local', {
        failureRedirect: '/login',
        failureFlash: true
    }),
    (req, res) => {
        req.flash('success', 'Welcome back to PADAM Traders!');
        res.redirect('/products');
    }
);


    // LOGOUT USER

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);

        req.flash('success', 'Logged Out Successfully!');

        req.session.destroy((destroyErr) => {
            if (destroyErr) return next(destroyErr);

            res.redirect('/login');
        });
    });
});

module.exports = router;
