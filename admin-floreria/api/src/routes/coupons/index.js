const express = require("express");
const router = express.Router();
const couponsController = require("../../controllers/coupons/indexController");

// Basic CRUD for coupons
router.get("/", couponsController.getAllCoupons);
router.get("/generate-code", couponsController.generateCode);
router.get("/:id", couponsController.getCouponById);
router.post("/", couponsController.createCoupon);
router.put("/:id", couponsController.updateCoupon);
router.delete("/:id", couponsController.deleteCoupon);

module.exports = router;
