var experiment = function (connection) {
    var self = this;
    
    this.p1 = Math.floor(Math.random()*8);
    do {
        this.p2 = Math.floor(Math.random()*8);
    } while (this.p2 == this.p1);
    this.level = Math.floor(Math.random()*8);
    
    connection.query('insert into experimentos (player1, player2, nivel) value (?, ?, ?);', [this.p1, this.p2, this.level], function (err, results, fields) {
        if (err) console.log(err);
        self.id = results.insertId;
    });

    this.insertSample = function(command, image) {
        connection.query('insert into amostras (id_experimento, comando, imagem) value (?, ?, ?);', [self.id, command, image], function (err, results, fields) {
            if (err) console.log(err);
        });
    };

    this.setExperimentAsFinished = function(result) {
        connection.query('update experimentos set ganhador = ?,  where id_experimento = ?;', [result, self.id], function (err, results, fields) {
            if (err) console.log(err);
            console.log(results);
        });
    };
};

module.exports = experiment;