const mongoClient = require("mongodb").MongoClient
const URL = process.env.MONGODB_URL

module.exports = (async ()=>{
    const client = await mongoClient.connect(URL,
        {
            useNewUrlParser:true,
            useUnifiedTopology:true
        })
        return client
})()


