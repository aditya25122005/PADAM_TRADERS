const express= require('express');
const Product= require('../models/Product');

const router= express.Router();

router.get('/', async (req, res) => {
    try {
        const products = await Product.find({});
        res.render('home', { products });
    } catch (err) {
        console.log(err);
        res.send("Error loading home page");
    }
});

module.exports=router;