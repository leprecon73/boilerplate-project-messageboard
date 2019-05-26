const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ThreadSchema = new Schema({
  board: String,
  text: String,
  created_on: Date,
  bumped_on: Date,
  reported: Boolean,
  delete_password: String,
  replies: [{type: mongoose.Schema.Types.ObjectId, ref: 'Reply'}]
});

const Thread = mongoose.model('Thread', ThreadSchema);

module.exports = Thread;
