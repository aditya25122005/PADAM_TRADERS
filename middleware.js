// const isLoggedIn=(req,res,next)=>{
//     if(!req.isAuthenticated()){
//         return res.redirect('/login');
//     }
//     next();
// }

// module.exports={isLoggedIn};

const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error','Please Login First');
        return res.redirect('/login');
    }
   return next();
};

module.exports = { isLoggedIn };