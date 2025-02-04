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
    const CollectionOfDestination = client.db("TravelGuru").collection("destinationDB");
    const CollectionOfAllUsers = client.db("TravelGuru").collection("usersDB");
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
        const filter = {_id : new ObjectId(id)};
        const result = await CollectionOfPackeges.deleteOne(filter);
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

    app.delete('/booking/:id', async(req,res)=>{
      const id = req.params.id;
      const filter =  {_id: new ObjectId(id)}
      const result = await CollectionOfCustomerBooking.deleteOne(filter);
      res.send(result);
    })


    //show  all booking
    app.get('/allBooking', async(req,res)=>{
      const booking = req.body;
      const result = await CollectionOfCustomerBooking.find(booking).toArray()
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

    //booking your trip destination api
    app.post('/destination', async(req,res)=>{
        const destination = req.body;
        const result = await CollectionOfDestination.insertOne(destination);
        res.send(result);
    })
    app.get('/destination', async(req,res)=>{
        const user = req.query.email;
        const filter = {email: user}
        const result = await CollectionOfDestination.find(filter).toArray()
        res.send(result);
    })
    
    //user related api
    app.post('/users', async(req,res)=>{
      const newUser = req.body;
      const filter = {email: newUser.email}
      const exited = await CollectionOfAllUsers.findOne(filter)
      if(exited){
        return res.status(400).send('User already exist')
      }
      const result = await CollectionOfAllUsers.insertOne(newUser);
      res.send(result);
    })

    app.get('/users', async(req,res)=>{
      const users = req.body;
      const result = await CollectionOfAllUsers.find(users).toArray()
      res.send(result);
    })

    app.get('/users/:id', async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const result = await CollectionOfAllUsers.findOne(filter);
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