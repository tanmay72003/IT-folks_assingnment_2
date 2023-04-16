const mongoose = require('mongoose');
const {Snowflake } = require('@theinternetfolks/snowflake')
const roleSchema = new mongoose.Schema({
  _id: {
    type : String,
    required: true,
    default : Snowflake.generate,
  },
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    unique: true,
    maxlength: 64,
    min : 2,
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Role', roleSchema);
