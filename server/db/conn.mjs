import {MongoClient} from "mongodb";

const client = new MongoClient("mongodb://localhost:27017");

let conn;

try{
    console.log("connecting to local mongodb")
    conn = await client.connect();
    console.log("Connected successfully to mongoDB")
} catch (e) {
    console.error("Failed to connect to mongoDB", e);
    process.exit(1);
}

const db = conn.db('cca');

client.on("serverOpening", () => console.log('MongoDB server connection opened'));
client.on("serverClosed", () => console.log("MongoDB server connection closed"));
client.on("serverDescriptionChanged", (event) => console.log("Mongodb server description changed:", event));


export default db;