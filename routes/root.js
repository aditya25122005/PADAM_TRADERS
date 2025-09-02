const express= require('express');
const Product= require('../models/Product');

const router= express.Router();

router.get('/',(req,res)=>{
    
    res.render('home');
})
module.exports=router;