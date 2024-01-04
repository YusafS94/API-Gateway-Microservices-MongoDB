// remember to initialize the folder with npm init -y
        // npm i -g -D -S mongodb express axios nodemon
        //Connecting to the database 
        const {MongoClient, MongoDBCollectionNamespace} = require("mongodb")
        const uri = require("../util/mongodb.js")
        console.log(uri)

        const client = new MongoClient(uri)
        const dbname = "product"

        const connToDB = async() => {
            try {
                await client.connect();
                await client.db("admin").command({ ping: 1 });
                    console.log("Connected to the " + dbname + " database")
            } catch(err) {
                console.log("Error connecting to the database " + (err) )
                }
        }    

        const main = async () => {
            try {
                await connToDB()
            } catch (err) {
                console.error("Error during connection process" + err )
            } finally {
                await client.close()
            }
        }

        //run the main function

main()