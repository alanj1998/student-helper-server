"use strict"
//Router used for dynamodb requests
let express = require("express"),
    router = express.Router(),
    aws = require('aws-sdk'),
    config = require('../.config.js'),
    dynamo = require('../lib/dynamo-operations')


//Add a new item
router.post('/item', (req, res) => {
    let item = req.body.data;
    let tableName = req.body.table;
    dynamo.putItem({
        TableName: tableName,
        Item: item
    }, (err, data) => {
        if (err) {
            res.status(503).send(err);
        }

        else
            res.status(200).send()
    })
})
//Delete an item
router.delete('/item/:table/:id', (req, res) => {
    const id = req.params.id;
    const table = req.params.table;
    dynamo.deleteItems(id, table, (err, data) => {
        if (err) {
            res.status(503).send(err)
        }
        else {
            res.status(200).send()
        }
    })
})

//Get all items
router.get('/items', (req, res) => {
    const table = req.query['table']
    dynamo.getItems(table).then((value) => {
        res.status(200).send(JSON.stringify(value.Items))
    }).catch(err => {
        res.status(503).send('AWS DynamoDB error: ' + err)
    })
})

//Update the priority
router.put('/priority/:id/:incrementType/:table', (req, res) => {
    //Get all the paramets
    let id = req.params.id;
    let incrementType = req.params.incrementType;
    let table = req.params.table;
    let amount = 0;

    //Check if the priority was increased or decreased
    if (incrementType === "increase") {
        amount = 1;
    }
    else if (incrementType === 'decrease') {
        amount = -1;
    }

    //Get the item in order to get its priority
    dynamo.getItem(id, table).then((value) => {
        value.Item.priority += amount;
        dynamo.updateItems(id, value.Item.priority, table, (err, data) => {
            if (err)
                res.status(503).send(err)
            else
                res.status(200).send()
        })
    }).catch(err => { //catch errors
        res.status(503).send('AWS DynamoDB error: ' + err)
    })
})

module.exports = router