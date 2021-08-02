var mongoose = require('mongoose')
var bcrypt = require('bcryptjs')
var Schema = mongoose.Schema

var user = new Schema({
    username: String,
    email: { type:String, unique:true },
    password: String,
    image: String
}, { timestamps: true })

user.pre('save', (next) => {
    var tmp = this

    if (!tmp.isModified('password')) 
        return next()
    bcrypt.hash(tmp.password, 10).then((hashedPassword) => {
        user.password = hashedPassword;
        next()
    })
}, (err) => {
    next(err)
})

user.methods.comparePassword = (candidatePassword, next) => {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if (err)
            return ({success: false, message: 'passwords do not match'});
        return {success: true, message: 'Authenticated!'};
    })
}

module.exports = mongoose.model("User", user)