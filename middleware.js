// const isLoggedIn=(req,res,next)=>{
//     if(!req.isAuthenticated()){
//         return res.redirect('/login');
//     }
//     next();
// }
const Product = require('./models/Product'); 
const { reviewSchema, productSchema } = require("./schema");
const Review = require('./models/Review');

// module.exports={isLoggedIn};
const validateProduct = (req, res, next) => {
    // Destructure all required fields from the request body
    let { name, img, price, desc, quantity, stock } = req.body;
    const { error } = productSchema.validate({ name, img, price, desc, quantity, stock });
    if (error) {
        return res.render('error', { error: error.details[0].message });
    }
    next();
};

const validateReview = (req, res, next) => {
    let { rating, comment } = req.body;
    const { error } = reviewSchema.validate({ rating, comment });
    if (error) {
        // Pass the Joi error message to the error page
        return res.render('error', { error: error.details[0].message });
    }
    next();
};

const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error','Please Login First');
        return res.redirect('/login');
    }
   return next();
};



// const isSeller=(req,res,next)=>{
//     if(!req.user){
//         req.flash('error',"You don't have access");
//         return res.redirect('/login');
//     }
//     if(req.user.role !=='seller'){
//         req.flash('error',"You don't have access");
//         return res.redirect('/products');
//     }
//     next();
// }


const isSeller = (req, res, next) => {
    // Check if user logged in
    if (!req.user) {
        req.flash('error', "You must be logged in");
        return res.redirect('/login');
    }
    // Check if role exists
    if (!req.user.role) {
        req.flash('error', "Your account has no role assigned. Contact admin.");
        return res.redirect('/products');
    }
    // Normalize role check
    if (req.user.role.toLowerCase() !== 'seller') {
        req.flash('error', "You don't have access (not a seller)");
        return res.redirect('/products');
    }
    next();
};

const isProductAuthor=async(req,res,next)=>{
    const {id} = req.params;
    const product= await Product.findById(id);
    if(!product){
        req.flash('error',"product not found");
        return res.redirect('/products');
    }
    if(!product.author.equals(req.user._id)){
        req.flash('error',"You dont have permission to do that");
        return res.redirect('/products');
    }
    next();
}

const isReviewAuthor = async (req, res, next) => {
    const { productID, reviewID } = req.params;

    try {
        const review = await Review.findById(reviewID);

        // Check if the review exists AND if it has an author field
        if (review && review.author) {
            // Now, and only now, safely check for ownership
            if (review.author.equals(req.user._id)) {
                return next();
            }
        }

        // If either check fails, redirect with an error
        req.flash('error', "You do not have permission to do that.");
        res.redirect(`/products/${productID}`);

    } catch (e) {
        // Catch any other potential errors, like an invalid reviewId format
        req.flash('error', "An unexpected error occurred.");
        res.redirect(`/products/${productID}`);
    }
};


function setUser(req, res, next) {
    res.locals.user = req.user || null; // Passport sets req.user after login
    next();
}

module.exports = { isLoggedIn,setUser,validateProduct,validateReview,isSeller,isProductAuthor, isReviewAuthor};