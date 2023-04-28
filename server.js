const swaggerAutogen = require("swagger-autogen")({ openapi: "3.0.0" });
const package_file = require("./package.json");
const outputFile = "./api-doc.json";
const exclude = ["routeBuilder.js"];
const doc = {
  info: {
    version: package_file.version,
    title: package_file.title || package_file.name,
    description: package_file.description || "",
  },
  host: package_file.host || "",
  schemes: ["https", "http"],
  basePath: package_file.basePath || "/",
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
swaggerAutogen(outputFile, routeFiles, doc).then(() => {
  require("./app.js");
});
