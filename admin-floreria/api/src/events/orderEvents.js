const EventEmitter = require('events');

class OrderEmitter extends EventEmitter {}

// Emitter dedicado para eventos de órdenes
const orderEvents = new OrderEmitter();

module.exports = { orderEvents };
