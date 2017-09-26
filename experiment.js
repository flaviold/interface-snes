const CouchDB = require('couch-db').CouchDB;
const couch = new CouchDB('http://localhost:5984');
couch.auth('snes', '123456')

var experiment = function (callback) {
    var self = this;
    this.db = couch.database('snesdb');
    this.order = 0;
    
    this.experiment_obj = { type: 'experimento' };
    this.experiment_obj.p1 = Math.floor(Math.random()*8);
    do {
        this.experiment_obj.p2 = Math.floor(Math.random()*8);
    } while (this.experiment_obj.p2 == this.experiment_obj.p1);
    this.experiment_obj.level = Math.floor(Math.random()*8);
    
    this.db.insert(this.experiment_obj, function (err, body) {
        if(err) {
            console.log('experiment insert failed ', err.message);
        }
        console.log(body.id);
        self.experiment_obj.id = body.id;
    });

    this.insertSample = function(command, image) {
        var sample_obj = { type: 'amostra' };
        sample_obj.order = self.order++;
        sample_obj.id_experiment = self.experiment_obj.id;
        sample_obj.command = command;
        sample_obj.image = image;
        
        self.db.insert(sample_obj, function (err, body) {
            if(err) {
                console.log('experiment insert failed ', err.message);
            }
        });
    };

    this.setExperimentAsFinished = function(result) {
        var result_obj = { type: 'resultado' };
        result_obj.id_experiment = self.experiment_obj.id;
        result_obj.result = result;
        self.db.insert(result_obj, function (err, body) {
            if(err) {
                console.log('experiment insert failed ', err.message);
            }
        });
    };

    callback();
};

module.exports = experiment;
