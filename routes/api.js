'use strict';


module.exports = function (app) {
  
  app.route('/api/threads/:board');
    
  app.route('/api/replies/:board');

};
require('dotenv').config();
const URI = process.env.URI;
let mongoose = require('mongoose');
//const { MongoClient, ServerApiVersion } = require('mongodb');

mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true });

const schemaReply = new mongoose.Schema({
  text: String,
  created_on: Date,
  bumped_on: Date,
  reported: Boolean,
  delete_password: String
})
const modelReply = mongoose.model('repliessss', schemaReply)