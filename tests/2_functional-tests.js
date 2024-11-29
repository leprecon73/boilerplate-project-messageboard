const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let board_of_thread_to_delete
let thread_to_delete
let pw_for_thread_to_delete
let thread_url

let reply_to_delete
let pw_for_reply_to_delete

suite('Functional Tests', function() {
  // #1
  test('#1 Creating a new thread: POST request to /api/threads/{board}', function (done) {
    chai
      .request(server)
      .post('/api/threads/test%20board%202') // did not write :board to get FCC tests to work
      .send({
        board: 'test board 2',
        text: 'test thread title/text',
        delete_password: 'pw'
      })
      .end(function (err, res) {
        //console.log(res.body)
        board_of_thread_to_delete = res.body.board
        thread_to_delete = res.body._id;
        pw_for_thread_to_delete = res.body.delete_password;
        
        assert.equal(res.status, 200);
        assert.equal(res.body.text, 'test thread title/text');
        assert.equal(res.body.delete_password, 'pw');
        assert.equal(res.body.board, 'test board 2');
        assert.typeOf(res.body.created_on, 'string');
        assert.typeOf(res.body.bumped_on, 'string'); 
        assert.equal(res.body.reported, false);
        assert.isArray(res.body.replies);       
        done();
      });
  });

  // #2
  test('#2 Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}', function (done) {
    chai
      .request(server)
      .get('/api/threads/test%20board')
      .query({})
      .end(function (err, res) {
        //console.log(res.body)
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.equal(res.body.length, 10);
        assert.isBelow(res.body[0].replies.length, 4);
        assert.isBelow(res.body[1].replies.length, 4);
        assert.isBelow(res.body[2].replies.length, 4);
        assert.isBelow(res.body[3].replies.length, 4);
        assert.isBelow(res.body[4].replies.length, 4);
        assert.isBelow(res.body[5].replies.length, 4);
        assert.isBelow(res.body[6].replies.length, 4);
        assert.isBelow(res.body[7].replies.length, 4);
        assert.isBelow(res.body[8].replies.length, 4);
        assert.isBelow(res.body[9].replies.length, 4);
        done();
      });
  });

  // #3
  test('#3 Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password', function (done) {
    chai
      .request(server)
      .delete('/api/threads/:board')
      .send({
        board: board_of_thread_to_delete,
        thread_id: thread_to_delete,
        delete_password: 'incorrect password'
      })
      .end(function (err, res) {
        //console.log(res.body)
        assert.equal(res.status, 200);
        assert.equal(res.body, 'incorrect password');
        done();
      });
  });

  // #5
  test('#5 Reporting a thread: PUT request to /api/threads/{board}', function (done) {
    chai
      .request(server)
      .put('/api/threads/:board')
      .send({
        board: board_of_thread_to_delete,
        thread_id: thread_to_delete
      })
      .end(function (err, res) {
        //console.log('PUT request res.body: ', res.body)
        assert.equal(res.status, 200);
        assert.equal(res.body, 'success');
        done();
      });
  });

  // #6
  test('#6 Creating a new reply: POST request to /api/replies/{board}', function (done) {
      chai
      .request(server)
      .post('/api/replies/test%20board%202') // did not write :board to get FCC tests to work
      .send({
        board: board_of_thread_to_delete,
        thread_id: thread_to_delete,
        text : 'some reply text',
        delete_password: pw_for_thread_to_delete
      })
      .end(function (err, res) {
        console.log(res.body)
        reply_to_delete = res.body.replies[0]._id;
        pw_for_reply_to_delete = res.body.replies[0].delete_password;
        
        assert.equal(res.status, 200);
        assert.equal(res.body.text, 'test thread title/text');
        assert.equal(res.body.delete_password, 'pw');
        assert.equal(res.body.board, 'test board 2');
        assert.typeOf(res.body.created_on, 'string');
        assert.typeOf(res.body.bumped_on, 'string'); 
        assert.equal(res.body.reported, true);
        assert.isArray(res.body.replies);    
        assert.equal(res.body.replies[0].text, 'some reply text');
        assert.equal(res.body.replies[0].delete_password, 'pw');  
        assert.typeOf(res.body.replies[0].created_on, 'string'); 
        assert.typeOf(res.body.replies[0].reported, 'boolean');  
        assert.isNotNull(res.body.replies[0]._id); 
        done();
      });
  });

  // #7
  test('#7 Viewing a single thread with all replies: GET request to /api/replies/{board}', function (done) {
    chai
      .request(server)
      .get('/api/replies/test%20board?thread_id=618bc0d05994b431c4b1c530')
      .query({})
      .end(function (err, res) {
        console.log(res.body)
        assert.equal(res.status, 200);
        assert.isArray(res.body.replies);
        assert.typeOf(res.body.replies[0].created_on, 'string');
        assert.typeOf(res.body.replies[0]._id, 'string');
        assert.isUndefined(res.body.replies[0].reported);
        assert.isUndefined(res.body.replies[0].delete_password);
        done();
      });
  });

  // #8
  test('#8 Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password', function (done) {
    chai
      .request(server)
      .delete('/api/replies/:board')
      .send({
        board: board_of_thread_to_delete,
        thread_id: thread_to_delete,
        reply_id: reply_to_delete,
        delete_password: 'incorrect password'
      })
      .end(function (err, res) {
        //console.log(res.body)
        assert.equal(res.status, 200);
        assert.equal(res.body, 'incorrect password');
        done();
      });
  });

  // #10
  test('#10 Reporting a reply: PUT request to /api/replies/{board}', function (done) {
    chai
      .request(server)
      .put('/api/replies/:board')
      .send({
        board: board_of_thread_to_delete,
        thread_id: thread_to_delete,
        reply_id: reply_to_delete
      })
      .end(function (err, res) {
        //console.log('PUT request res.body: ', res.body)
        assert.equal(res.status, 200);
        assert.equal(res.body, 'success');
        done();
      });
  });

//Added these two tests at the end because the ones above depend on the thread and reply created (and the two tests below delete these)
  // #9
  test('#8 Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password', function (done) {
    chai
      .request(server)
      .delete('/api/replies/:board')
      .send({
        board: board_of_thread_to_delete,
        thread_id: thread_to_delete,
        reply_id: reply_to_delete,
        delete_password: pw_for_reply_to_delete
      })
      .end(function (err, res) {
        //console.log(res.body)
        assert.equal(res.status, 200);
        assert.equal(res.body, 'success');
        done();
      });
  });

  // #4
  test('#4 Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password', function (done) {
    chai
      .request(server)
      .delete('/api/threads/:board')
      .send({
        board: board_of_thread_to_delete,
        thread_id: thread_to_delete,
        delete_password: pw_for_thread_to_delete
      })
      .end(function (err, res) {
        //console.log(res.body)
        assert.equal(res.status, 200);
        assert.equal(res.body, 'success');
        done();
      });
  });






});
