"use strict"

//BASE 64 AUTHORIZATION FOR SECURE ACCESS
let express = require('express'),
    app = express()

//Middleware used to check if the request contained authorization
//If it does it's accepted, if not then the user is redirected to auto-generated page
let auth = (req, res, next) =>{
    if(req.headers['authorization'] == 'Basic c3R1ZGVudC1oZWxwZXItZm9yLWNsb3Vk')
        return next()
    else
        res.redirect('/')
}

module.exports = auth