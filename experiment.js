var settings = require('./settings');
var jsonfile = require('jsonfile');
var fs = require('fs');
var uid	= require('uid');

var experiment = function (callback) {
    var self = this;
    var date = new Date();
    var id = uid(10);
    this.order = 0;

    this.path = settings.experimentPaths 
    + 'experiment-'
    + date.getDate() + '-' 
    + date.getMonth() + '-'
    + date.getFullYear() + '-'
    + id + '/';

    console.log('Experiment::'+ id);

    this.insertSample = function(obj) {
        if (!fs.existsSync(self.path)){
            fs.mkdirSync(self.path);
        }
        jsonfile.writeFile(self.path + 'sample-' + obj.frame + '.json', obj, function (err) {
            if (err) {
                console.log(err);
            }
        });
    };

    callback();
};

module.exports = experiment;