const express = require("express")

// define a router variable using the Route() function of express
const router = express.Router()

// Import Axios
const axios = require("axios")

// Import file directory
const fsys = require("fs")

// Add registry
const registry = require("./registry.json")

// Add load balancer
const loadBalancer = require("../util/loadBalancer")

// Enabling enabling/disabling functionality before letting router handle the routes
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



// Now we need to set up the router to handle all routes
router.all("/:API_HU/:path", (req, res) => {
    // console.log(req.params.API_HU)

    // Writing routing for load balancer
    const service = registry.services[req.params.API_HU]
    if(service) {
        if(!service.loadBalanceStrategy) {
            service.loadBalanceStrategy = "ROUND_ROBIN"
            fsys.writeFile("./routes/registry.json", JSON.stringify(registry), (error) => {
                if(error) {
                    res.send("Couldn't write load balance strategy" + error)
                }
            })
        }

        const newIndex = loadBalancer[service.loadBalanceStrategy](service)
        const url = service.instances[newIndex].url
            
        console.log(url)


    // if (registry.services[req.params.API_HU]) {
        axios({
            method: req.method,
            url: /* registry.services[req.params.API_HU].url + req.params.path */ url + req.params.path,
            headers: req.headers,
            data: req.body
        }).then((response) => {
            res.send(response.data)
        }).catch(error => {
            res.send("")
        })
    } else {
        res.send("The API Gateway doesn't exists")
    }
})

// Dynamic registration of new services
router.post("/register", (req, res) => {
    // Receiving app.listen axios request and putting it into a reginfo variable
    const reginfo = req.body

    // Setting the url variable in the request to be a predefined value consisting of http protocol and url (host and port variables) making the process automatic rather than hard coded
    reginfo.url = req.protocol + "://" + reginfo.host + ":" + reginfo.port + "/"

    if (APIExists(reginfo)) {
        //return exists
        res.send("Config exists for ' " + reginfo.API_HU + " at '" + reginfo.url + "' ")
    } else {
        // const serverURL = `${reginfo.host}:${reginfo.port}/`

        // Adding all the object data in the reginfo as an object in the registry file in the services object. registry.services drills down into the registry file and finds services and adds reginfo as an object, creating a new service in the registry file.
        // ""..."" is JS ES6 all object data spread operator

        // Need to add push now because books is now an array
        registry.services[reginfo.API_HU].instances.push({ ...reginfo })

        fsys.writeFile("./routes/registry.json", JSON.stringify(registry), (error) => {
            if (error) {
                res.send("Not registered " + reginfo.API_HU + "\n" + error)
            } else res.send("Successfully registered : " + reginfo.API_HU + " ")
        })
    }


})

// Creating the function to check API names
const APIExists = (reginfo) => {
    let exists = false
    registry.services[reginfo.API_HU].instances.forEach(instance => {
        if (instance.url === reginfo.url) {
            exists = true
            return
        }
    });
    return exists
}

/*
// Creating an unregister endpoint to remove registry entries

router.post("/unregister"), (req, res) => {
   reginfo.url = req.protocol + "://" + reginfo.host + ":" + reginfo.port + "/"
   const index = registry.services[reginfo.API_HUI].findIndex((instance) => {
       return reginfo.url === instance.url
   })
   registry.services[reginfo.API_HU].splice(index, 1)
   fsys.writeFile("./routes/registry.json", JSON.stringify(registry), (error) => {
       if (error){
           res.send("Not possible to unregister " + reginfo.API_HU + "\n" + error)
       } else res.send("Sucessfully unregistered : " + reginfo.API_HU + " ")
   })
   res.send("Config exists for ' " + reginfo.API_HU + " at '" + reginfo.url + "' ")
   }
*/

// Unregister endpoint
router.post("/unregister", (req, res) => {
    const reginfo = req.body
    
    if (APIExists(reginfo)) {
        const index = registry.services[reginfo.API_HU].findIndex((instance) => {
            return reginfo.url === instance.url
        })
        registry.services[reginfo.API_HU].splice(index, 1)
        fsys.writeFile("./routes/registry.json", JSON.stringify(registry), (error) => {
            if (error) {
                res.send("Not possible unregister " + reginfo.API_HU + "\n" + error)
            } else res.send("Successfully unregistered : " + reginfo.API_HU + " ")
        })
    } else {
        res.send("Config doesn't exists for ' " + reginfo.API_HU + " at ' " + reginfo.url + "' ")
    }
})

/*
router.post("/unregister", (req, res) => {
    const reginfo = req.body

    if (APIExists(reginfo)) {
        const index = registry.services[reginfo.API_HU].findIndex((instance) => {
            return reginfo.url === instance.url
        })
        registry.services[reginfo.API_HU].splice(index, 1)
        fsys.writeFile("./routes/registry.json", JSON.stringify(registry), (error) => {
            if (error) {
                res.send("Not possible unregister " + reginfo.API_HU + "\n" + error)
            } else res.send("Sucessfully unregistered : " + reginfo.API_HU + " ")
        })
    } else {
        res.send("Config doesn't exists for ' " + reginfo.API_HU + " at ' " + reginfo.url + "' ")
    }
})
*/

    // Don't forget to export the router variable, so it can be used in other files (this caused the bug in week 6 where the API_HU variable could not be read)
    module.exports = router



