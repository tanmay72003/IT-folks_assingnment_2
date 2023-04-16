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



router.post('/',AuthenticateUser, async (req, res)=>{
    try{
      const role = await Role.findOne({name : 'Community Admin'});
      if(!role){
        res.send(500).json({error : 'create a community admin role first'})
      }
      const Roleid = role.id;
      const userid = req.user.id;
      const member = await Member.findOne({role : Roleid, user: userid});
      if(member && member.community === req.body.community ){
          const newmember = new Member({
            id : Snowflake.generate(),
            community : req.body.community,
            role : req.body.role,
            user : req.body.user,
            created_at: new Date(),
          });
          const response = newmember.save();
          res.json({
            status: true,
            content: {
              data: {
                id: newmember.id,
                community: newmember.community,
                user: newmember.user,
                role: newmember.role,
                created_at: newmember.created_at,
              }
            }
          })
      }else{
        res.status(500).send({error : 'NOT_ALLOWED_ACCESS'});
      }
    }catch(error){
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  
  });
  
  
  router.delete('/:id',AuthenticateUser, async (req, res)=>{
    //before makeing this work you need to create admin, community and community moderator roles
    try{
      const idmembertobedeleted = req.params.id;
      const adminRole = await Role.findOne({ name: 'Community Admin' });
      const moderatorRole = await Role.findOne({ name: 'Community Moderator' });
      if(!adminRole || !moderatorRole){
        res.status(500).json({error : "pls create the roles first to delete"})
      }else{
        const adminRoleId = adminRole.id;
        const moderatorRoleId = moderatorRole.id;
        const userId = req.user.id;
    
        const members = await Member.find({
            $and: [
            {
                $or: [
                { role: adminRoleId },
                { role: moderatorRoleId }
                ]
            },
            { user: userId }
            ]
        });
    
    
        const membertobedeleted = await Member.findOne({id : idmembertobedeleted});
        const existingMember = members.find(member => String(member.community) === String(membertobedeleted.community));
        if(members != null && existingMember != null ){
            await Member.deleteOne({id : idmembertobedeleted});
            res.json({
            "status": true
            });
        }else{
            res.status(500).json({error: 'NOT_ALLOWED_ACCESS'});
        }
      }
    }catch(error){
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
module.exports = router;