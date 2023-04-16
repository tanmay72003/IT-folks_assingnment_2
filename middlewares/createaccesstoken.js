require('dotenv').config();
const jwt = require("jsonwebtoken");
function createAccesstoken(user){
    const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
        passowrd: user.password,
        created_at : user.created_at,
      };
    return jwt.sign(payload, process.env.jwt_secret, {expiresIn : '1h'});
}

module.exports = createAccesstoken;