const router = require('express').Router();  
const bcrypt = require('bcrypt');
const User = require('../schemas/userSchema');
const { Snowflake } = require("@theinternetfolks/snowflake");
require('dotenv').config();
const FindUser = require('../middlewares/finduser');
const createAccesstoken = require('../middlewares/createaccesstoken');
const AuthenticateUser = require('../middlewares/authenticateuser');



router.post('/signup', async (req, res) => {
    let encryptedPassword = await bcrypt.hash(req.body.password, 10);
    const newId = Snowflake.generate();
    const newUser = new User({
      _id :newId,
      id:newId,
      name: req.body.name,
      email: req.body.email,
      password: encryptedPassword
    });
    const now = new Date();
    const accesstoken = createAccesstoken(newUser);
  
    try {
      const upadateUser = await newUser.save();
  
      res.cookie('access_token', accesstoken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });
  
      res.json({
        status: true,
        content: {
          data: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            created_at: now,
          },
          meta: {
            access_token: accesstoken,
          },
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
});
  
router.post('/signin', async (req, res)=>{
        try{
          const {email, password}  = req.body;
          if(! email && password) return res.status(400).send("All input are required");
          const user = await FindUser(email);
          if(user &&  (await bcrypt.compare(password, user.password))){
            const accesstoken = createAccesstoken(user);
            res.cookie('access_token', accesstoken, {
              httpOnly: true,
              secure: true,
              sameSite: 'strict',
            });

            res.json({
              status: true,
              content: {
                data: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  created_at: user.created_at,
                },
                meta: {
                  access_token: accesstoken,
                },
              },
            });
            
            
          }else{
            res.status(400).send('Invalid credentials');
          }
        }catch(err){
            console.log(err);
            res.status(500).json({ error: 'Internal server error' });
        }
});

router.get('/me', AuthenticateUser, (req, res)=>{
    const user = req.user;
    res.json({
      status: true,
      content: {
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at,
        },
      },
    }); 

});

module.exports = router;