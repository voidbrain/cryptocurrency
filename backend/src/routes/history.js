const express = require('express');
const router = express.Router();
const db = require('../db');

// Mock data for demonstration purposes
const historyData = {
  labels: ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00"],
  nodeCoinCap: [1000, 1500, 2000, 2500, 3000, 3500, 4000],
  totalTokens: [500, 700, 900, 1100, 1300, 1500, 1700],
  availableTokens: [300, 400, 500, 600, 700, 800, 900]
};

let totalTokens = 0;
let miningTimes = [];

router.post('/mining-time', (req, res) => {
  const { miningTime } = req.body;
  miningTimes.push(miningTime);
  console.log(`Received mining time: ${miningTime} seconds`);
  res.sendStatus(200);
});

router.get('/mining-times', (req, res) => {
  res.json(miningTimes);
});

router.get('/nodeCoinCap', (req, res) => {
  res.json({
    labels: historyData.labels,
    data: historyData.nodeCoinCap
  });
});

router.get('/totalTokens', (req, res) => {
  res.json({
    labels: historyData.labels,
    data: historyData.totalTokens
  });
});

router.get('/availableTokens', (req, res) => {
  res.json({
    labels: historyData.labels,
    data: historyData.availableTokens
  });
});

module.exports = router;
