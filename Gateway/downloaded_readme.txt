- Create the folder and prepare the environment
- type: npm init -y
- type: npm i -D nodemon (D for development package)
- Nodemon deals with the updates on the server.js file
- We need express to handle requests and server-side features
- We need axios to handle our HTTP requests
- type: npm i -D express axios
- create the file gateway.js (our main app)
- Enter the following code in gateway.js 
    const express = require ("express")
    const app = express ()

    const PORT = 3000

    app.use(express.json())

    app.listen(PORT, () => {
        console.log("CS Gateway running on port " + PORT)
} )

- To test you, type: node gateway.js
- Go to the package.json at the script line and insert
    "dev": "nodemon gateway.js" 
- To run and test, type on the terminal or command prompt: npm run dev (Be sure you're in the right folder)
- If the run is OK, you need to create the process for handling the 
requests (remember, an API deals with different entries)
- We then add the routes that lead us to services 
- Then we go to create the folder that will contain our services
- Create inside the folder \GATEWAY-CS the folder "routes"
- You should have now \\GATEWAY-CS\routes

- Inside the folder "routes" we create the entry point for our routes.
- We create the file index.js
- Inside \routes\index.js
- Enter the following code in index.js:
    const express = require("express")
    const router = express.Router()
    
    module.exports = router 

 
- It's important to export the file  (EXPORT - external information)

- Then, we can create the endpoint to use.
- type in the index.js
    const express = require("express")
    const router = express.Router()
    const axios = require ("axios")

    router.all("/:API_HU", (req, res) =>{
        console.log(req.params.API_HU)
           res.send(req.params.API_HU + "\n")
    })

module.exports = router 

- Where (line 5) router.all(":/API_HU", (req, res)) deals with all HTTP call methods.
- We create a variable named API, and with a callback ( =>{ }), we send some information.
- we log on to the console to be sure it works
- We send the information with res.send using params (PARAMS)

- Then we add these lines in the gateway.js
  const routes = require("./routes")
  app.use("/", routes)


- Then we test our gateway in the prompt using curl (you can use the browser as well ()
- You can pass any parameter. Let's test with AWP and HelloWorld
- curl http://localhost:3000/AWP
- curl http://localhost:3000/HelloWorld

- On the server side, we should see the parameter passing.
- On the client side, we receive the information sent back by the server.
 

//Lesson 2

- Create another folder to forward our request.
- You can call it APIAWP
- Initialize the folder and install the express
- The purpose is to have a service to forward our request.
- Create a server.js file and enter the following code:

    const express = require("express")
    const app = express()
    const PORT = 3001

    app.use(express.json())

    app.get("/book", (req, res, next) => {
        res.send("Hello GET from the API Books")
    })
    
    app.listen(PORT, () => {
        console.log("API Book Server has started on port " + PORT)
})

- we added a script section inside the package.json file inside the APIAWP folder:
    "start": "nodemon server.js"    


- run the server.js inside the APIAWP folder with: 
    npm run start 

- We need to add the new address to the index.js
    router.all("/:API_HU", (req, res) => {
       console.log(req.params.API_HU)
       res.send(req.params.API_HU + "\n")

- Let us make a curl request to it.
- curl http://localhost:3001/book

- Now, we can add a feature to APIAWP (folder) to respond to the entry passed by API-Gateway.
- We can close our server.js and come back to our routes/index.js
    const axios = require ("axios")

- then we modify the code on the index.js file for axios

    router.all("/:API_HU", (req, res) => {
        console.log(req.params.API_HU)
        axios.get("http://localhost:3001/book").then((response) => {
        res.send(response.data)
    })

- Let us make a curl request to it.
- curl http://localhost:3001/book

- We test both PORTS
- curl http://localhost:3000/book
- curl http://localhost:3001/book
- Now we have the response from 3000 (Gateway) and 3001(APIAWP ak api_inv)
- We now change the axios call to the name of the API on (index.js)
    router.all("/:API_HU", (req, res) => {
        console.log(req.params.API_HU)
        axios.get("http://localhost:3001/" + req.params.API_HU).then((response) => {
        res.send(response.data)
    })

- Test with curl with the following:
- Check if both the gateway and the server are running (best practice is to put nodemon) 
- curl http://localhost:3000/api_inv
- curl http://localhost:3001/api_inv
- To test another entry, let us go back to server.js on APIAWP

- copy the previous get(book) to create an instance of the microservice inside the server (book2) like this:
    app.get("/book2", (req, res) => {
        console.log(req.params)
        res.send("Hello GET from (book2) on API Books")
    })

- Test book2 with curl
- Remember to stop and start the server.js (or put on nodemon) on APIAWP (book)
- For testing - run both gateway and book and then curl http://localhost:3000/book2 or http://localhost:3001/book2.
- For now, we can make requests for the 3001 PORT (book) and the 3000 PORT (gateway).
- We can duplicate the server instance by copying the existing GET request of the microservice.


//Lesson 3 - Creating a Registry file

- We need to make the route forward more dynamic.
- We store our configuration in a file, database, or memory. For the moment, we'll use the file. 
- We go to our routes folder and create another file called registry.json.
- We now add the following code on registry.json.
    {
        "Services": {
            "books" :{
                "API_HU" : "book",
                "host": "http://localhost",
                "port": "3001",
                "url": "http://localhost:3001/"
            }
        }
    }

- When we specify the API name as books, all connections must pass through it now. 
- Then our request with curl also changes because we need to put books/path.
- Then we go to the /routes/index.js and import our created registry.
    const registry = require("./registry.json")

- We now need to replace the axios.get entry to use the registry. 
- Then, we use the file registry, request the PARAMS from the API_HU, and pass the URL and path. 
- We also added the path to the API name (API_HU). router.all("/:API_HU/:path"):

    router.all("/:API_HU/:path", (req, res) =>{
        console.log(req.params.API_HU)
        axios.get(registry.services[req.params.API_HU].url + req.params.path).then ((response) => {
            res.send(response.data)
        })
    })

- To test this change, we use curl calling at the gateway file.
- curl http://localhost:3001/book2 that doesn't pass by the Gateway.
- Now we can redirect our request passing by the Gateway.
- curl http://localhost:3000/books/book
- curl http://localhost:3000/books/book2


- If you try to request the inventory resource directly on the 3001 port, it doesn't work. Like this:
- curl http://localhost:3001/books/book

- We need to create a condition if the gateway doesn't exist.

    router.all("/:API_HU/:path", (req, res) =>{
        console.log(req.params.API_HU)
        if (registry.services[req.params.API_HU]) {
            axios.get(registry.services[req.params.API_HU].url + req.params.path).then ((response) => {
                res.send(response.data)
            })
        } else {
            res.send("API doesn't exist!")
        }
    })

- We test with the wrong address
- curl http://localhost:3000/api_gtway/book
- curl http://localhost:3000/api_prod/book2
- curl http://localhost:3000/123/book

// Lesson 4 - Fixing problems and more makes more dynamic

- For the moment, our axios method only accepts Get requests.
- We need to adapt for any HTTP method.
- Let us test the failure point 
- We go on the server.js and copy the existing get method, then change the get method in the book for the post. 
    app.post("/book", (req, res) => {
        console.log(req.params)
        res.send("Hello GET from the API Books")
    })


- Then we test with curl -i -X POST http://localhost:3000/books/book
- Let us change and fix our axios by modifying the request and forwarding everything.

router.all("/:API_HU/:path", (req, res) =>{
    console.log(req.params.API_HU)
    if (registry.services[req.params.API_HU]) {
        axios({
            method: req.method,
            url: registry.services[req.params.API_HU].url + req.params.path,
            headers: req.headers,
            data: req.body
        }).then((response) => {
            res.send(response.data)
        })
    } else {
        res.send("API doesn't exist!")
    }
})

- Then we try again.
- If you got an error "Invoke-WebRequest", you're facing a Cmdlet error. (thanks to StackOverflow Invoque-WebRequest)
- To fix it, go to the prompt and type Remove-item alias:curl. Then you can try again the post method.

- Now, we need to add new APIs to our gateway.
- We need to add a registry method on the index.js file to allow the API to call and register themselves.
- Let us create a new endpoint on the index.js file:

    router.post("/register", (req, res) => {
        const regInfo = req.body

        registry.services[regInfo.API_HU] = { ... regInfo}

        fysy.writeFile("./routes/registry.json", JSON.stringify(registry), (error) => {
            if (error) {
                res.send("Not registered" + regInfo.API_HU + "\n" + error)
            } else res.send("Sucessfully registered :" + regInfo.API_HU + " ")
        })

    })

- we need to go to the routes folder and install (using npm) and import (using require) the file system module (fs) on the top of the index.js. The fsys variable receives the fs module. 
 
     const fysy = require("fs")

- It's necessary to get the configuration information from the registry.json file.
- Also, we need to pass the registry as an object.
- On the line with ... it brings all the different keys inside the registry.json and puts them inside our object.
- Then, we need to create a new entry only for news addresses.
- curl -i -X POST http://localhost:3000/register -H "Content-Type: application/json" -d "{\"API_HU\": \"book_hud\",\"host\": \"http://localhost\",\"port\": \"3001\",\"url\": \"http://localhost:3001/\"}"


- If you're facing issues to run (such as 500 or 400), you need to start a CMD terminal and run curl
- Then, we need to test the calls to our new address

- curl http://localhost:3000/book_hud/book
- curl http://localhost:3000/book_awp/book
- curl -i -X POST http://localhost:3000/book_hud/book
- curl -i -X POST http://localhost:3000/book_awp/book

- In the sequence, we can make our registration process more dynamic.

- We must add Axios (previous knowledge) to our APIAWP folder and declare and import to the server.js file.
    const axios = require("axios")

- Now we modify the listen.port entry for this:
    app.listen(PORT, () => {
        axios({
            method: "POST",
            url: "http://localhost:3000/register",
            headers : {"Content-Type" : "application/json"},
            data: {
                API_HU: "book_hud",
                host: "http://localhost",
                port: "3001",
                url: "http://localhost:3001/"
            }
        }).then((response) => {
            console.log(response.data)
        })
            console.log("API Book Server has started on port " + PORT)
        
    })

- We grab the information about the server on the registry, and then we can delete the server information, letting only the gateway (services)
- Then you restart the server.js, and the message of auto-registration should appear. If yes, you can move forward and change the HOST, PORT, and URL by constants.

- Finally, change the port number to 3002 and save the file. You now have the api_prod on 3002, which is automatically added to your registry.json.