var experiment = function (connection) {
    var self = this;
    
    this.p1 = Math.floor(Math.random()*8);
    do {
        this.p2 = Math.floor(Math.random()*8);
    } while (this.p2 == this.p1);
    this.level = Math.floor(Math.random()*8);
    
    connection.query('insert into experimentos (player1, player2, nivel) value (?, ?, ?);', [this.p1, this.p2, this.level], function (err, results, fields) {
        if (err) console.log('Erro criando experimento');
        self.id = results.insertId;
    });

    this.insertSample = function(command, image) {
        connection.query('insert into amostras (id_experimento, comando, imagem) value (?, ?, ?);', [self.id, command, image], function (err, results, fields) {
            if (err) console.log('Erro inserção');
        });
    };

    this.setExperimentAsFinished = function(result) {
	console.log('update experimentos set vencedor = '+ result +' where id = ' + self.id + ';');
        connection.query('update experimentos set vencedor = ? where id = ?;', [result, self.id], function (err, results, fields) {
            if (err) {
                console.log('Erro finalizando experimento');
            } else {
                console.log(results);
            }
        });
    };
};

module.exports = experiment;
