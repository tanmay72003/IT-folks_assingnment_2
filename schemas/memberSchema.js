const mongoose = require('mongoose');
const {Snowflake } = require('@theinternetfolks/snowflake')
const memberSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    default : Snowflake.generate,
  },
  id: {
    type: String,
    required: true,
    unique: true
  },
  community: {
    type: String,
    ref: 'Community',
    required: true
  },
  user: {
    type: String,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    ref: 'Role',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Member', memberSchema);
