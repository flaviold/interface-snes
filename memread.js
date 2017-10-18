var path = require('./settings').experimentPaths;
var jsonfile = require('jsonfile');

jsonfile.readFile(path + 'memory/teste1699.json', function(err, obj) {
    console.log(obj.RAM[0x0D12])
})