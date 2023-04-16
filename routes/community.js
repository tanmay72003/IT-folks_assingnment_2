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


router.post('/', AuthenticateUser, async (req, res)=>{
    function convertToSlug(Text) {
      if (!Text) {
        return '';
      }
      return Text.toLowerCase()
                 .replace(/ /g, '-')
                 .replace(/[^\w-]+/g, '');
    }
    const now = new Date();
    const userId = req.user.id;
    try{
        const newid = Snowflake.generate();
        const community = new Community({
          _id:newid, 
          id: newid,
          name: req.body.name,
          slug : convertToSlug(req.body.name),
          owner : userId,
          created_at: now,
          updated_at : now,
        });
        const role = await Role.findOne({name :"Community Admin"});
        const RoleId = role.id;
        const member = new Member({
          id: Snowflake.generate(),
          community: community.id,
          user: userId,
          role: RoleId, 
          created_at: now,
          
        });
        const responce = await community.save() && await member.save();
        res.json(
          {
            status: true,
            content: {
              data: {
                id: community.id,
                name: community.name,
                slug : community.slug,
                owner : community.owner,
                created_at: community.created_at,
                updated_at : community.updated_at,
              }
            }
          });
    }catch(error){
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
    
  });
  
  
  router.get('/', paginations(Community), (req, res)=>{
      res.json({
        status: true,
        content: {
          meta: {
            total: res.totalCount,
            pages: res.maxPages,
            page: res.page,
          },
          data: res.paginatedResults.results,
        }
    })
  });
  
  router.get('/:id/members', async (req, res)=>{
    const id = req.params.id;
    // console.log(id);
    const totalCount = await Member.countDocuments().exec();
    if(!totalCount){
      res.status(500).json({error : "there is no member and community"});
    }
        let page = 1;
        const limit = 10;
        const maxPages = Math.ceil(totalCount / limit);
    
        if (page < 1 || page > maxPages) {
          return res.status(400).json({
            message: `Invalid page requested. Page must be between 1 and ${maxPages}.`
          });
        }
    
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
    
        const results = {}
    
        if (endIndex < totalCount) {
          results.next = {
            page: page + 1,
            limit: limit
          }
        }
        
        if (startIndex > 0) {
          results.previous = {
            page: page - 1,
            limit: limit
          }
        }
    
        try {
          const query = Member.find({community: id}).select('-_id -__v').limit(limit).skip(startIndex);
            query.populate({
              path : 'user',
              select : '-_id id name'
          }).populate({
            path : 'role',
            select : '-_id id name',
          })
          const  selectedMembers = await query.exec();
          if(!selectedMembers){
            res.status(500).json({error : 'pls check your status in communities, NO data for YOU'})
          }
          res.json({
            status: true,
            content: {
              meta: {
                total: totalCount,
                pages: maxPages,
                page: page,
              },
              data: selectedMembers,
            }
        })
          
        } catch (error) {
          res.status(500).json({ message: error.message })
        }
  
  });
  
  router.get('/me/owner', AuthenticateUser, async (req, res)=>{
  
        const totalCount = await Member.countDocuments().exec();
        if(!totalCount){
          res.status(500).json({error : "there is no member and community"});
        }
        let page = 1;
        const limit = 10;
        const maxPages = Math.ceil(totalCount / limit);
    
        if (page < 1 || page > maxPages) {
          return res.status(400).json({
            message: `Invalid page requested. Page must be between 1 and ${maxPages}.`
          });
        }
    
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
    
        const results = {}
    
        if (endIndex < totalCount) {
          results.next = {
            page: page + 1,
            limit: limit
          }
        }
        
        if (startIndex > 0) {
          results.previous = {
            page: page - 1,
            limit: limit
          }
        }
        const id = req.user.id
        try {
          const query = Community.find({owner: id}).select('-_id -__v').limit(limit).skip(startIndex);
          const  selectedMembers = await query.exec();
          res.json({
            status: true,
            content: {
              meta: {
                total: totalCount,
                pages: maxPages,
                page: page,
              },
              data: selectedMembers,
            }
        })
          
        } catch (error) {
          console.error(error);
        res.status(500).json({ error: 'Internal server error' });
        }
  
  });
  
  router.get('/me/member', AuthenticateUser, async (req, res)=>{
    
    const totalCount = await Member.countDocuments().exec();
    if(!totalCount){
      res.status(500).json({error : "there is no member and community"});
    }
    let page = 1;
    const limit = 10;
    const maxPages = Math.ceil(totalCount / limit);
  
    if (page < 1 || page > maxPages) {
      return res.status(400).json({
        message: `Invalid page requested. Page must be between 1 and ${maxPages}.`
      });
    }
  
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
  
    const results = {}
  
    if (endIndex < totalCount) {
      results.next = {
        page: page + 1,
        limit: limit
      }
    }
    
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit
      }
    }
    const id = req.user.id
    try {
      const query = Member.find({user : id}).select('-_id  community').limit(limit).skip(startIndex);
      query.populate({path :'community', select : '-_id -__v', populate : {path : 'owner', select : '-_id id name'} });
      if (query.community) {
        await query.community.populate('owner');
      } 
      const  selectedMembers = await query.exec();
      if(!selectedMembers){
        res.status(500).json({error : 'pls check your status in communities, NO data for YOU'})
      }
      res.json({
        status: true,
        content: {
          meta: {
            total: totalCount,
            pages: maxPages,
            page: page,
          },
          data: selectedMembers,
        }
    })
      
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  
  });

  module.exports = router;