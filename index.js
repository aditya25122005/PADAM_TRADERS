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

const User = require('./models/User');
const productApi = require("./routes/api/productapi");
const productRoutes = require('./routes/product');
const authRoutes = require('./routes/auth');
const homeRoutes = require('./routes/root');
const contactRoutes = require('./routes/contact');
const reviewRoutes = require('./routes/review');
const cartRoutes = require('./routes/cart');
const adminRoutes = require('./routes/admin');

const { setUser } = require('./middleware');


mongoose.connect('mongodb://127.0.0.1:27017/padam')
  .then(() => console.log("DB Connected Successfully"))
  .catch(err => console.log(err));

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

app.use(session(configSession));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(setUser);

// passport config
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// ROUTES
app.use(productRoutes);
app.use(authRoutes);
app.use(homeRoutes);
app.use(reviewRoutes);
app.use(productApi);
app.use(contactRoutes);
app.use(cartRoutes);

// ONLY THIS → correct!
app.use('/admin', adminRoutes);

app.get('/about-login', (req, res) => {
    res.render('about-login');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.listen(8085, () => {
    console.log("Server Connected At Port 8085");
});
