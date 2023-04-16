const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id :{
    type :String,
    required : true,
  },
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    default: null,
    maxlength: 64
  },
  email: {
    type: String,
    required: true,
    unique: true,
    maxlength: 128
  },
  password: {
    type: String,
    required: true,
    maxlength: 64
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
