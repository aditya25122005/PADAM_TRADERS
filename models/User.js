const mongoose= require('mongoose');
const passportLocalMongoose= require('passport-local-mongoose');

const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        trim:true

    },
    wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    ],
    role: {
    type: String,
    enum: ['Admin', 'Seller', 'Buyer'],
    default: 'Buyer'
  },
  sellerStatus: {
    type: String,
    enum: ['none','pending','approved','rejected'],
    default: 'none'
  },
  // optionally: sellerAppliedAt, sellerApprovedAt
  sellerAppliedAt: { type: Date },
  sellerApprovedAt: { type: Date },
    
    cart:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product'
        }
    ]
})
userSchema.plugin(passportLocalMongoose);
let User=mongoose.model('User',userSchema);
module.exports=User;