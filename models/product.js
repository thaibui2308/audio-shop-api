var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var product = new Schema({
    title: String, 
    imgs: [{ type: String, default: "" }],
    attribute: {
        name: String, 
        price: Number,
        condition: Number, 
        status: String,
        shipFee: Number,
        tag: {
            hot: Boolean,
            freeShip: Boolean,
            sale: Boolean
        },
        category: String
    },
    info: {
        description: [
            {
                title: String, 
                content: String,
            }
        ],
        specification: String, 
        guarantee: String,
    },
}, { timestamps: true });

module.exports = mongoose.model('Product', product)