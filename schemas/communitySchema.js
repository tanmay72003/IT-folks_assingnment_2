const mongoose = require('mongoose');
const {Snowflake } = require('@theinternetfolks/snowflake')

const communitySchema = new mongoose.Schema({
    _id: {
        type : String,
        default : Snowflake.generate(),
        required : true,
    },
    id: {
        type: String,
        required: true,
        unique: true
      },
      name: {
        type: String,
        maxlength: 128
      },
      slug: {
        type: String,
        required: true,
        unique: true,
        maxlength: 255,
        min : 2,
      },
      owner:{
            type: String,
            ref : 'User',
            required: true,
      },
      created_at: {
        type: Date,
        default: Date.now
      },
      updated_at: {
        type: Date,
        default: Date.now
      }
},{
  toJSON: {virtuals : true },
  toObject : {virtuals: true },
});


module.exports = mongoose.model('Community', communitySchema);