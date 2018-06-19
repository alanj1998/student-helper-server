"use strict"
//Class that deals with backups
let express = require('express'),
    s3 = require('aws-sdk').S3,
    dynamo = require('./dynamo-operations'),
    awsconfig = require('../.config.js'),
    backup = new s3({
        secretAccessKey: awsconfig.secret
    })

module.exports = {
    //When backup is called, the table is read in and then
    //json formatted to be put into the s3 bucket
    backup: (tableName) => {
        if (tableName != undefined) {
            return new Promise((resolve, reject) => {
                dynamo.getItems(tableName).then((value) => {
                    let data = value.Items
                    backup.putObject({
                        Body: JSON.stringify(data),
                        Key: tableName,
                        Bucket: "dynamodb-cloud-backup"
                    }, (err, data) => {
                        if (err)
                            reject("Error putting an object!")
                        else
                            resolve(data)
                    })
                }).catch(err => {
                    reject("Table not found!")
                })
            })
        }
    },

    //When restore is called, first a list of objects in s3 is read in
    //Then it is sorted by last modified date (freshest backup)
    //After the object is got, parsed from a binary buffer and written to the db
    restore: (tableName) => {
        return new Promise((resolve, reject) => {
            let backedCopy = backup.listObjectsV2({
                Bucket: "dynamodb-cloud-backup",
                Prefix: tableName
            }, (err, data) => {
                if (err)
                    reject("Error reading list of objects from s3")
                else {
                    let item = data.Contents[0]
                    backup.getObject({
                        Bucket: "dynamodb-cloud-backup",
                        Key: item.Key
                    }, (err, data) => {
                        if (err)
                            reject("Error getting latest backup!")
                        else {
                            let rawData = new Buffer(data.Body, 'binary').toString()
                            let copyToBeRestored = JSON.parse(rawData)
                            copyToBeRestored.forEach(element => {
                                dynamo.putItem({
                                    TableName: tableName,
                                    Item: element
                                }, (err, data) => {
                                    if (err) {
                                        reject("Error rewriting backed up data")
                                    }

                                    else
                                        resolve("Success!")
                                })
                            })
                        }
                    })
                }
            })
        })
    }
}