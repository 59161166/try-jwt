const jwt = require("jsonwebtoken")
const jwtKey = process.env.JWT_KEY
const auth = (req,res,next)=>{
    let token = req.header('Authorization')
    let decoded

    try{
        decoded = jwt.verify(token,jwtKey)
        req.decoded = decoded
        console.log(decoded)
        next()
    }
    catch(err){
        console.error(`Invalid token: ${err}`)
        res.status(401).json({error:err})
        return
    }
}

module.exports = auth