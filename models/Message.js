const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  contactNo: { type: String },
  message: { type: String, required: true },
  // Yeh field user se connection banayega
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // 'User' model ko refer kar raha hai
    
  },
  createdAt: { type: Date, default: Date.now }
});


const Message = mongoose.model('Message', messageSchema);
module.exports = Message;