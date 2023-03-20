const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { paymentController } = require('../../controllers');
const { paymentValidation } = require('../../validations');

const router = express.Router();

router.route('/').post(auth(), validate(paymentValidation.createPayment), paymentController.createPayment);

// router.route('/webhook').post(paymentController.paymentWebhook);

module.exports = router;
