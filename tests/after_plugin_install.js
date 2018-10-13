module.exports = function(ctx) {

  var fs = ctx.requireCordovaModule('fs'),
      path = ctx.requireCordovaModule('path'),
      Q = ctx.requireCordovaModule('q');
  var projectRoot = ctx.opts.projectRoot,
    configXmlPath = path.join(projectRoot, 'config.xml'),
    pluginXmlPath = path.join(__dirname, '..', 'plugin.xml');


  return Q.Promise(function(resolve, reject, notify) {
    // Backup the original plugin.xml file
    return fs.createReadStream(path.join(__dirname, 'google-services.json'))
        .pipe(fs.createWriteStream(projectRoot + '/platforms/android/app/google-services.json'))
        .on("error", reject)
        .on("close", resolve);
  });

};
