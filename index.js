const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PSS}@cluster0.k88kle4.mongodb.net/?retryWrites=true&w=majority`;

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
        client.connect();

        const toyCollection = client.db("toyDB").collection("toy");
        const toyCatagory = client.db("toyDB").collection("toyCatagory");

        const indexKeys = { name: 1 };
        const indexOptions = { name: "toyName" };
        const result = await toyCollection.createIndex(indexKeys, indexOptions);
        console.log(result);
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );

        app.get('/subCatagory/:text', async (req, res) => {
            console.log(req.params.text);
            if (req.params.text == "Implement" || req.params.text == "EngTools" || req.params.text == "Architecture") {
                const cursor = toyCollection.find({ category: req.params.text });
                const result = await cursor.toArray();
                return res.send(result)
            }
            const cursor = toyCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get("/toyNameSearch/:text", async (req, res) => {
            const searchText = req.params.text;
            const result = await toyCollection.find({
                $or: [
                    { name: { $regex: searchText, $options: "i" } }
                ],
            })
                .toArray();
            res.send(result);
        })

        app.get('/')

        app.get('/toy', async (req, res) => {
            const limits = parseInt (req.query.limit)
            const cursor = toyCollection.find();
            const result = await cursor.limit(limits).toArray();
            res.send(result);
        });

        app.get('/category', async (req, res) => {
            const cursor = toyCatagory.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get("/details/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toyCollection.findOne(query);
            res.send(result);
        })

        app.get("/myToys/:email", async (req, res) => {
            const result = await toyCollection
                .find({ supplier: req.params.email }).sort({price: 1})
                .toArray();
            res.send(result);
        })


        app.get('/toy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toyCollection.findOne(query);
            res.send(result);

        })

        app.put('/toy/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedToy = req.body;
            const toy = {
                $set: {
                    name: updatedToy.name,
                    quantity: updatedToy.quantity,
                    price: updatedToy.price,
                    supplier: updatedToy.supplier,
                    details: updatedToy.details,
                    photo: updatedToy.photo
                }
            }
            const result = await toyCollection.updateOne(filter, toy, options)
            res.send(result);
        })

        app.post('/toy', async (req, res) => {
            const newToy = req.body;
            newToy.createdAt= new Date ()
            // console.log(newToy);
            const result = await toyCollection.insertOne(newToy);
            res.send(result);

        })

        app.delete('/toy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toyCollection.deleteOne(query);
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
    res.send('Toy Shops Server is running')
})

app.listen(port, () => {
    console.log(`Toy Server is running on port: ${port}`);
})