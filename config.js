const mongoose = require('mongoose');
const connect = mongoose.connect("mongodb+srv://anushka10singh10:bRmwoqfGyzln4394@loca-taxi.bx9w4.mongodb.net/Login-tut");

connect.then(() => {
    console.log('Database connected Successfully');
})
.catch(() => {
    console.log('Database cannot be Connected');
});

const LoginSchema = new mongoose.Schema({
    title: {
        type: String,
        enum: ['auto_driver', 'rider'], 
        required: true
    },
    name: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true 
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive']
    },
    points: {
        type: [String], 
        default: []
    },
    timing: {
        type: String
    },
    autono: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true 
    }
}, { timestamps: true });

const dbase = new mongoose.model('Loca_Login', LoginSchema);

module.exports = dbase;