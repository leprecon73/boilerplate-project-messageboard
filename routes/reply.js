const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ReplySchema = new Schema({
  thread_id: String,
  board: String,
  text: String,
  created_on: Date,
  delete_password: String,
  reported: Boolean,
});

const Reply = mongoose.model('Reply', ReplySchema);

module.exports = Reply;
