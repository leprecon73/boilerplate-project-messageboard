const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    async () => {
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
      };

});
