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
  category:String,
  brand:String,
});




const Product = mongoose.model('Product', productSchema);


//ebd product schema

// Create User model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

const User = mongoose.model('User', userSchema);


// Create Brand model
const brandSchema = new mongoose.Schema({
  brandname: String,
  brandimage:String,
  categories: String,
  subcategories:[String],


});

const Brand = mongoose.model('Brand', brandSchema);



// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use('/',(req,res)=>{
  res.send('Vercel backend app creation')
})

app.post('/addbrand', async (req, res) => {
  try {
    const { brandname, brandimage, categories, subcategories } = req.body;
    const brand = new Brand({ brandname, brandimage, categories, subcategories });
    await brand.save();
    res.status(200).json({ message: 'brand added successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to add brand' });
  }
});




//fetch brands
app.get('/fetchbrands', async (req,res) => {
  try{
    const brand = await Brand.find({});
    res.status(200).json(brand);
  }
  catch(error){
    console.log(error);
    res.status(500).json({error:'Brand not available'});
  }

})


app.get('/fetchbrands/:brandname', async(req,res)=>{
  try{
    const {brandname} = req.params;

    const brand = await Brand.find({brandname});
    if(!brand){
      res.status(404).json({message:'you have not added any item to cart'});
    }
    res.status(200).json(brand);
  }
  catch(error){
    res.status(500).json({message:error.message});

  }
  
})



app.get('/fetchsubcategories', async (req, res) => {
  try {
    const brands = await Brand.find({}); // Fetch all brands
    const subcategories = brands.reduce((acc, brand) => {
      // Extract individual subcategories from each brand's subcategories array
      brand.subcategories.forEach(subcategory => {
        if (!acc.includes(subcategory)) {
          acc.push(subcategory);
        }
      });
      return acc;
    }, []);
    
    res.status(200).json(subcategories);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Subcategories not available' });
  }
});


//lets now try and update brand by brandname
app.put('/brandupdate/:brandname', async (req, res) => {
  try {
    const { brandname } = req.params;
    const updatedBrand = await Brand.findOneAndUpdate(
      { brandname: brandname }, // Find the brand by its name
      req.body, // Update the brand with the request body data
      { new: true } // Return the updated brand as the response
    );

    // If brand fetched cannot be found
    if (!updatedBrand) {
      return res.status(404).json({ message: `Cannot find brand with name ${brandname}` });
    }

    res.status(200).json(updatedBrand);
    console.log("Data updated successfully");

  } catch (error) {
    res.status(500).json({ message: error.message });

  }
});


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

//get userdata using email
app.get('/usersdata/:email', async(req,res)=>{
  try{
    const {email} = req.params;

    const user = await User.find({email});
    if(!user){
      res.status(404).json({message:'you have not added any item to cart'});
    }
    res.status(200).json(user);
  }
  catch(error){
    res.status(500).json({message:error.message});

  }
  
})


//products section

