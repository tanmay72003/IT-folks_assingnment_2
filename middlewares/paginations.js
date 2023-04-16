
function paginations(model){
    return async (req, res, next)=>{
      const totalCount = await model.countDocuments().exec();
      if(!totalCount){
        res.status(500).json({error : 'no record in the database'});
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
        const query = model.find().select('-_id -__v').limit(limit).skip(startIndex);
        const schemaHasOwner = model.schema.paths.hasOwnProperty('owner');
        if (schemaHasOwner) {
          query.populate({
            path : 'owner',
            select : '-_id id name'
          });
        }
        results.results = await query.exec();
        res.paginatedResults = results;
        res.page = page;
        res.totalCount = totalCount;
        res.maxPages = maxPages;
        next()
      } catch (error) {
        res.status(500).json({ message: error.message })
      }
    }
  }

  module.exports = paginations;