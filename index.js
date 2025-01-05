const express = require('express')
const cors = require('cors')
const app = express()
const dotenv = require('dotenv')
dotenv.config()
const port = process.env.PORT || 5000;

app.use(express.json())
app.use(cors(
    { origin: ['http://localhost:5173'] }

))




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rrkijcq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    const CollectionOfPackeges = client.db("TravelGuru").collection("packegeDB");
    const CollectionOfCustomerBooking = client.db("TravelGuru").collection("bookingDB");
    const CollectionOfCustomerReview = client.db("TravelGuru").collection("reviewDB");
    // await client.connect();
    //package related api
    app.post('/packages', async(req,res)=>{
        const newPackage = req.body;
        const result = await CollectionOfPackeges.insertOne(newPackage);
        res.send(result);
    })
    app.get('/packages', async(req,res)=>{
        const packages = req.body;
        const result = await CollectionOfPackeges.find(packages).toArray();
        res.send(result);
    })

    app.get('/packages/:id', async(req,res)=>{
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)};
        const result = await CollectionOfPackeges.findOne(filter);
        res.send(result);
    })

    app.delete('/packages/:id', async(req,res)=>{
        const id = req.params.id;
        const result = await CollectionOfPackeges.deleteOne({_id:id});
        res.send(result);
    })

    //booking related api
    app.post('/booking', async(req,res)=>{
        const newBooking = req.body;
        const result = await CollectionOfCustomerBooking.insertOne(newBooking);
        res.send(result);
    })
    
    app.get('/booking', async(req,res)=>{
        const email = req.query.email;
        const filter = {email: email}
        const result = await CollectionOfCustomerBooking.find(filter).toArray()
        res.send(result);
    })

    // review related api
    app.post('/reviews', async(req,res)=>{
      const review = req.body;
      const result = await CollectionOfCustomerReview.insertOne(review);
      res.send(result);
    })

    app.get('/reviews', async(req,res)=>{
      const review = req.body;
      const result = await CollectionOfCustomerReview.find(review).toArray()
      res.send(result);
    })

    
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})