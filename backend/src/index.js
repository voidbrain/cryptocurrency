const express = require('express');
const chainRoutes = require('./routes/chain');
const transactionRoutes = require('./routes/transaction');
const walletRoutes = require('./routes/wallet');
const orderRoutes = require('./routes/order');

const app = express();
app.use(express.json());

app.use('/chain', chainRoutes);
app.use('/transaction', transactionRoutes);
app.use('/wallet', walletRoutes);
app.use('/order', orderRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
