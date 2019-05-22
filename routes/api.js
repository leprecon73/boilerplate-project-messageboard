/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const expect = require('chai').expect;
const mongo = require('mongo');
const mongoose = require('mongoose');

var CONNECTION_STRING=process.env.CONNECTION_STRING? process.env.CONNECTION_STRING:'mongodb://127.0.0.1:27017/fcc';
mongoose.connect(CONNECTION_STRING, { useNewUrlParser: true });

module.exports = function (app) {

  app.route('/api/threads/:board');

  app.route('/api/replies/:board');

};
