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