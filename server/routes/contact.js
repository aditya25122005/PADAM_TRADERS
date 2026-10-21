const express= require('express');
const Message = require('../models/Message');
const { isLoggedIn } = require('../middleware');
const router= express.Router();


router.post("/contact",isLoggedIn,async(req,res)=>{
    try{    
        const{name, email, contactNo, message}= req.body;
        const userId = req.user._id;
        
        const newMessage = new Message({
            name,
            email,
            contactNo,
            message,
            userId
        });
        await newMessage.save();
        res.status(200).json({ success: true, message: 'Message sent successfully!' });
    }
    catch(e){
    console.error("Error saving message:", e);
    res.status(500).json({ success: false, message: 'Failed to send message. Please try again.' });    
    }
})

module.exports=router;