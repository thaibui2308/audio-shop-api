var bodyParser = require('body-parser');
const { response } = require('express');
var express = require('express');
var app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

// Include mongoose in our project
var mongoose = require('mongoose');
const product = require('./models/product');
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
        for (let i=0; i<productList.length; i++) {
            var product = new Product({ 
                title: productList[i].title,
                price: productList[i].price
             })
            product.save( (err, savedProduct) => {
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
app.post('/user', (req, res) => {
    if (!req.body) 
        res.status(500).send({ error: "Could not get users!" })
    else {
        var userList = req.body 
        for (let i=0; i<userList.length; i++) {
            var user = new User({
                username: userList[i].username,
                password: userList[i].password
            })
            user.save( (err, savedUser) => {
                if (err) res.status(500).send({ error: "Could not save user!" })
                else res.send(savedUser)
            })
        }
    }
})
app.get('/user', (req, res) => {
    User.find({}).populate({ path: 'products', model: "Product" }).exec( (err, user) => {
        if (err) res.status(500).send({ error: "Error happened!" })
        else res.send(user)
    })
})
app.put('/user/cart/add', (req, res) => {
    Product.findOne({ _id: req.body.productId }, (err, product) => {
        if (err) res.status(500).send({ error: "Could not find the specified item" })
        else {
            User.update({ _id: req.body.userId }, {$addToSet: {products: product._id}}, (err, user) => {
                if (err) res.status(500).send({ error: "Could not append item in the user cart!" })
                else res.send(user)
            })
        }
    })
})
app.get('/user/:userId', (req, res) => {
    var userId = req.params.userId

    User.findOne({ _id: userId }, (err, user) => {
        if (err) res.status(500).send({ error: "No such user in the database" })
        else res.send(user)
    })
    
})

app.listen(3000, () => {
    console.log("Audio Shop API running!");
})