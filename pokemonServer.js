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
app.use(express.static(__dirname + '/templates'));
app.use(bodyParser.urlencoded({extended:false}));

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

async function getData(endpoint) {
   try {
      let res = await fetch(endpoint);
      // console.log(res);
      let data = await res.json();
      // console.log(data);
      console.log(data.name);
   } catch(error) {
      console.log(error);
   }
}

// async function addApplication(name) {
//    const databaseName = process.env.MONGO_DB_NAME;
//    const collectionName = process.env.MONGO_COLLECTION;
//    const uri = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.p9pyx5z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
//    const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

//    let url = "https://pokeapi.co/api/v2";
//    let query = "/pokemon";
//    let newName = "/" + name;
//    let endpoint = url + query + newName;
//    try {
//       await client.connect();
//       const database = client.db(databaseName);
//       const collection = database.collection(collectionName);
//       let res = await fetch(endpoint);
//       let data = await res.json();
//       const application = { name: data.name, height: parseFloat(data.height), weight: parseFloat(data.weight)};
//       let result = await collection.insertOne(application);
//    } catch (e) {
//       console.error(e);
//    } finally {
//       await client.close();
//    }
// }



async function addApplication(name) {
   const databaseName = process.env.MONGO_DB_NAME;
   const collectionName = process.env.MONGO_COLLECTION;
   const uri = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.p9pyx5z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
   const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

   console.log("hi");
   let url = "https://pokeapi.co/api/v2";
   let query = "/pokemon";
   let newName = "/" + name;
   let endpoint = url + query + newName;
   console.log(endpoint)
   try {
      await client.connect();
      const database = client.db(databaseName);
      const collection = database.collection(collectionName);
      let res = await fetch(endpoint);
      let data = await res.json();
      console.log()
      const application = { name: data.name, height: parseFloat(data.height), weight: parseFloat(data.weight)};
      console.log(application);
      let result = await collection.insertOne(application);
   } catch (e) {
      console.error(e);
   } finally {
      await client.close();
   }
}

app.get("/", (request, response) => {  
   response.render("index");
  });


app.get("/teamCreator", (request, response) => {  
    const variables = {portNumber: portNumber, teamTable: "hello!"};
    response.render("teamCreator", variables);
});

app.post("/teamCreator", (request, response) => {
   const {name} = request.body;
   addApplication(name);
   // const variables = {portNumber: portNumber, teamTable: "hello!"};
   // response.render("teamCreator", variables);
})
   