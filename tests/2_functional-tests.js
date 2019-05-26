/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var server = require('../server');
var testId;
var testId2;
var testReplyId;

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {

    suite('POST', function() {
      test('one post', (done) => {
        chai.request(server)
        .post('/api/threads/general')
        .send({
          text: 'My Text',
          delete_password: 'pass'
        })
        .end((req, res) => {
          assert.equal(res.status, 200);
          done();
        });
      });
      test('two post', (done) => {
        chai.request(server)
        .post('/api/threads/general')
        .send({
          text: 'My Text2',
          delete_password: 'pass'
        })
        .end((req, res) => {
          assert.equal(res.status, 200);
          done();
        });
      });
    });

    suite('GET', function() {
      test('returns one record', (done) => {
        chai.request(server)
        .get('/api/threads/general')
        .end((req, res) => {
          assert.equal(res.body[0].text, 'My Text2');
          assert.equal(res.body[1].text, 'My Text');
          assert.isUndefined(res.body[0].delete_password);
          assert.isUndefined(res.body[1].delete_password);
          testId = res.body[0]._id;
          testId2 = res.body[1]._id;
          done();
        })
      });
    });

    suite('DELETE', function() {
      test('removes that record no success', (done) => {
        chai.request(server)
        .delete('/api/threads/general')
        .send({thread_id: testId, delete_password: 'bad'})
        .end((req, res) => {
          assert.equal(res.text, 'incorrect password');
          done();
        })
      });
      test('removes that record with success', (done) => {
        chai.request(server)
        .delete('/api/threads/general')
        .send({thread_id: testId, delete_password: 'pass'})
        .end((req, res) => {
          assert.equal(res.text, 'success');
          done();
        })
      })
    });

    suite('PUT', function() {
      test('reporting', (done) => {
        chai.request(server)
        .put('/api/threads/general')
        .send({thread_id: testId2, delete_password: 'pass'})
        .end((req, res) => {
          assert.equal(res.text, 'reported');
          done();
        });
      })
    });
  });

  suite('API ROUTING FOR /api/replies/:board', function() {

    suite('POST', function() {
      test('post one reply', (done) => {
        chai.request(server)
        .post('/api/replies/general')
        .send({
          text: 'My reply',
          thread_id: testId2,
          delete_password: 'pass'
        })
        .end((req, res) => {
          assert.equal(res.status, 200);
          done();
        })
      })
    });

    suite('GET', function() {
      test('get one reply', (done) => {
        chai.request(server)
        .get('/api/replies/general')
        .query({thread_id:  testId2})
        .end((req, res) => {
          assert.equal(res.body.replies[0].text, 'My reply');
          testReplyId = res.body.replies[0]._id;
          done();
        });
      });
    });

    suite('PUT', function() {
      test('report one reply', (done) => {
        chai.request(server)
        .put('/api/replies/general')
        .send({reply_id: testReplyId, thread_id: testId2})
        .end((req, res) => {
          assert.equal(res.text, 'reported');
          done();
        });
      })
    });

    suite('DELETE', function() {
      test('delete one reply', (done) => {
        chai.request(server)
        .delete('/api/replies/general')
        .send({reply_id: testReplyId, delete_password: 'pass'})
        .end((req, res) => {
          assert.equal(res.text, 'success');
          done();
        });
      });
    });

  });

});
