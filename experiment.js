var settings = require('./settings');
var jsonfile = require('jsonfile');
var fs = require('fs');
var uid	= require('uid');

var experiment = function (callback) {
    var self = this;
    var date = new Date();
    this.order = 0;

    this.path = settings.experimentPaths 
    + 'experiment-'
    + date.getDate() + '-' 
    + date.getMonth() + '-'
    + date.getFullYear() + '-'
    + uid(10) + '/';

    if (!fs.existsSync(this.path)){
        fs.mkdirSync(this.path);
    }

    this.insertSample = function(obj) {
        jsonfile.writeFile(self.path + 'sample-' + obj.frame + '.json', obj, function (err) {
            if (err) {
                console.log(err);
            }
        });
    };

    callback();
};

module.exports = experiment;