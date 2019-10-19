const express = require("express")
const app = express()
const port = 3000
const portx = process.env.PORT

app.get("/",(req,res)=>{
    res.send("Hello")
})

app.listen(portx,console.log(`app is running ${port}`))