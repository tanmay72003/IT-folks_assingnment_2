const mongoose = require('mongoose');
require('dotenv').config();
const url = '';

function mongooseConnect(){
    mongoose.connect(process.env.Mongo_connection_URL,{useNewUrlParser : true, useUnifiedTopology : true});
    const connection = mongoose.connection;
    connection.once('open',()=>{
        console.log("connected to database....");
    }).on('error', ()=>{
        console.log("conneciton error....")
    });

}

module.exports = mongooseConnect;
