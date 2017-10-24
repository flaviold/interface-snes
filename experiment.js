var pathBase = require('./settings').experimentPaths;
var jsonfile = require('jsonfile');

var experiment = function (path, callback) {
    var self = this;
    this.order = 0;

    this.insertSample = function(obj) {
        jsonfile.writeFile(path + 'sample-' + obj.frame + '.json', obj, function (err) {
            if (err) {
                console.log(err);
            }
        });
    };

    callback();
};

module.exports = experiment;