module.exports = (server, defaultRoute = "") => {
  const routeFiles = getAllFiles(require("path").join(__dirname));

  routeFiles.forEach((file) => {
    if (file.name === "routeBuilder.js") return;
    let route = `${file.path.replace(require("path").join(__dirname), "")}${file.name !== "index.js" ? "/" + file.name.replace(".js", "") : ""}`;
    route = route.split("\\").join("/");
    console.log("Building Routes", require("path").join(file.path, file.name.replace(".js", "")), defaultRoute + route);
    let middleWare = (req, res, next) => {
      return next();
    };
    require(require("path").join(file.path, file.name.replace(".js", "")))(defaultRoute + route, middleWare, server);
  });
};

const getAllFiles = function (dirPath, arrayOfFiles) {
  let files = require("fs").readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function (file) {
    if (
      require("fs")
        .statSync(dirPath + "/" + file)
        .isDirectory()
    ) {
      arrayOfFiles = getAllFiles(require("path").join(dirPath, file), arrayOfFiles);
    } else {
      arrayOfFiles.push({ path: dirPath, name: file });
    }
  });
  return arrayOfFiles;
};
