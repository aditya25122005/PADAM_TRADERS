// const isLoggedIn=(req,res,next)=>{
//     if(!req.isAuthenticated()){
//         return res.redirect('/login');
//     }
//     next();
// }
const Product = require('./models/Product'); 
const { reviewSchema, productSchema } = require("./schema");

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

const validateReview=(req,res,next)=>{
    let{rating,comment}=req.body;
    const{error}=reviewSchema.validate({rating,comment})
    if(error){
        return res.render('error');
    }
    next();
}

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

function setUser(req, res, next) {
    res.locals.user = req.user || null; // Passport sets req.user after login
    next();
}

module.exports = { isLoggedIn,setUser,validateProduct,validateReview,isSeller,isProductAuthor};