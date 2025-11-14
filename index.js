const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const localStrategy = require('passport-local');
const seedDB = require('./seed');
const User = require('./models/User');
const productApi = require("./routes/api/productapi"); //api
const productRoutes = require('./routes/product');
const authRoutes = require('./routes/auth.js');
const homeRoutes = require('./routes/root.js');
const contactRoutes=require('./routes/contact.js');
const reviewRoutes = require('./routes/review.js');
const cartRoutes= require('./routes/cart.js');
const{setUser}=require('./middleware');
mongoose.connect('mongodb://127.0.0.1:27017/padam')
    .then(() => {
        console.log("DB Connected Successfully");
    })
    .catch((err) => {
        console.log("DB Connection Error");
        console.log(err);
    });

let configSession = {
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 24 * 7 * 60 * 60 * 1000,
        maxAge: 24 * 7 * 60 * 60 * 1000
    }
};

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


// Core middleware and services
app.use(session(configSession));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); // Flash middleware should be after session and passport
app.use(setUser);
// Passport configuration
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// res.locals middleware must be after flash
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.use((req, res, next) => {
  res.locals.user = req.user;  // this makes `user` available in all views
  next();
});
// Your routes
app.use(productRoutes);
app.use(authRoutes);
app.use(homeRoutes);
app.use(reviewRoutes);
app.use(productApi);
app.use(contactRoutes);
app.use(cartRoutes);

app.get('/about-login', (req, res) => {
    res.render('about-login.ejs');
});

app.get('/about',(req,res)=>{
    res.render('about');
})
// app.get('/contact',(req,res)=>{
//     res.render('contact.ejs');
// })


// seedDB();
app.listen(8085, () => {
    console.log("Server Connected At Port 8080");
});