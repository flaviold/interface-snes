const CouchDB = require('couch-db').CouchDB;
const couch = new CouchDB('http://localhost:5984');
couch.auth('snes', '123456')

var experiment = function (connection) {
    var self = this;
    this.db = couch.database('snesdb');
    
    var experiment_obj = { type: 'experimento' };
    experiment_obj.p1 = Math.floor(Math.random()*8);
    do {
        experiment_obj.p2 = Math.floor(Math.random()*8);
    } while (this.p2 == this.p1);
    experiment_obj.level = Math.floor(Math.random()*8);
    
    this.db.insert(experiment_obj, function (err, body) {
        if(err) {
            console.log('experiment insert failed ', err.message);
        }
        console.log(body.id);
        experiment_obj.id = body.id;
    });

    this.insertSample = function(command, image) {
        var sample_obj = { type: 'amostra' };
        sample_obj.id_experiment = experiment_obj.id;
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
        result_obj.id_experiment = experiment_obj.id;
        result_obj.result = result;
        self.db.insert(result_obj, function (err, body) {
            if(err) {
                console.log('experiment insert failed ', err.message);
            }
        });
    };
};

module.exports = experiment;
