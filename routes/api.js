'use strict';

module.exports = function (app) {
  
  app.route('/api/threads/:board');
    
  app.route('/api/replies/:board');

};

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://leprecon73:<db_password>@cluster0.y56hpsc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

//ZyNlSCV3B8kgJs1P