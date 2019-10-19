const express = require("express")
const app = express()
// const port = process.env.PORT
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
// const jwtKey = process.env.JWT_KEY
const mongodb = require("mongodb")
const auth = require("./auth")
const {port,jwtKey}=require("./config")
app.use(express.json())
app.get("/",(req,res)=>{
    res.send("Hello")
})

app.post("/register",async(req,res)=>{
    let name = req.body.name
    let email = req.body.email
    let studentId= req.body.studentId
    let encryptedPwd = await bcrypt.hash(req.body.password,8)
    const o = {
        name:name,
        email:email,
        studentId:studentId,
        password:encryptedPwd
    }
    const client = await require("./db")
    const db = client.db('buu')
    const r = await db.collection("users").insertOne(o).catch((err)=>{
        console.log(`cannot insert data to users collection : ${err}`)
        res.status(500).json({error:err})
        return
    })
    let result = {
        _id: o.id, 
        name: o.name, 
        email: o.email, 
        studentId: o.studentId
    }
    res.status(201).json(o)
})

app.post("/sign-in",async(req,res)=>{
    let email = req.body.email
    let password = req.body.password
    const client = await require("./db")
    let db = client.db("buu")
    let user = await db.collection('users').findOne({ email: email}).catch((err)=>{
        console.err(`Cannot find users`)
        res.status(500).send({err:err})
        return
    })
    if(!user){
    res.status(401).json({error:"username or password is not match"})
        return
    }
    let passwordIsValid = await bcrypt.compare(password,user.password)
    if(!passwordIsValid){
        res.status(401).json({error:"username or password is not match"})
        return
    }
    let token = await jwt.sign({email:user.email,id:user._id},jwtKey,{expiresIn:1})    
    res.status(200).json({token:token})
})

app.get("/me",auth,async (req,res)=>{
    // let token = req.header('Authorization')
    // let decode = await jwt.decode(token)

    let decoded = req.decoded
    const client = await require("./db")
    let db = client.db("buu")
    let user = await db.collection('users').findOne({_id:mongodb.ObjectID(decoded.id)}).catch((err)=>{
        console.log(err)
        res.status(500).send(err)
    })
    if(!user){
        res.status(401).json({error:"User was not found"})
        return
    }

    delete user.password

    res.json(decoded)
})

app.put("/me",auth,async (req,res)=>{
    let newEmail = req.body.email
    let decoded = req.decoded
    const client = await require("./db")
    let db = client.db("buu")
    let user = await db.collection('users').updateOne({_id:mongodb.ObjectID(decoded.id)},
    {
      $set: { email: newEmail }
    }).catch((err)=>{
        console.log(err)
        res.status(500).send(err)
    })
    if(!user){
        res.status(401).json({error:"User was not found"})
        return
    }
    delete user.password
    res.status(204).send("email is updated")
})

app.listen(port,console.log(`app is running ${port}`))