'use strict';
require('dotenv').config();
const URI = process.env.URI;
let mongoose = require('mongoose');
//const { MongoClient, ServerApiVersion } = require('mongodb');
mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true });

const threadSchema = new mongoose.Schema({
  board: String,
  text: String,
  created_on: { type: Date, default: Date.now },
  bumped_on: { type: Date, default: Date.now },
  reported: { type: Boolean, default: false },
  delete_password: String,
  replies: []
});
const modelThread = mongoose.model('Thread', threadSchema) 

const replySchema = new mongoose.Schema({
  text: String,
  created_on: { type: Date, default: Date.now },
  delete_password: String,
  reported: { type: Boolean, default: false },
})
const modelReply = mongoose.model('Reply', replySchema) 

module.exports = function (app) {

app.route('/api/threads/:board')
.post(async (req, res) => {
  /** The saved database record will have at least the fields _id, 
   * text, created_on(date & time), bumped_on(date & time, starts same as created_on), 
   * reported (boolean), delete_password, & replies (array).*/
  
  const { text, delete_password } = req.body
  
  const newThread = new modelThread({
    board: req.params.board,
    text: text,
    delete_password: delete_password
  })

  await newThread.save()

  res.redirect(`/b/${req.params.board}/`)
})
.get(async (req, res) => {
/**7. You can send a GET request to /api/threads/{board}. Returned will be an array of the most recent 10 bumped 
 * threads on the board with only the most recent 3 replies for each. The reported and delete_password fields 
 * will not be sent to the client. */
  const { board } = req.params;

  const threads = await modelThread.find({ board })
    .sort({ bumped_on: -1 })
    .limit(10)
    .lean();

  console.log('threads = ', threads)

})
    
  app.route('/api/replies/:board')
  .post(async (req, res) => {
    const { thread_id, board, text, delete_password } = req.body;
    
    const newReply = { text, delete_password, created_on: new Date(), reported: false };

    const thread = await modelThread.findByIdAndUpdate(
      thread_id,
      { $push: { replies: newReply }, $set: { bumped_on: new Date() } },
      { new: true }
    );

    if (!thread) return res.status(404).send(`No such thread: ${thread_id}.`);
    res.redirect(`/b/${board}/${thread_id}`);
  })

};




