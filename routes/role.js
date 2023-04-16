const router = require('express').Router();
const path = require('path');
const jwt = require('jsonwebtoken');    
const bcrypt = require('bcrypt');
const User = require('../schemas/userSchema');
const Member = require('../schemas/memberSchema');
const Role = require('../schemas/roleSchema');
const Community = require('../schemas/communitySchema');
const { Snowflake } = require("@theinternetfolks/snowflake");
require('dotenv').config();
const FindUser = require('../middlewares/finduser');
const paginations = require('../middlewares/paginations');
const mongoose = require('mongoose');
const createAccesstoken = require('../middlewares/createaccesstoken');
const AuthenticateUser = require('../middlewares/authenticateuser');


router.post('/', async(req, res) =>{
    try{
      const now = new Date();
      const newid = Snowflake.generate();
      const newrole = new Role({
         _id : newid,
          id : newid,
          name :req.body.name,
          created_at: now,
          updated_at: now,
      });
      const response = await newrole.save();
      res.json({
        status: true,
        content: {
          data: {
            id: newrole.id,
            name: newrole.name,
            created_at: newrole.created_at,
            updated_at : newrole.updated_at,
          },
        },
      });
    }catch(error){
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/', paginations(Role), async (req, res)=>{
const results = res.paginatedResults.results;
  res.json({
      status: true,
      content: {
        meta: {
          total: res.totalCount,
          pages: res.maxPages,
          page: res.page,
        },
        data: results,
      } 
  })
});

module.exports = router;