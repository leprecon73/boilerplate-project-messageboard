const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
   /* async () => {
        const date = new Date();
        const text = `fcc_test_${date}`;
        const deletePassword = 'delete_me';
        const data = { text, delete_password: deletePassword };
        const url = 'https://3000-leprecon73-boilerplatep-klxzfe8egje.ws-eu116.gitpod.io';
        const res = await fetch(url + '/api/threads/fcc_test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          const checkData = await fetch(url + '/api/threads/fcc_test');
          const parsed = await checkData.json();
          try {
            assert.equal(parsed[0].text, text);
            assert.isNotNull(parsed[0]._id);
            assert.equal(new Date(parsed[0].created_on).toDateString(), date.toDateString());
            assert.equal(parsed[0].bumped_on, parsed[0].created_on);
            assert.isArray(parsed[0].replies);
          } catch (err) {
            throw new Error(err.responseText || err.message);
          }
        } else {
          throw new Error(`${res.status} ${res.statusText}`);
        }
      };*/

  /**Creating a new thread: POST request to /api/threads/{board} */
  test("1.Creating a new thread: POST request to /api/threads/{board}", (done) => {
    chai
      .request(server)
      .post("/api/threads/funcTest")
      .send({
        board: "funcTest",
        text:  "testText",
        delete_password: "passwordTest"
      })
      
      .end( (err, res) => {
        assert.equal(res.status, 200);
        done();
      });

    
  });
/*  Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board} */
test('2.Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}', (done) => {
  chai
    .request(server)
    .get('/api/threads/general')
    .query({})
    .end( (err, res) => {
      assert.equal(res.status, 200);
      assert.isArray(res.body);
      assert.equal(res.body.length, 10);

      res.body.forEach(e => {
        assert.isBelow(e.replies.length, 4);
      });
      done();
    });
});
let threadId;
/* Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password*/
test('3.Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password', (done) => {
  chai
    .request(server)
    .get("/api/threads/funcTest")
    .end(function (err, res) {
      threadId = res.body[0]._id;
      done();
    })
    .request(server)
    .delete('/api/threads/funcTest')
    .send({ thread_id: threadId, delete_password: 'incorrectPassword' })
    .end(function (err, res) {
      assert.equal(res.status, 200);
      assert.equal(res.text, 'incorrect password');
      done();
    });

});

/*Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password
Reporting a thread: PUT request to /api/threads/{board}
Creating a new reply: POST request to /api/replies/{board}
Viewing a single thread with all replies: GET request to /api/replies/{board}
Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password
Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password
Reporting a reply: PUT request to /api/replies/{board} */

});
