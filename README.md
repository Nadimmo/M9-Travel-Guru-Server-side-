// create jwt
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      res.json({ token });
    })


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