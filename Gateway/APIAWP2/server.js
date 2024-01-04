// set express variable so we can use Express. Make sure to use brackets
const express = require("express")
const axios = require("axios")
const app = express()
// Define port. For this server it will be 3001 because 3000 is already taken by the gateway
const PORT = 3002

const HOST = "localhost"

// Set app to use express json function
app.use(express.json())

// Set the routing for the GET request for this server
app.get("/book", (req, res, next) => {
    res.send("Hello GET request from the Books API 2")
})

// Set a "listen" function for the app to listen to the port and send a console log
/*
app.listen(PORT, () => {
    console.log("API Book Server has started on port " + PORT)
})
*/

// POST needed
app.post("/book", (req, res, next) => {
    res.send("Hello POST from Book Server!")
})


//  Dynamic app listen registation needed

app.listen(PORT, () => {
    // Adding functionality for authorization here
    const authString = "ys:password"
    const encodeAuthString = Buffer.from(authString, "utf8").toString("base64")
    console.log(encodeAuthString)
    axios({
        method: "POST",
        url: "http://localhost:3000/register",
        headers: {"Content-Type" : "application/json"},
        data: {
            API_HU: "books",
            host: HOST,
            port: PORT,
            // protocol: "http",
            // url: HOST + ":" + PORT + "/"
        }
    }).then((response) => {
        console.log(response.data)
    })
    console.log("API Book Server has started on port " + PORT)
})



