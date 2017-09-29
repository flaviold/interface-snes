var pathBase = require('./settings').experimentPaths;
var fs = require('fs');
var jsonfile = require('jsonfile');
var uid	= require('uid');

var experiment = function (p1, p2, lvl, callback) {
    var self = this;
    this.order = 0;
    this.id = uid(10);
    var data = new Date()
    this.path = pathBase 
        + 'experiment-'
        + data.getDate() + '-' 
        + data.getMonth() + '-'
        + data.getFullYear() + '-'
        + this.id + '/';

    if (!fs.existsSync(this.path)){
        fs.mkdirSync(this.path);
    }
    
    this.experiment_obj = { type: 'experimento' };
    this.experiment_obj.p1 = p1;
    this.experiment_obj.p2 = p2;
    while (this.experiment_obj.p2 == this.experiment_obj.p1) {
        this.experiment_obj.p2 = Math.floor(Math.random()*8);
    }
    this.experiment_obj.level = lvl;
    
    jsonfile.writeFile(this.path + 'header.json', this.experiment_obj, function (err) {
        if (err) {
            console.log(err);
        }
    });

    this.insertSample = function(command, image) {
        var sample_obj = { type: 'amostra' };
        sample_obj.order = self.order++;
        sample_obj.id_experiment = self.experiment_obj.id;
        sample_obj.command = command;
        sample_obj.image = image;
        
        jsonfile.writeFile(self.path + 'sample-' + sample_obj.order + '.json', sample_obj, function (err) {
            if (err) {
                console.log(err);
            }
        });
    };

    this.setExperimentAsFinished = function(result) {
        var result_obj = { type: 'resultado' };
        result_obj.id_experiment = self.experiment_obj.id;
        result_obj.result = result;
        jsonfile.writeFile(self.path + 'header.json', result_obj, { flag: 'a'}, function (err) {
            if(err) {
                console.log(err);
            }
        });
    };

    callback();
};

module.exports = experiment;