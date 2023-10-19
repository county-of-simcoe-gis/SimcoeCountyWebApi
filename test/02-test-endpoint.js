// init the test client
var config = require("../config");
const packageJson = require("../package.json");
const { assert } = require("mocha");

var fetch = require("node-fetch");
var serverPort = process.env.PORT || config.app.port;
const serverUrl = `http://localhost:${serverPort}/${packageJson.defaultRoute}`;
describe("check for a 200 responses", () => {
  // Test /public/map/default
  it("checking /public/map/default", (done) => {
    const request = fetch(serverUrl + "/public/map/default")
      .then((response) => {
        assert.equal(response.status, 200);
      })
      .catch((err) => {
        throw new Error(err);
      })
      .finally(done);
  });
  it("checking /public/captcha", (done) => {
    const request = fetch(serverUrl + "/public/captcha/response/PRODUCTION/test")
      .then((response) => {
        assert.equal(response.status, 200);
      })
      .catch((err) => {
        throw new Error(err);
      })
      .finally(done);
  });
  it("checking /public/feedback", (done) => {
    const request = fetch(serverUrl + "/public/feedback/test")
      .then((response) => {
        assert.equal(response.status, 200);
      })
      .catch((err) => {
        throw new Error(err);
      })
      .finally(done);
  });
});
