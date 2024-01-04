// We are setting up the API gateway here

// Import express and put it in an app variable
const express = require ("express")
const app = express()

// Adding security
const helmet = require("helmet")

// Importing info from registry
const registry = require('./routes/registry.json')

// Port for the gateway needs defining
const PORT = 3000

// Define routes constant, point to routes folder
const routes = require("./routes")

// Setting encryption/security information
const auth = (req, res, next) => {
    // console.log("Headers:" + req.headers)
    const url = req.protocol + "://" + req.hostname + PORT + req.path;
    const authorization = req.headers.authorization.split(" ")[1];
    // const authString = Buffer.from(req.headers.authorization, "base64").toString("utf8")
    const authString = Buffer.from(authorization, "base64").toString("utf8");
    const authParts = authString.split(":")
    const username = authParts[0]
    const password = authParts[1]
    console.log(username + " | " + password)
    const user = registry.auth.users["username"]
    if(user) {
        if(user.username === username && user.password === password) {
            next()
        } else {
            res.send({
                authenticated: false,
                path: url,
                message: "Authentication unsuccessful: Wrong password. "
            })
        }
    } else {
        res.send({
            authenticated: false,
            path: url,
            message: "Authentication unsuccessful: User " + username + " doesn't exist."
        })
    }
}









// Using the auth we defined
app.use(auth)

// Here we are saying to use the Express library to make our requests
app.use(express.json())

// Tell app to use routes variable
app.use("/", routes)
// Add helmet
app.use(helmet())

// Setting up the app to listen to a certain port using a callback function
app.listen(PORT, () => {
    // Print status. Important for debugging and checking status
    console.log("Gateway running on port " + PORT)
})


