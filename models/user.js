var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = mongoose.Types.ObjectId

var user = new Schema({
    username: String,
    password: String, 
    products: [{type: ObjectId, ref: 'Product'}],
    lists: [{type: ObjectId, ref: 'WishList'}]    
})

module.exports = mongoose.model('Users', user)