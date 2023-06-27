// server.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');


// Initialize Express app
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb+srv://admin:123456ghost@nodeapi.kvlsxmy.mongodb.net/Opasso?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));




const productSchema = new mongoose.Schema({
  productname:String,
  quantity:String,
  price:String,
  image:String,
  sellername:String,
  phone:String,
  location:String,
});


const Product = mongoose.model('Product', productSchema);

// Create User model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

const User = mongoose.model('User', userSchema);


// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Register user route
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
    await user.save();
    res.status(200).json({ message: 'User registered successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});


//products section

//add new product
app.post('/addproduct', async(req,res) =>{
  try{
    const {productname,quantity,price,image,sellername,phone,location} = req.body;
    const product = new Product({productname, quantity, price, image, sellername, phone, location});
    await product.save();
    res.status(200).json({message: 'product saved successfully'});

  }
  catch (error){
    res.status(500).json({error:'product add failed'})
  }
});


//fetch all products
app.get('/productlist', async(req, res)=>{
  try{
    const product = await Product.find({});
    res.status(200).json(product);

  }
  catch(error){
    console.log(error);
    res.status(500).json({error:'product not found'})
  }
})

// Login route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to login' });
  }
});


//fetch users
app.get('/usersdata', async(req, res)=> {
  try{
    const user = await User.find({});
    res.status(200).json(user);

  }catch(error){
    console.log(error);
    res.status(500).json({error:'Data not fetched'})
  }

})

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
