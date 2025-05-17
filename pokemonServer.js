const express = require("express");
const app = express();
const path = require("path");
let portNumber = 0;
const bodyParser = require('body-parser');
let pokemon_names = ""

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
process.stdout.write(`Web server started and running at http://localhost:${portNumber}/pokemonServer\n`);
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
      const application = { name: data.name, height: parseFloat(data.height), weight: parseFloat(data.weight), type: data.types[0].type.name, sprite :data.sprites.front_default};
      console.log(application);
      let result = await collection.insertOne(application);
      return data
   } catch (e) {
      console.error(e);
   } finally {
      await client.close();
   }
}

function capitalize(str){
   return str.charAt(0).toUpperCase() + str.slice(1);
}

async function removeApplications() {
   const databaseName = process.env.MONGO_DB_NAME;
   const collectionName = process.env.MONGO_COLLECTION;
   const uri = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.p9pyx5z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
   const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
   let numDeleted = 0;
        try {
           await client.connect();
           const database = client.db(databaseName);
           const collection = database.collection(collectionName);
           const filter = {};
           const result = await collection.deleteMany(filter);
        } catch (e) {
           console.error(e);
        } finally {
           await client.close();
        }
}

// app.get("/", (request, response) => {  
//    response.render("index");
//   });

const server = require("./server");


app.use("/pokemonServer", server);


app.get("/teamCreator", (request, response) => {  
    const variables = {portNumber: portNumber, teamTable: "", invalidMessage: ""};
    response.render("teamCreator", variables);
});

app.post("/teamCreator", async (request, response) => {
   const {name} = request.body;
   let data = await addApplication(name);
   if (data == undefined) {
      let invalidMessage = "Pokemon Doesn't Exist: Please Double Check the Spelling or Choose a Different Pokemon";
      const variables = {portNumber: portNumber, teamTable: pokemon_names, invalidMessage: invalidMessage};
      response.render("teamCreator", variables);
   }
   else {
   pokemon_names += `<figure class="inline-figure"><img src="${data.sprites.front_default}"><figcaption>${capitalize(data.name)}</figcaption></figure>`;
   console.log(pokemon_names);
   const variables = {portNumber: portNumber, invalidMessage: "", teamTable: pokemon_names};
   response.render("teamCreator", variables);
   }
})
   

app.post("/teamCreatorRemove", (request, response) => {
   removeApplications();
   pokemon_names = "";
   const variables = {portNumber: portNumber, invalidMessage: "Pokemon Succesfully Removed", teamTable: pokemon_names};
   response.render("teamCreator", variables);
})


app.get("/getTeam", (request, response) => {
   console.log("hello")
    response.render("getTeam", {portNumber: portNumber});
});

app.get("/displayType", async (req, res) => {
   console.log("here")
   const type = (req.query.type);
   let pokemons=""
   console.log("Type:", type);
   const uri = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.p9pyx5z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
   const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
   const db = client.db(process.env.MONGO_DB_NAME);
   const collection = db.collection(process.env.MONGO_COLLECTION);
   try {
     
     await client.connect();
     const allEntries = await collection
       .find({})
       .toArray();
 
     const filtered = allEntries.filter(entry => {
       if (type == "anything") {
         return true;
       }
       const currType = entry.type;
       return currType == type;
     });
   console.log(filtered)
   filtered.forEach(data =>
      pokemons += `<figure class="inline-figure"><img src="${data.sprite}"><figcaption>${capitalize(data.name)}</figcaption></figure>`);

   console.log(pokemons);
 
   res.render("typeResults", { pokemons: pokemons, portNumber: portNumber});
 
   } catch (err) {
     console.error("Error retrieving", err);
     res.status(500).send("Error filtering");
   } finally {
     await client.close();
   }
 });
