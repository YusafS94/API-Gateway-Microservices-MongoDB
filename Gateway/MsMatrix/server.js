// µs Matrix
const express = require("express")
const app = express()
//const PORT = 4001

app.use(express.json())

//auto registration on the gateway
const axios = require("axios")
const { Db } = require("mongodb")
// const db = require("mongoURI.js")
const PORT = 4001
const HOST = "localhost"
//const HOST = "http://localhost" before auto create the url


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


// HTTP methods
app.get("/product/:key", function (req, res) {
    let key = req.params.key

    Db.GET(key,
        function (err, value) {
            if (err) {
                console.log(err)
                res.status(500).send(err.message)
            } else if (!value) {
                res.sendStatus(404)
                console.log("There is no such product")
            } else res.json({ "value": value })
        })
})

// curl -i http://localhost:3000/product/10
// curl -i http://localhost:3000/product/reality/Quinze -o GET-Product.json

app.get("/product", (_req, res) => {
    Db.keys('*', function (err, keys) {
        if (err) {
            console.log(err)
            res.status(500).send(err.message)
            return
        }
        Db.mget(keys, function (err, value) {
            if(err) {
                console.log(err)
                res.status(500).send(err.message)
                return
            }
            var products = []
            for (i = 0; i < keys.length; i++) {
                products.push({ "key": keys[i], "vakue": value[i] })
            }
            console.log(products)
            res.json({products})
        })
    })
})

app.post("/product", function(req, res, err) {
    let key = req.body.key
    let value = req.body.value
    Db.SET(key, value,
        function (err, value) {
            if (err) {
                console.log(err)
                res.status(500).send(err.message)
            } else res.sendStatus(201)
        })
})
// Success response code here is 201 because a new resource was created.

// Patch works similar to post but for updating, and it requires sending all the keys and they must all be updated, therefore a success code for patch is 201.


// Testing
// -H = Headers (always required). -d = data. -o = output.
// curl -i -X POST http://localhost:3000/product -H "Content-Type:application/json" -d "{\"key\":\"Quinze\",\"value\": \"16\"}" -o POST-Product.json

app.put("/product/:key", function (req, res, reply) {
    let key = req.params.key
    let value = req.body.value

    Db.SET(key, value,
        function (err, value) {
            if (err) {
                console.log(err)
                res.status(500).send(err.message)
            } else res.sendStatus(200)
        })
})

// Success code must be 200 if updated successfully, and 201 if a new resource is created
// For Put you are not required to send all the keys, only the key(s) you want to update. Therefore since all the keys are not being changed (and therefore a new resource is not being created) then the error code for Put is 200.

app.delete("/product/:key", function (req, res) {
    let key = req.params.key

    Db.DEL(key,
        function (err, value) {
            if (err) {
                console.log(err)
                res.status(500).send(err.message)
            } else if (!value) {
                res.sendStatus(404)
                console.log("There is no such product")
            } else res.sendStatus(200)
        })
})

// Old listen function
// app.listen(PORT, () => {
//     console.log("The Matrix has started on ! " + PORT)
// })

app.listen(PORT, () => {
    // add to autoregister - maybe won't work on Docker
    axios({
        method: "POST",
        url: "http://localhost:3000/register",
        headers: { "Content-Type":"application.json" },
        data: {
            API_HU: "product",
            protocol: "http",
            host: HOST,
            port: PORT,
        }
    }).then((response) => {
        console.log(response.data)
        console.log("The Matrix has started on " + PORT)
    })
})
