const express = require("express");
const app = express();
const path = require("path");
let portNumber = 0;
const bodyParser = require('body-parser');

require("dotenv").config({
   path: path.resolve(__dirname, "./.env"),
});
const { MongoClient, ServerApiVersion } = require("mongodb");

if (process.argv.length != 3) {
    process.stdout.write("Usage pokemonServer.js PORT_NUMBER");
    process.exit(1);
}

portNumber = process.argv[2];


app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));
app.use(bodyParser.urlencoded({extended:false}));

app.get("/", (request, response) => {  
    response.render("index");
  });

app.listen(portNumber);

process.stdout.write(`Web server started and running at http://localhost:${portNumber}\n`);
process.stdout.write("Stop to shutdown the server: ");
process.stdin.setEncoding("utf8"); 
process.stdin.on('readable', () => {  
	const dataInput = process.stdin.read();
	if (dataInput !== null) {
		const command = dataInput.trim();
		if (command === "stop") {
			process.stdout.write("Shutting down the server"); 
            process.exit(0);  
        } else {
			process.stdout.write(`Invalid command: ${command}\n`);
		}
        process.stdin.resume(); 
        process.stdout.write("Stop to shutdown the server: ");
    }
});

