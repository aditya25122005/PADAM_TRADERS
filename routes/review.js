const express= require('express');
const Product= require('../models/Product');
const Review= require('../models/Review');
const router= express.Router();
const {isLoggedIn}=require('../middleware');


router.post('/products/:id/review',isLoggedIn,async(req,res)=>{
    try{
        let {id}= req.params;
        let {rating,comment}= req.body;

        if (rating === '0' || !rating) {
            req.flash('error', 'Rating cannot be zero. Please select at least one star.');
            return res.redirect(`/products/${id}`);
        }

       const product=await Product.findById(id);
       const review= new Review({rating,comment});

       review.author = req.user._id;
       product.reviews.push(review);
       await review.save();
       await product.save();

       req.flash('success','Review Added Successfully');
       res.redirect(`/products/${id}`);
    }
    catch(e){
        req.flash('error','Cannot Add Review')
        res.redirect(`/products/${id}`);
    }
})

// To Delete a review

router.delete('/products/:productID/review/:reviewID',isLoggedIn,async(req,res)=>{
    try{
        const {productID,reviewID}= req.params;
        // remove the reference of review from Product
        await Product.findByIdAndUpdate(productID,{
            $pull:{reviews:reviewID}
        })

        // delete review
        await Review.findByIdAndDelete(reviewID);
        req.flash('success','Review deleted succssfully');
        res.redirect(`/products/${productID}`);
    }
    catch(e){
        console.log(e);
        res.status(404).send("Cannot Delete review");
    }
})

module.exports=router;