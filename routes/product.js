const express= require('express');
const Product= require('../models/Product');
const { isLoggedIn, validateProduct, isSeller, isProductAuthor } = require('../middleware');
const User = require('../models/User');

const router=express.Router();

// to show all the products
router.get('/products',isLoggedIn,async(req,res)=>{
    try{
    let products=await Product.find({}).populate('reviews');
    let user=null;
    if(req.user){
        user=await User.findById(req.user._id).populate('wishlist')
    }
    res.render('products/index',{products, currentuser:user});
    }
    catch(e){
        res.status(404).send("Error In Finding Products");
    }
})
// to show a form to add a new product
router.get('/products/new',isLoggedIn,isSeller,async(req,res)=>{
    try{
        res.render('products/new');
    }
    catch(e){
        console.log("Error in adding");
        
        res.status(404).send("Error In Adding New Product");
        res.redirect('/products');
    }
})

// to actually add a product in DB

router.post('/products',isLoggedIn,isSeller,validateProduct,async(req,res)=>{
    try{
        let{name,img,stock,quantity,price,desc}=req.body;
        await Product.create({name,img,stock,quantity,price,desc, author:req.user._id})
       
        req.flash('success','Product added successfully')
        res.redirect('/products');
    }
    catch(err){
        console.log(err);
        res.status(404).send("cannot Add new Product");
    }
    
})
// // to show a particular product
// router.get('/products/:id',isLoggedIn,async(req,res)=>{
//     try{
//     let {id}= req.params;
//     let foundProduct=await Product.findById(id).populate('reviews');
//     res.render('products/show',{foundProduct})
//     }
//     catch(e){
//        res.status(404).send("Error In Finding Product"); 
//     }
// })

// to show a particular product  -->>Changes for populating author as well--> for showing in review
router.get('/products/:id', isLoggedIn, async (req, res) => {
    try {
        let { id } = req.params;
        let foundProduct = await Product.findById(id)
        .populate('author')
            .populate({
                path: 'reviews',
                populate: {
                    path: 'author' // <-- This is the key change
                }
            });

        res.render('products/show', { foundProduct });
    } catch (e) {
        res.status(404).send("Error In Finding Product");
    }
});



// form to edit the product

router.get('/products/:id/edit',isLoggedIn,isSeller,isProductAuthor,async(req,res)=>{
    try{
        let {id}= req.params;
        let foundProduct= await Product.findById(id);
        res.render('products/edit',{foundProduct})
    }
    catch{
        res.status(404).send("Error In Editting Product");
    }
})

// actually edit in DB
router.patch('/products/:id',isLoggedIn,isSeller,isProductAuthor,validateProduct,async(req,res)=>{
    try{
        let {id}= req.params;
        let{name,img,quantity,price,desc,stock}=req.body;
        await Product.findByIdAndUpdate(id,{name,img,quantity,price,desc,stock})
        req.flash('success','Product edited successfully')
        res.redirect(`/products/${id}`);
    }
    catch(err){
        res.status(404).send("Error In Editting Product");
    }
})

// delete a product
router.delete('/product/:id',isLoggedIn,isSeller,isProductAuthor,async(req,res)=>{
    try{
        let {id}= req.params;
        //const product= await Product.findById(id);

        await Product.findByIdAndDelete(id)
        req.flash('success','Product deleted successfully')
        res.redirect('/products');
    }
    catch(e){
        res.status(404).send("Error In Deleting Product");
    }
})


// A route to handle liking and unliking a product
router.post('/products/:id/like', isLoggedIn, async (req, res) => {
    try {
        let { id } = req.params;
        const product = await Product.findById(id);
        const user = req.user;

        // Check if the user has already liked the product
        const isLiked = user.wishlist.includes(product._id);

        if (isLiked) {
            // Remove the product from the wishlist
            await User.findByIdAndUpdate(user._id, { $pull: { wishlist: product._id } });
        } else {
            // Add the product to the wishlist
            await User.findByIdAndUpdate(user._id, { $push: { wishlist: product._id } });
        }

        res.status(200).send('Wishlist updated successfully');
    } catch (e) {
        console.error('Error updating wishlist:', e);
        res.status(500).send('Server Error');
    }
});



module.exports=router;