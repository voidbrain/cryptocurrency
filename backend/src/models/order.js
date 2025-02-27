class Order {
  constructor(type, amount, price) {
    this.type = type; // 'buy' or 'sell'
    this.amount = amount;
    this.price = price;
  }

  toString() {
    return JSON.stringify(this);
  }
}

module.exports = Order;
