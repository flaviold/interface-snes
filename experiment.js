var pathBase = require('./settings').experimentPaths;
var jsonfile = require('jsonfile');
var uid	= require('uid');

var experiment = function (path, callback) {
    var self = this;
    this.order = 0;
    this.id = uid(10);

    this.insertSample = function(frame, command, image) {
        sample_obj.frame = frame;
        sample_obj.command = command;
        sample_obj.image = image;

        jsonfile.writeFile(self.path + 'sample-' + sample_obj.order + '.json', sample_obj, function (err) {
            if (err) {
                console.log(err);
            }
        });
    };

    callback();
};

module.exports = experiment;