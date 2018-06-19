"use strict"
//Class used for operating dynamo db
let aws = require('aws-sdk'),
    config = require('../.config.js')

//Setting up the configuration for the aws sdk.
//Configuration is kept in a hidden file
aws.config.update({
    region: "eu-west-1",
    enpoint: "http://localhost:8080",
    accessKeyId: config.key,
    secretAccessKey: config.secret
})

let dynamodb = new aws.DynamoDB.DocumentClient()

let dynamo = {
    //Put new item into DB
    putItem: (params, callback) => {
        dynamodb.put(params, callback)
    },
    //Get a single item from DB
    getItem: (id,table) => {
        const params = {
            TableName: table,
            Key: {
                "id": Number(id)
            }
        };
        return new Promise((resolve, reject) => {
            dynamodb.get(params, (err, data) => {
                if (data != undefined) {
                    resolve(data);
                }
                else {
                    reject(err.message);
                }
            })
        })
    },
    //Get all items from a single table
    getItems: (table) => {
        return new Promise((resolve, reject) => {
            dynamodb.scan({ TableName: table }, (err, data) => {
                if (data != undefined)
                    resolve(data)
                else if (err.statusCode == 400)
                    reject(err.message)
            })
        })
    },
    //Update an item in a table
    updateItems: (id, priority,table, callback) => {
        dynamodb.update({
            TableName: table,
            Key: {
                "id": Number(id)
            },
            UpdateExpression: "set priority = :event",
            ExpressionAttributeValues: {
                ":event": Number(priority)
            }
        }, callback)
    },
    //Delete an item from a table
    deleteItems: (id,table, callback) => {
        dynamodb.delete({
            TableName: table,
            Key: {
                "id": Number(id)
            },
            ConditionExpression: "id =:val",
            ExpressionAttributeValues: {
                ":val": Number(id)
            }
        }, callback)
    }
}
module.exports = dynamo