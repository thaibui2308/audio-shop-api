var bodyParser = require('body-parser');
// const { response } = require('express');
var express = require('express');
var cors = require('cors')
var app = express()
var TOKEN_SECRET = require('./key')
const jwt = require('jsonwebtoken')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))
app.use(cors())

// Include mongoose in our project
var mongoose = require('mongoose');
// Open a connection to the audio-shop database on our locally instance of MongoDB
var db = mongoose.connect('mongodb://localhost/audio-shop')

var Product = require('./models/product');
var WishList = require('./models/wishlist');
var User = require('./models/user')

app.post('/product', function(req, res) {
    if (!req.body) {
        res.status(500).send({ error: "Could not send product" })
    }
    else {
        var productList = req.body
        for (var i = 0; i < productList.length; i++) {
            var product = new Product({ 
                    title: productList[i].title,
                    price: productList[i].attribute.price,
                })
            product.save((err, savedProduct) => {
                if (err) {
                    res.status(500).send({ error: "Could not send product" })
                }
                else {
                    res.send(savedProduct)
                }
            })
        }
    }
})

app.get('/product', function(req, res) {
    Product.find({}, (err, products) => {
        if (err){
            res.status(500).send({ error: "Error founded at line 35" })
        }
        else {
            res.send(products)
        }
    })
})

app.get("/product/:category", (req, res) => {
    var productCategory = req.params.category

    Product.find({ category: productCategory }, (err, products) => {
        if (err)
            res.status(500).send({ error: `error at route to ${req.url}` })
        else 
            res.send(products)
    })
})

app.get("/product", (req, res) => {
    var productTitle = req.query.title

    Product.findOne({ title: productTitle }, (err, product) => {
        if (err)
            res.status(500).send({ error: "Can't found this product!" })
        res.send(product)
    })
})

app.get("/product/findByPrice/:productPrice", (req, res) => {
    var productPrice = req.query.price
    Product.find({ price: productPrice }, (err, product) => {
        if (err)
            res.status(500).send({ error: "Fuck!" })
        else 
            res.send(product)
    })
})
app.post('/wishlist', (req, res) => {
    if (!req.body) {
        res.status(500).send({ error: "Can not find any wishlist" })
    }
    else {
        var wishList = new WishList()
        wishList.title = req.body.title
        wishList.save((err, savedWishList) => {
            if (err){
                res.status(500).send({ error: "Can not save wishlist" })
            }
            else {
                res.send(savedWishList)
            }
        })
    }
})
app.get('/wishlist', (req, res) => {
    WishList.find({}).populate({path: 'products', model: "Product"}).exec( (err, wishLists) => {
        if (err) {res.status(500).send({ error: "Can not find the requested wish list!" })}
        else {res.send(wishLists)}
    })
})
app.put('/wishlist/product/add', (req, res) => {
    Product.findOne({_id: req.body.productId}, (err, product) => {
        if (err) {
            res.status(500).send({ error: "Can not find that product!" })
        }
        else {
            WishList.update({_id:req.body.wishlistId}, {$addToSet: {products: product._id}},
                (err, wishlist) => {
                    if (err) {res.status(500).send({ error: "Can not find that wishlist!" })}
                    else {res.send(wishlist)}
                })
        }
    })
})

// Endpoint /user
app.post('/signup', validateNewUser, (req, res) => {
    var user = new User({
        email: req.query.mail,
        password: req.query.password
    }) 
    user.save((err, savedUser) => {
        if (err) res.status(500).send({ error: "Could not save user!" })
        else res.send({ success: true })
    })
})

app.post("/authenticateUser", (req, res) => {
    var userPayload = req.body

    User.findOne({ email: userPayload.email }, (err, user) => {
        if (err)
            res.status(500).send({ error: "This email is invalid!" })
        else {
            var result = user.comparePassword(userPayload.password);
            if (result.success)
                res.send({
                    JWT: generateAccessToken({ userPayload })
                })
            else 
                res.status(500).send({ error: "Incorrect password!" })
        }
    })
})

function validateNewUser(req, res, next) {
    User.findOne({ email: req.query.email }, (err, user) => {
        if (err)
            next()
        else 
            res.send({ warning: "This email had been used!" })
    })
}

function protectingRoute(req, res, next) {
    if (req.user) {
        next();
    }
    else{
        res.status(500).json({error:'login is required'});
     }
}

function generateAccessToken(username) {
    return jwt.sign(username, TOKEN_SECRET, { expiresIn: '1800s' });
  }
  const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];
    
    jwt.verify(token, TOKEN_SECRET, (err, user) => {
      console.log(err)
      
      if (err) res.status(403).send({ error: "Can not authenticate token!",
                                      token: token})
      req.user = user
      next()
    })
  }

app.listen(3000, () => {
    console.log("Audio Shop API running!");
})