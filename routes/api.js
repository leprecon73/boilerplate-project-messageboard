/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const expect = require('chai').expect;
const MongoClient = require('mongodb');
const Thread = require('./thread');
const Reply = require('./reply');
const mongoose = require('mongoose');

var CONNECTION_STRING = process.env.CONNECTION_STRING? process.env.CONNECTION_STRING:'mongodb://127.0.0.1:27017/fcc';
mongoose.connect(CONNECTION_STRING, { useNewUrlParser: true });

module.exports = function (app) {

  app.route('/api/threads/:board')
  .post((req, res) => {
    let thread = new Thread({
      board: req.params.board,
      text: req.body.text,
      created_on: new Date(),
      bumped_on: new Date(),
      reported: false,
      delete_password: req.body.delete_password,
      replies: []
    });
    thread.save((err, data) => {
      if(err){
        res.send('fail!');
      } else {
        res.redirect(200, '/b/' + req.params.board);
      }
    });
  })
  .put((req, res) => {
    req.body._id=req.body.thread_id;
    delete req.body.thread_id;
    Thread.findOne(req.body, (err, data) => {
      if(err || !data){
        res.send('fail!');
      } else {
        data.reported = true;
        data.save((err, data) => {
          if(err){
            res.send('fail!');
          } else {
            res.send('reported');
          }
        });
      }
    });
  })
  .delete((req, res) => {
    req.body._id=req.body.thread_id;
    delete req.body.thread_id;
    Thread.findOneAndDelete(req.body, (err, data) => {
      if(err || !data){
        res.send('incorrect password');
      } else {
        res.send('success');
      }
    })
  })
  .get((req, res) => {
    var board = req.params.board;
    var thread_id = req.query.thread_id;
    if(thread_id){
      Thread
        .findById(thread_id)
        .select('-delete_password')
        .select('-reported')
        .populate('replies', '-delete_password')
        .sort({bumped_on: -1})
        .exec((err, data) => {
          if(err){
            res.send('fail!');
          } else {
            res.json(data);
          }
        });
    } else {
      Thread
        .find({ board: board})
        .limit(10)
        .select('-delete_password')
        .select('-reported')
        .populate('replies', '-delete_password')
        .sort({bumped_on: -1})
        .exec((err, data) => {
          if(err){
            res.send('fail!');
          } else {
            data.forEach(t => {
              t.replies = t.replies.slice(0, 3);
            })
            res.json(data);
          }
        });
    }
  });


  app.route('/api/replies/:board')
  .post((req, res) => {
    let password = req.body.delete_password;
    let text = req.body.text;
    let id = req.body.thread_id;
    delete req.body.delete_password;
    delete req.body.text;
    if(id){
      req.body._id = id;
      delete req.body.thread_id;
    }
    req.body.board = req.params.board;
    Thread.find(req.body, (err, ths) => {
      let reply = new Reply({
          thread_id: req.body.thread_id,
          board: req.params.board,
          text: text,
          reported: false,
          created_on: new Date(),
          delete_password: password
      });
      reply.save((err,data)=>{
        ths.forEach(th => {
          if(!th.replies){
            th.replies = [];
          }
          th.replies.push(reply);
          th.bumped_on = new Date();
          th.save((err, data) => {});
        });
      });

      res.redirect(200, '/b/' + req.params.board + '/' + req.body.thread_id);
    });
  })
  .get((req, res) => {
    var thread_id = req.query.thread_id;
      Thread
        .findById(thread_id)
        .select('-delete_password')
        .select('-reported')
        .populate('replies', '-delete_password -reported')
        .exec((err, data) => {
          if(err){
            res.send('fail!');
          } else {
            res.json(data);
          }
        });
  })
  .put((req, res) => {
      let threadId = req.body.thread_id;
      let replyId = req.body.reply_id;
      Reply.findById(replyId, (err, data) => {
        if(err){
          res.send('not found');
        } else {
          data.reported = true;
          data.save((err, data) => {});
          Thread.findById(threadId)
              .populate('replies', '-delete_password')
              .exec((err,th)=>{
                if(err){
                  res.send('fail');
                } else {
                  res.send('reported');
                }
          })
        }
      })

  })
  .delete((req, res) => {
    Reply.findById(req.body.reply_id)
      .exec((err, data) => {
      if(err || !data){
        res.send('incorrect password');
      } else {
        if(data.delete_password === req.body.delete_password){
          data.text='[deleted]';
          data.save((err,data)=>{});
          res.send('success');
        } else {
          res.send('incorrect password');
        }
      }
    })
  })

};
