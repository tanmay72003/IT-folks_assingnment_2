

require('dotenv').config();
const jwt = require('jsonwebtoken');

function AuthenticateUser(req, res, next) {
    const authheader = req.headers['authorization'];
    const token = authheader && authheader.split(' ')[1];
    if(!token)return res.status(401).send('A token is needed for authentication');
    
    jwt.verify(token , process.env.jwt_secret, (err, user) =>{
        if(err)return res.status(403).send('your dont have access');
        req.user = user;
        next();
    });
}

module.exports = AuthenticateUser;