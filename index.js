const express = require('express')
const cors = require('cors')
const app = express()
const stripe = require('stripe')('sk_test_51PZmx2Ro2enkpQYdV1PdzTYYwEUam2XGqbWAnEE7CMUqysztVSfp9NBAoOfzNY5yEx1M04oMWAV5Q0THnhvi1M6500w8osQPgZ')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()
const port = process.env.PORT || 5000;

app.use(express.json())
app.use(cors(
  { origin: ['http://localhost:5173', 'https://travel-guru-a638f.web.app', 'https://travel-guru-a638f.firebaseapp.com'] }

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
    const CollectionOfPayments = client.db("TravelGuru").collection("paymentDB");
    const CollectionOfContact = client.db("TravelGuru").collection("contactDB");
    // await client.connect();


    //verify token
    const verifyToken = (req, res, next) => {
      if (!req.headers.authorization) {
        return res.status(401).send({ message: "UnAuthorization" })
      }
      const token = req.headers.authorization.split(" ")[1]
      console.log(token)
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(403).send({ message: "Token is not valid" })
        }
        req.decoded = decoded
        console.log(req.decoded)
        console.log(req.decoded.email)
        next();
      })
    }

    //verify admin
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const filter = { email: email };
      const user = await CollectionOfAllUsers.findOne(filter);
      const isAdmin = user?.role === "admin";
      if (!isAdmin) {
        return res.status(403).send({ message: "Not authorized to perform this action" })
      }
      next()
    }

    // create jwt
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      res.json({ token });
    })

    //package related api
    app.post('/addPackages', verifyToken, verifyAdmin, async (req, res) => {
      const newPackage = req.body;
      const result = await CollectionOfPackeges.insertOne(newPackage);
      res.send(result);
    })
    app.get('/packages', async (req, res) => {
      const packages = req.body;
      const result = await CollectionOfPackeges.find(packages).toArray();
      res.send(result);
    })

    app.get('/packages/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await CollectionOfPackeges.findOne(filter);
      res.send(result);
    })
    app.delete('/packages/:id', verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await CollectionOfPackeges.deleteOne(filter);
      res.send(result);
    })


    app.patch('/updatePackage/:id', verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const newPackage = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          title: newPackage.title,
          price: newPackage.price,
          description: newPackage.description,
          image: newPackage.image,
          offers: newPackage.offers,
          duration: newPackage.duration,

        }
      }
      const result = await CollectionOfPackeges.updateOne(filter, updateDoc)
      res.send(result);
    })


    //booking related api
    app.post('/booking', async (req, res) => {
      const newBooking = req.body;
      const result = await CollectionOfCustomerBooking.insertOne(newBooking);
      res.send(result);
    })

    app.get('/booking', async (req, res) => {
      const email = req.query.email;
      const filter = { email: email }
      const result = await CollectionOfCustomerBooking.find(filter).toArray()
      res.send(result);
    })

    app.delete('/booking/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const result = await CollectionOfCustomerBooking.deleteOne(filter);
      res.send(result);
    })


    //show  all booking
    app.get('/allBooking', async (req, res) => {
      const booking = req.body;
      const result = await CollectionOfCustomerBooking.find(booking).toArray()
      res.send(result);
    })

    // review related api
    app.post('/reviews', async (req, res) => {
      const review = req.body;
      const result = await CollectionOfCustomerReview.insertOne(review);
      res.send(result);
    })

    app.get('/reviews', async (req, res) => {
      const review = req.body;
      const result = await CollectionOfCustomerReview.find(review).toArray()
      res.send(result);
    })

    //booking your trip destination api
    app.post('/destination', async (req, res) => {
      const destination = req.body;
      const result = await CollectionOfDestination.insertOne(destination);
      res.send(result);
    })
    app.get('/destination', async (req, res) => {
      const user = req.query.email;
      const filter = { email: user }
      const result = await CollectionOfDestination.find(filter).toArray()
      res.send(result);
    })

    //contact related api
    app.post('/contacts', async(req,res)=>{
      const requestUser = req.body;
      const result = await CollectionOfContact.insertOne(requestUser);
      res.send(result)
    })

    app.get('/contacts', async(req,res)=>{
      const info = req.body;
      const result = await CollectionOfContact.find(info).toArray();
      res.send(result)
    })

    //user related api
    app.post('/users', async (req, res) => {
      const newUser = req.body;
      const filter = { email: newUser.email }
      const exited = await CollectionOfAllUsers.findOne(filter)
      if (exited) {
        return res.status(400).send('User already exist')
      }
      const result = await CollectionOfAllUsers.insertOne(newUser);
      res.send(result);
    })

    app.get('/users', verifyToken, verifyAdmin, async (req, res) => {
      const users = req.body;
      const result = await CollectionOfAllUsers.find(users).toArray()
      res.send(result);
    })

    app.get('/users/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await CollectionOfAllUsers.findOne(filter);
      res.send(result);
    })

    app.delete('/users/:id', verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await CollectionOfAllUsers.deleteOne(filter);
      res.send(result);
    })
    //make admin  
    app.patch('/users/admin/:id', verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "admin"
        }
      }
      const result = await CollectionOfAllUsers.updateOne(filter, updateDoc)
      res.send(result);
    })
    //check user is an admin
    app.get('/users/admin/:email', verifyToken, async (req, res) => {
      const email = req.params.email;

      if (email !== req.decoded.email) {
        return res.status(403).send({ message: 'forbidden access' });
      }

      const query = { email: email };
      const user = await CollectionOfAllUsers.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === "admin";
      }
      res.send({ admin })
    })

    //payment intent
    app.post('/create-payment-intent',  async (req, res) => {
      const { price } = req.body;
      const total = parseInt(price * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: total,
        currency: 'usd',
        payment_method_types: ["card"]
      });
      res.send({
        clientSecret: paymentIntent.client_secret
      });
    })

    // send payment information in database 
    app.post('/payments',  async (req, res) => {
      const payment = req.body;
      const PaymentResult = await CollectionOfPayments.insertOne(payment);
      const filter = {
        _id:{
          $in: payment.bookingIds.map(id => new ObjectId(id))
        }
      }
      const DeleteCard = await CollectionOfCustomerBooking.deleteMany(filter);
      res.send({PaymentResult, DeleteCard});
    })

    //get user payment history
    app.get('/payments/:email', verifyToken, async(req,res)=>{
      const email = req.params.email;
      if(email !== req.decoded.email){
        return res.status(403).send({message: 'forbidden access'});
      }
      const filter = {email: email}
      const result = await CollectionOfPayments.find(filter).toArray()
      res.send(result)
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