const express = require('express');
const db = require('../db');
const Chain = require('../models/chain');

const router = express.Router();

router.get('/', (req, res) => {
  db.all('SELECT * FROM chain', (err, rows) => {
    if (err) {
      res.status(500).send('Error retrieving chain');
    } else {
      res.json(rows);
    }
  });
});

router.get('/instance', (req, res) => {
  res.json(Chain.instance);
});

module.exports = router;
