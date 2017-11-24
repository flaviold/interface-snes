var os = require('os')

for (let i = 0; i < 10; i++) {
    console.log(os.cpus());
    console.log(os.totalmem());
    console.log(os.freemem())
}