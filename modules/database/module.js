const { MongoClient } = require('mongodb')
const dotenv = require('dotenv')

dotenv.config()

const dbConnect = async() => {
    try{
        const client = new MongoClient(
            'mongodb+srv://' + process.env.DBUSR + ':' + process.env.DBPSW + '@cluster.adtaord.mongodb.net/?retryWrites=true&w=majority',
            { useNewUrlParser: true, useUnifiedTopology: true }
        )
        await client.connect()
        return client
    } catch(error){
        console.error('Cannot connect to db:', error)
        throw error
    }
}

const writeData = async(data) => {
    let client
    try{
        client = await dbConnect()
        const db = client.db('MovieDB')
        const collection = db.collection('movies')
        for(let i = 0; i < data.length; i++){
            const dbMovie = await collection.findOne({ title: data[i].title })
            if(!dbMovie) await collection.insertOne(data[i])
            else{
                if(dbMovie.userRating != data[i].userRating){
                    await collection.updateOne(
                        { title: data[i].title },
                        { $set: { userRating: data[i].userRating } }
                    )
                }
            }
        }
    } 
    catch(error){ console.error('Cannot write data:', error) }
    finally{ if(client) client.close() }
}

const updateGeneral = async(data) => {
    let client
    try{
        client = await dbConnect()
        const db = client.db('MovieDB')
        const collection = db.collection('general')
        await collection.findOneAndDelete({})
        await collection.insertOne(data)
    } 
    catch(error){ console.error('Cannot write data:', error) }
    finally{ if(client) client.close() }
}

module.exports = {
    writeData,
    updateGeneral
}