//add new product
app.post('/addproduct', async(req,res) =>{
  try{
    const {productname,quantity,price,image,sellername,phone,location,category,brand} = req.body;
    const product = new Product({productname, quantity, price, image, sellername, phone, location, category,brand});
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

//fetch products by id
//try to fetch a user by thier id
app.get('/productlist/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const product = await Product.findById(id);
        res.status(200).json(product)
        
    } catch (error) {
        res.status(500).json({message:error.message});
        
    }
})

//fetch products by seller and name

app.get('/productlist/:sellername', async(req, res) => {
    try {
        const {sellername} = req.params;
        const product = await Product.findById(sellername);
        res.status(200).json(product)
        
    } catch (error) {
        res.status(500).json({message:error.message});
        
    }
})


//fetch product by category
app.get('/productlistcategory/:category', async(req,res)=>{
  try{
    const {category} = req.params;

    const product = await Product.find({category});
    if(!product){
      res.status(404).json({message:'you have no category'});
    }
    res.status(200).json(product);
  }
  catch(error){
    res.status(500).json({message:error.message});

  }
  
})



//search a product by category and its max and min price
app.get('/productlistcategoryandprice/:category1/:price', async (req, res) => {
  try {
    const { category1, price } = req.params;
    const { minPrice,maxPrice } = req.query;

    // Build the filter object based on the two categories and price range
    const filter = {
      $or: [{ category: category1 }],
    };
    if (minPrice !== undefined) {
      filter.price = { $gte: parseFloat(minPrice) };
    }
    if (maxPrice !== undefined) {
      if (filter.price) {
        filter.price.$lte = parseFloat(maxPrice);
      } else {
        filter.price = { $lte: parseFloat(maxPrice) };
      }
    }

    const products = await Product.find(filter);

    if (products.length === 0) {
      return res
        .status(404)
        .json({ message: 'No products found for the given categories and price range.' });
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//search by brandname and category
app.get('/productlistcategoryandbrand/:brand/:category', async (req, res) => {
  try {
    const { brand, category } = req.params;

    // Build the filter object based on the specified brand and category
    const filter = {
      brand: { $regex: brand, $options: 'i' }, // Using regex with case-insensitive option 'i' to match partial brand names
      category,
    };

    const products = await Product.find(filter);

    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found for the given brand and category.' });
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




//initiate a search

app.get('/productlistsearch/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const products = await Product.find({
      $or: [
        { productname: { $regex: query, $options: 'i' } }, // Search for name or letter in product name
        { sellername: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }, // Search for name or letter in seller name
      ]
    });
    if (products.length === 0) {
      res.status(404).json({ message: 'No products found' });
    } else {
      res.status(200).json(products);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});









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

});

//try to fetch a user by thier id
app.get('/usersdata/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const user = await User.findById(id);
        res.status(200).json(user)
        
    } catch (error) {
        res.status(500).json({message:error.message});
        
    }
})

//find username
app.get('/userdata/:email', async(req,res)=>{
  try{
    const {email} = req.params;

    const user = await User.find({email});
    if(!user){
      res.status(404).json({message:'you have not added any item to cart'});
    }
    res.status(200).json(user);
  }
  catch(error){
    res.status(500).json({message:error.message});

  }
  
})




const cartItemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
  },
  itemImage: {
    type: String,
    required: true,
  },
  itemPrice: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  itemManufacturer: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

// Define the model for the cart item
const CartItem = mongoose.model('CartItem', cartItemSchema);

// Middleware
app.use(bodyParser.json());

// Route for adding an item to the cart
app.post('/cart', async (req, res) => {
  try {
    const { itemName, itemImage, itemPrice,itemManufacturer,email } = req.body;
    const newItem = new CartItem({ itemName, itemImage, itemPrice,itemManufacturer,email });
    await newItem.save();
    res.status(200).json({ message: 'Item added to cart' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//fetch cart items
app.get('/cartlist', async(req, res)=>{
  try{
    const cart = await CartItem.find({});
    res.status(200).json(cart);

  }
  catch(error){
    console.log(error);
    res.status(500).json({error:'product not found'})
  }
})



//get cart item by id
app.get('/cartlist/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const cart = await CartItem.findById(id);
        res.status(200).json(cart)
        
    } catch (error) {
        res.status(500).json({message:error.message});
        
    }
})

//get cart item by user
app.get('/cartlist/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const cart = await CartItem.findById(id);
        res.status(200).json(cart)
        
    } catch (error) {
        res.status(500).json({message:error.message});
        
    }
})



app.get('/cartuser/:email', async(req,res)=>{
  try{
    const {email} = req.params;

    const cart = await CartItem.find({email});
    if(!cart){
      res.status(404).json({message:'you have not added any item to cart'});
    }
    res.status(200).json(cart);
  }
  catch(error){
    res.status(500).json({message:error.message});

  }
  
})

//delete item from databse using its id
app.delete('/delcart/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const cart = await CartItem.findByIdAndDelete(id);
        if(!cart){
            res.status(404).json({message:'cannot find this item'})
        }
        res.status(200).json({ message: 'Item deleted successfully' });
        
    } catch (error) {
        res.status(500).json({message:error.message});
        
    }
})




//manufacturer schema
const manufacturerSchema = new mongoose.Schema({
  username:String,
  email:String,
  password:String,
  picture:String,
  location:String,
  postaladdress:String,
  physicaladdress:String,
  bussinesstype:String,
  category:[String],
  
});




const Manufacturer = mongoose.model('Manufacturer', manufacturerSchema);


// Register manufacturer route
app.post('/manufregister', async (req, res) => {
  try {
    const { username, email, password,picture,location,postaladdress,physicaladdress,bussinesstype,category } = req.body;
    const manufacturer = new Manufacturer({ username, email, password,picture,location,postaladdress,physicaladdress,bussinesstype,category });
    await manufacturer.save();
    res.status(200).json({ message: 'Manufacturer registered successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to register Manufacturer' });
  }
});



// Login manufacturer route
app.post('/manuflogin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const manufacturer = await User.findOne({ email, password });
    if (!manufacturer) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to login' });
  }
});



//fetch all the manufacturers
//fetch users
app.get('/manufdata', async(req, res)=> {
  try{
    const manufacturer = await Manufacturer.find({});
    res.status(200).json(manufacturer);

  }catch(error){
    console.log(error);
    res.status(500).json({error:'Data not fetched'})
  }

});



//search products by seller and category
//search by brandname and category
app.get('/productlistcategoryandseller/:sellername/:category', async (req, res) => {
  try {
    const { sellername, category } = req.params;

    // Build the filter object based on the specified brand and category
    const filter = {
      sellername: { $regex: sellername, $options: 'i' }, // Using regex with case-insensitive option 'i' to match partial brand names
      category,
    };

    const products = await Product.find(filter);

    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found for the given brand and category.' });
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});






// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
