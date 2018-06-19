"use strict"

let express = require('express'),
    app = express(),
    path = require('path'),
    port = 8080,
    auth = require('./lib/auth'),
    dynamo = require('./routes/dynamodb'),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    s3backup = require('./routes/s3-operations')

app.use(bodyParser.json())
app.use(cors())
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, '/views'))
app.get('/', (req, res) =>{
    let iplocation = require('iplocation'),
        ip = req.headers['X-Forwarded-For'] | req.ip
    iplocation(ip).then((result) => {
        res.render('noaccess', {ip: ip, city: result.city, country: result.country})
    }).catch((err) => {
        res.render('noaccess')
    });
})
app.use('/data', auth, dynamo)
app.use('/backup', auth, s3backup)

app.listen(process.env.PORT || port, () => console.log("Listening on port " + port + '...'))