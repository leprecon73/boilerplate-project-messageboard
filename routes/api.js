"use strict";
require("dotenv").config();
const URI = process.env.URI;
let mongoose = require("mongoose");
//const { MongoClient, ServerApiVersion } = require('mongodb');
const { ObjectId } = require("mongodb");
//mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(URI, {});

const threadSchema = new mongoose.Schema({
  board: String,
  text: String,
  created_on: { type: Date, default: Date.now },
  bumped_on: { type: Date, default: Date.now },
  reported: { type: Boolean, default: false },
  delete_password: String,
  replies: [
    {
      _id: { type: ObjectId, default: new ObjectId() },
      text: String,
      created_on: { type: Date, default: Date.now },
      delete_password: String,
      reported: { type: Boolean, default: false },
    },
  ],
});
const modelThread = mongoose.model("Thread", threadSchema);

module.exports = function (app) {
  app
    .route("/api/threads/:board")
    .post(async (req, res) => {
      /** The saved database record will have at least the fields _id,
       * text, created_on(date & time), bumped_on(date & time, starts same as created_on),
       * reported (boolean), delete_password, & replies (array).*/

      const { text, delete_password } = req.body;

      const newThread = new modelThread({
        board: req.params.board,
        text: text,
        delete_password: delete_password,
      });

      await newThread.save();

      res.redirect(`/b/${req.params.board}/`);
    })
    .get(async (req, res) => {
      /**7. You can send a GET request to /api/threads/{board}. Returned will be an array of the most recent 10 bumped
       * threads on the board with only the most recent 3 replies for each. The reported and delete_password fields
       * will not be sent to the client. */
      const { board } = req.params;

      const threadArr = await modelThread
        .find({ board })
        .sort({ bumped_on: -1 })
        .limit(10)
        .lean();

      threadArr.forEach((thread) => {
        delete thread.delete_password;
        delete thread.reported;

        thread.replies = thread.replies
          .sort((e, v) => v.created_on - e.created_on)
          .slice(-3)
          .map((reply) => {
            delete reply.delete_password;
            delete reply.reported;
            return reply;
          });

        thread.replycount = thread.replies.length;
      });

      //console.log('threadArr = ', threadArr.length)

      return res.json(threadArr);
    })
    .delete(async (req, res) => {
      /**9. You can send a DELETE request to /api/threads/{board} and pass along the thread_id & delete_password to delete the thread.
       * Returned will be the string incorrect password or success. */
      const { delete_password, thread_id } = req.body;
      const thread = await modelThread.findById(thread_id);
      //console.log('thread = ', thread)

      if (thread && delete_password === thread.delete_password) {
        await modelThread.findByIdAndDelete(thread_id);
        //console.log('success', delete_password, thread.delete_password)
        return res.send("success");
      } else {
        //console.log('incorrect password', delete_password, thread.delete_password)
        return res.send("incorrect password");
      }
    })
    .put(async (req, res) => {
      /**11. You can send a PUT request to /api/threads/{board} and pass along the thread_id. Returned will be the string reported.
       * The reported value of the thread_id will be changed to true. */
      const { thread_id } = req.body;
      const thread = await modelThread.findById(thread_id);
      if (thread) {
        thread.reported = true;
        await thread.save();
        return res.send("reported");
      }
      return res.send("Error reporting thread");
    });

  app
    .route("/api/replies/:board")
    .post(async (req, res) => {
      /**6. You can send a POST request to /api/replies/{board} with form data including text, delete_password, & thread_id.
       * This will update the bumped_on date to the comment's date. In the thread's replies array, an object will be saved with at
       * least the properties _id, text, created_on, delete_password, & reported. */
      const { thread_id, board, text, delete_password } = req.body;

      const newReply = {
        _id: new ObjectId(),
        text,
        delete_password,
        created_on: new Date(),
        reported: false,
      };
      //console.log(/*thread_id, board, text, delete_password, */"APInewReply =",newReply);
      const thread = await modelThread.findByIdAndUpdate(
        thread_id,
        { $push: { replies: newReply }, $set: { bumped_on: new Date() } },
        { new: true }
      );
      //console.log("APIthread =", thread);
      if (!thread) return res.status(404).send(`No such thread: ${thread_id}.`);
      return res.redirect(`/b/${board}/${thread_id}`);
    })
    .get(async function (req, res) {
      /**8. You can send a GET request to /api/replies/{board}?thread_id={thread_id}. Returned will be the entire thread with
       * all its replies, also excluding the same fields from the client as the previous test. */
      let thread = await modelThread
        .findById(req.query.thread_id)
        .select(
          "-reported -delete_password -replies.reported -replies.delete_password"
        )
        .lean();

      if (!thread) {
        res.status(404).send("No such thread");
      }

      thread.replies.sort((e, v) => {
        v.created_on - e.created_on;
      });

      thread.replies.forEach((reply) => {
        reply.reported = undefined;
        reply.delete_password = undefined;
      });
      //console.log("APIthread =", thread);
      return res.json(thread);
    })
    .delete(async (req, res) => {
      /**10. You can send a DELETE request to /api/replies/{board} and pass along the thread_id, reply_id, & delete_password. Returned
       * will be the string incorrect password or success. On success, the text of the reply_id will be changed to [deleted]. */
      const { thread_id, delete_password, reply_id } = req.body;

      let thread = await modelThread.findById(thread_id).exec();

      if (!thread) {
        return res.send("No such thread");
      }

      const reply = thread.replies.find((e) => e["_id"] == reply_id);

      if (!reply) {
        return res.send("No such reply");
      }

      if (delete_password == reply.delete_password) {
        reply.text = "[deleted]";
        await thread.save();
        return res.send("success");
      } else {
        return res.send("incorrect password");
      }
    })
    .put(async (req, res) => {
      /**12. You can send a PUT request to /api/replies/{board} and pass along the thread_id & reply_id. Returned will be the string
       * reported. The reported value of the reply_id will be changed to true. */
      const { thread_id, reply_id } = req.body;

      const thread = await modelThread.findOneAndUpdate(
        { _id: thread_id, "replies._id": reply_id },
        { $set: { "replies.$.reported": true } }
      );

      if (thread) {
        res.send("reported");
      }
    });
};
