/**
 * Cleans up sloppy URLs on the request object, like /foo////bar/// to /foo/bar.
 *
 * @private
 * @function strip
 * @param    {Object} path - a url path to clean up
 * @returns  {String} cleaned path
 */
module.exports = {
  strip: (path) => {
    var cur;
    var next;
    var str = "";
    for (var i = 0; i < path.length; i++) {
      cur = path.charAt(i);
      if (i !== path.length - 1) {
        next = path.charAt(i + 1);
      }
      if (cur === "/" && (next === "/" || (next === "?" && i > 0))) {
        continue;
      }
      str += cur;
    }
    return str;
  },
};
