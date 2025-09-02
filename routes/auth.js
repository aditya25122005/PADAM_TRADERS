const express= require('express');
const User = require('../models/User');
const passport = require('passport');


const router= express.Router();

// to show the form for register

router.get('/register',(req,res)=>{
    res.render('auth/signup')
})

// to actually register

router.post('/register',async(req,res)=>{
    try{
    let{email,username, password}= req.body;
    const user= new User({email,username});
    const newUser= await User.register(user,password);

    req.login(newUser,function(err){
        if(err){
            return next(err);
        }
        req.flash('success','Welcome To PADAM Traders')
        return res.redirect('/products');
    })
}
catch(err){
    req.flash('error',e.message);
    return res.redirect('/signup');
}
})

// to get Login form

router.get('/login',(req,res)=>{
    res.render('auth/login');
})

// to actually Login via DB
router.post('/login',
    passport.authenticate('local',{
        failureRedirect:'/login',
        failureMessage:true
    }),
    (req,res)=>{
         req.flash('success','Welcome back to PADAM Traders');
        res.redirect('/products');

    })

// // logout
// router.get('/logout', (req, res, next) => {
//     req.logout((err) => {
//         if (err) {
//             return next(err);
//         }
//         req.flash('success','Logged Out Successfully!')
//         res.redirect('/login');
//     });
// });


// logout
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        // Step 1: Set the flash message
        req.flash('success', 'Logged Out Successfully!');
        
        // Step 2: Manually destroy the session after flashing
        req.session.destroy((destroyErr) => {
            if (destroyErr) {
                return next(destroyErr);
            }
            // Step 3: Redirect the user
            res.redirect('/login');
        });
    });
});
module.exports = router;

// router.get('/logout',(req,res)=>{
//     ()=>{
//         req.logOut();
//     }
//     res.redirect('/login');
// })

// module.exports=router;