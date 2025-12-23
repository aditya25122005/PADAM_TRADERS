const express=require('express');
const { isLoggedIn } = require('../middleware');
const Product = require('../models/Product');
const User = require('../models/User');
const router=express.Router();

// route to show the cart
router.get('/user/cart',isLoggedIn,async (req,res)=>{
    try{
    let user = await User.findById(req.user._id).populate('cart');
    res.render('cart/cart',{user});
    }
    catch{
        req.flash('error',"Cannot show cart")
        res.render('error');
    }
})

// Actually adding Product to cart
router.post('/user/:productId/add',isLoggedIn,async(req,res)=>{
    try{

    let {productId} = req.params;
    let userId = req.user._id;
    let product = await Product.findById(productId);
    let user = await User.findById(userId);
    user.cart.push(productId);
    await user.save();
    req.flash('success','Added To Cart')
    res.redirect('/user/cart');
    }
    catch(e){
        req.flash('error','Cannot Add to Cart');
        console.log(e);
        
    }
    
})


// Remove from cart
router.delete('/user/:productId/remove',isLoggedIn,async(req,res)=>{
    try{
        const { productId }= req.params;
        const user = await User.findById(req.user._id);
        user.cart.pull(productId);
        await user.save();

        req.flash('success','Product remove from cart');
        res.redirect('/user/cart');
    }
    catch(e){
        req.flash('error','Cannot remove product from cart');
        res.redirect('user/cart');
    }
});









module.exports=router;