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
app.listen(3000, () => {
    console.log("Audio Shop API running!");
})