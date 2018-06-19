"use strict"
//Router used for backup operations
let express = require("express"),
    router = express.Router(),
    dynamoBackup = require('../lib/backup')

//use http:url/backup/nameOfTableToBeBackedUp for backup
router.post('/:tablename', (req, res) =>{
    const tableName = req.params.tablename
    dynamoBackup.backup(tableName).then((message =>{
        res.status(200).send()
    })).catch((err) =>{
        res.status(400).send(err)
    })
})

//use http:url/backup/restore/nameOfTableToBeRestored for restoring
router.post('/restore/:tablename', (req, res) =>{
    const tableName = req.params.tablename
    dynamoBackup.restore(tableName).then((result) => {
        res.status(200).send()
    }).catch((err) => {
        res.status(400).send(err)
    })
})

module.exports = router