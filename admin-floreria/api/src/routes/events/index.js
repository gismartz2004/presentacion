const express = require("express");
const router = express.Router();
const eventsController = require("../../controllers/events/events-controller");

router.get("/orders/stream", eventsController.EventsOrderStream);

module.exports = router;
