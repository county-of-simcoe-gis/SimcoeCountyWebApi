const swaggerAutogen = require("swagger-autogen")();
const package = require("./package.json");
const outputFile = "./api-doc.json";
const exclude = ["routeBuilder.js"];
const doc = {
  info: {
    version: package.version,
    title: package.title || package.name,
    description: package.description || "",
  },
  host: package.host || "",
  schemes: ["https", "http"],
  basePath: package.basePath || "/",
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
      if (!exclude.includes(file)) arrayOfFiles.push(require("path").join(dirPath, file));
    }
  });

  return arrayOfFiles;
};

const routeFiles = getAllFiles("./routes");
swaggerAutogen(outputFile, routeFiles, doc);
