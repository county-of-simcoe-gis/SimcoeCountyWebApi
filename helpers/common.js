const config = require("../config.json");

module.exports = {
  getSqlDateString: function(dt) {
    var dtstring = dt.getFullYear() + "-" + this.pad2(dt.getMonth() + 1) + "-" + this.pad2(dt.getDate()) + " " + this.pad2(dt.getHours()) + ":" + this.pad2(dt.getMinutes()) + ":" + this.pad2(dt.getSeconds());
    return dtstring;
  },

  pad2: function(number) {
    var str = "" + number;
    while (str.length < 2) {
      str = "0" + str;
    }

    return str;
  },

  isHostAllowed(req, res) {
    // CHECK THE CALLER
    if (config.allowedOrigins.indexOf(req.headers.host) === -1) {
      res.send("Unauthorized Domain!");
      return false;
    }

    return true;
  }
};
