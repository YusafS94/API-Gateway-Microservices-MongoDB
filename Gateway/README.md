//Lesson 6 - Removing instances

- To remove instances from the registry file, we must create another endpoint called /unregister.

    router.post("/unregister", (req, res) => {
        const reginfo = req.body
    if(APIExists(reginfo)) {
            const index = registry.services[reginfo.API_HU].findIndex((instance) => {
                return reginfo.url === instance.url
            })
            registry.services[reginfo.API_HU].splice(index, 1)
            fsys.writeFile("./routes/registry.json", JSON.stringify(registry), (error) => {
                if (error){
                    res.send("Not possible unregister " + reginfo.API_HU + "\n" + error)
                } else res.send("Sucessfully unregistered : " + reginfo.API_HU + " ")
            })
    } else{
        res.send("Config doesn't exists for ' " + reginfo.API_HU + " at ' " + reginfo.url + "' " )
    } 


- Explanations:
- We need to create the object containing the keys from the registry.json file and compare if the retrieved key matches the one we want to remove. 
- We make use of the APIExists function to check the file registry.json. Since we're using a vector (for instance), we use the findIndex function and compare it with the URL we're looking for. 
- To remove an item from a vector, we use the splice method and specify how many instances we want to remove from that point. For example, we have one instance and need to create another 20 instances to receive our requests (scalability principle). However, when those instances become idles, we remove them using (index, 20). Therefore, we come back for our 1 initial instance.
- We use the same structure from the fysys register, changing the answers. 
- For testing, we need to shut down the servers and run from a CMD terminal. Please first check the name of your route on the API_HU variable, then:

curl -i -X POST http://localhost:3000/unregister -H "Content-Type: application/json" -d "{\"API_HU\": \"cht2023\",\"url\": \"http://localhost:3002/\"}"

//WORKING CURL REQUEST FOR MY CODE TO UNREGISTER A SERVICE INSTANCE. NEEDS TO BE RAN ON CMD PROMPT NOT NODE CLI. SELECT COMMAND PROMPT IN VSCODE TERMINAL OPTIONS. API_HU VALUE MUST MATCH MY SERVICE NAME. IN THIS CASE IT'S "BOOKS"
curl -i -X POST http://localhost:3000/unregister -H "Content-Type: application/json" -d "{\"API_HU\": \"books\",\"url\": \"http://localhost:3004/\"}"

// Const HOST in server.js had http:// before the localhost which was adding http:// to the url in the request body when registering a new instance. Causing the url to become like this: http://http://localhost. Solved by removing the http:// from the HOST variable in server.js and only having it as "localhost".

- If you run twice, you can check the correct answer when we don't find the requested URL.

//Lesson 7 - adding security 

//Adding Helmet middleware to the gateway to protect the servers

- Instal HELMET (middleware) package inside the main folder. 
- Go to the prompt and access the main folder of the API Gateway and type: npm i -D -S helmet
- Go to the gateway.js file and import (const security = require("helmet")). Then, after the app.use(express), add app.use(helmet()). Like this:

    const helmet = require("helmet")
    app.use(helmet())

// Lesson 8  - Load Balancing
// making curl requests to test the service load balancer:
curl http://localhost:3000/books/hello
response should alternate port number on subsequent curl requests, hence "balancing" the requests between two ports

// Lesson 9 - fixing some issues

- We need to add the instances referred to on registry.json in the index.js file. 
- You need to search by the word "services", and  add the word "instances" in the following endpoints: 
    
    router.post("/register)

    Search the the line "registry.services", then replace with this one: 

    registry.services[regInfo.API_HU].instances.push({ ...regInfo})

- Same procedure on router.post("/unregister)

    const index = registry.services[regInfo.API_HU].instances.findIndex

    registry.services[regInfo.API_HU].instances.splice(index, 1)

- Same procedure on APIExists function

    registry.services[regInfo.API_HU].instances.forEach(instance => {

// Lesson 10 - Enabling/Disabling the instances

- We must be able to enable/disable a given instance for any reason. 
- For that, we need to create another endpoint before the router.all endpoint. 

    router.post("/enable/:API_HU", (req, res) => {
        const API = req.params.API_HU
        const requestBody = req.body
        const instances = registry.services[API].instances
        const index = instances.findIndex((srv) => { return srv.url === requestBody.url })
        if(index == -1){
            res.send({ status: "error", message: "Could not find '" + requestBody.url + "' for service '" + API + "'"})
        } else {
            instances[index].enabled = requestBody.enabled
            fsys.writeFile("./routes/registry.json", JSON.stringify(registry), (error) => {
                if (error) {
                    res.send("Could not enable/disable '" + requestBody.url + "' for service '" + API + ":'\n" + error)
                } else {
                    res.send("Successfully enabled/disabled '" + requestBody.url + "' for service '" + API + "'\n")
                }
            })
        }
    })

- Then we need to modify the loadbalancer.js file and create the function. 

    const loadbalancer = {}

    loadbalancer.ROUND_ROBIN = (service) => {
        const newIndex = ++service.index >= service.instances.length ? 0 : service.index
        service.index = newIndex
        return loadbalancer.isEnabled(service, newIndex, loadbalancer.ROUND_ROBIN)
    }

    loadbalancer.isEnabled = (service, index, loadBalanceStrategy) => {
        return service.instances[index].enabled ? index : loadBalanceStrategy(service)
    }
    module.exports = loadbalancer

- Finally, we need to test using a POST request. Therefore, remember to open a CMD (on Windows), or BASH (on Mac) and make the following POST request.
- First, we need to disable the 3002 PORT and then enable the 3001 PORT. 

    curl -i -X POST http://localhost:3000/enable/books -H "Content-Type: application/json" -d "{\"url\": \"http://localhost:3002/\", \"enabled\": false}"

    curl -i -X POST http://localhost:3000/enable/books -H "Content-Type: application/json" -d "{\"url\": \"http://localhost:3001/\", \"enabled\": true}"

    <!-- Skip 10 and 11 not needed in assignment -->

    // Lesson 12 - Mongo database setup

    - To create a Mongo database, you need first run tutorials 1, 2, and 4 on the provided link on BS. 
    - You'll have two identifiers. The first one is to create your account on MongoDB (ATLAS). For this, you can connect using your Google account. Then the second one is your database account, which we need to connect to Mongo and perform our requests.
    - When you have created your account you need to create a database which you can name it like awp2324 for example.
    - Your username and password on the database are the keys we need to add to our code. 
    - Once you have retrieved your user and password on the database, you go to the util folder and create a file called mongodb.js
    - In this file, you put the following code:


module.exports = uri = "mongodb+srv://<username>:<password>@awp2324.gk53bul.mongodb.net/?retryWrites=true&w=majority"

    - Pay attention to one point. On the string above, where we have <username>:<password>, you need to replace it for your credentials on Mongo to appear in something like this: 


module.exports = uri = "mongodb+srv://test:test@awp2324.gk53bul.mongodb.net/?retryWrites=true&w=majority"

    - Then you go to your GATEWAY-CS folder (our main folder), and create another sub-folder. I called mine MsMatrix, but you can choose the name you want.
    - Inside the MsMatrix folder, you need to initialize it using: 
    
npm init -y

    - Then install Mongodb, axios, express and nodemon like this:

npm i -g -D -S mongodb express axios nodemon

    - After that check if all packages are present on the package.json file.
    - Then, inside the MsMatrix folder, you create a file named mongoURI.js and add the following code:

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
        

    - Then we need to create another file inside the MsMatrix folder that contains our requests. Let us call it a server.js file, and you add the following code. 


        // µs Matrix
        const express = require("express")
        const app = express()
        //const PORT = 4001

        app.use(express.json())

        //auto registration on the gateway
        const axios = require("axios")
        const PORT = 4001
        const HOST = "localhost"
        //const HOST = "http://localhost" before auto create the url


        // MongoDB
        const db = require("./mongoURI.js")  


// Lesson 13 - adjusting the code for database 

    - We need to adjust our original files. However, the better approach is rename the original files and create new ones. 

    - The gateway.js rename to gateway-auth.js and let your gateway.js with the following code:

        const express = require ("express")
        const app = express ()
        const PORT = 3000
        const helmet = require ("helmet")
        const routes = require("./routes")

        app.use(helmet())
        app.use(express.json())
        app.use("/", routes)

        app.listen(PORT, () => {
            console.log("CS Gateway running on port " + PORT)
        } )

    - The registry.json rename to registry-instances.json, and let your registry.json with the following code:

    {
        "services": {
            "books": {
                "API_HU": "books",
                "host": "localhost",
                "port": 3001,
                "url": "http://localhost:3001/"
            },
            "product": {
                "API_HU": "product",
                "protocol": "http",
                "host": "localhost",
                "port": 4001,
                "url": "http://localhost:4001/"
            }
        }
    }

    - Then to complete the server.js file with the following code:

            
        app.use(function (_req, _res, next) {
            let ts = Date.now()
            let date_ob = new Date(ts)
            let date = date_ob.getDate()
            let month = date_ob.getMonth() + 1
            let year = date_ob.getFullYear()
            let hours = date_ob.getHours()
            let minutes = date_ob.getMinutes()
            let seconds = date_ob.getSeconds()
            console.log(year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds)
            next()
        })

        app.get("/reality", (req, res) => {
        console.log(req.params)
            res.send("Welcome and GET the desert of the real")
        })
        //curl -i http://localhost:3000/product/reality > GETtest.json

        app.post("/reality", (req, res) => {
            console.log(req.params)
            res.send("Welcome and POST on the desert of the real")
        })

        //curl -i -X POST http://localhost:3000/product/reality > POSTtest.json

        app.listen(PORT, () => {
                console.log("The Matrix has started on ! " + PORT)
            })
        })

    - The index.js rename to index-instances.json, and let your index.js with the following code: 

        const express = require("express")
        const router = express.Router()
        const axios = require ("axios")
        const registry = require("./registry.json")
        const fsys = require("fs")
        const loadbalancer = require("../util/loadbalancer")

        router.all("/:API_HU/:path", (req, res) =>{
            console.log(req.params.API_HU)
            const service = registry.services[req.params.API_HU]
        
            if(service) {
                axios({
                    method: req.method,
                    url: service.url + req.params.path,
                    headers: req.headers,
                    data: req.body
                }).then((response) => {
                    res.send(response.data)
                }).catch(error => {
                    res.send(" ")
                })
            } else {
                res.send("API Gateway doesn't exist!")
            }
        })

        //Register for instances
        router.post("/register", (req, res) => {
            const regInfo = req.body
                registry.services[regInfo.API_HU] = { ...regInfo}
                
                    fsys.writeFile("./routes/registry.json", JSON.stringify(registry), (error) => {
                        if (error){
                            res.send("Not registered " + regInfo.API_HU + "\n" + error)
                        } else res.send("Sucessfully registered : " + regInfo.API_HU + " ")
                    })
                })
            //})

        
        // the unregister endpoint to unregister for instances
        router.post("/unregister", (req, res) => {
            const regInfo = req.body

            if(APIExists (regInfo)) {
                const index = registry.services[regInfo.API_HU].findIndex((instance) => {
                    return regInfo.url === instance.url
                })
                registry.services[regInfo.API_HU].splice(index, 1)

                fysy.writeFile("./routes/registry.json", JSON.stringify(registry), (error) => {
                    if (error) {
                        res.send("Not possible unregister" + regInfo.API_HU + "\n" + error)
                    } else res.send("Sucessfully unregistered :" + regInfo.API_HU + " ")
                })
                } else {
                    res.send("Config doesn't exists for " + regInfo.API_HU + " at " + regInfo.url +  " ")
                }
            }
        )

        // Function for instances
        //creating the APIExists function
        const APIExists = (regInfo) => {
            let exists = false
            registry.services[regInfo.API_HU].forEach(instance => {
                if(instance.url === regInfo.url) {
                    exists = true
                    return
                }
                
            })
            return exists
        }


        module.exports = router 