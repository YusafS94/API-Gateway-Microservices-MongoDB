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