const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const path = require('path');
const cookieParser = require('cookie-parser');
const connectdb = require('./database/db');
connectdb();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.use('/v1/auth', require('./routes/auth'));
app.use('/v1/role', require('./routes/role'));
app.use('/v1/community', require('./routes/community'));
app.use('/v1/member', require('./routes/member'));

app.listen(PORT, function() {   
    console.log(`listening to port ${PORT}`);
});