const User = require('../schemas/userSchema');

async function findUser(email){
    try{
        const UserOne = await User.findOne({email : email});
        if(!UserOne){
            return null;
        }
        return UserOne;
    }
    catch(err){ 
        return null;
        console.log(err);
    }

}

module.exports = findUser;