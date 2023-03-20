const httpStatus = require('http-status');
const axios = require('axios');
const config = require('../config/config');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { paymentService, userService } = require('../services');

const createPayment = catchAsync(async (req, res) => {
  const { paymentReference } = req.body;

  // paystackReference, paymentStatus, amount, meta;

  const { data } = await axios.get(`https://api.paystack.co/transaction/verify/${paymentReference}`, {
    headers: {
      Authorization: `Bearer ${config.paystack.secretKey}`,
    },
  });
  const paymentData = data.data;

  if (paymentData.status !== 'success' || paymentData.reference !== paymentReference) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Payment failed');
  }

  const amount = paymentData.amount / 100;

  const paymentPayload = {
    meta: data,
    amount,
    paymentStatus: paymentData.status,
    paystackReference: paymentData.reference,
    paymentReference,
    user: req.user.id,
  };

  const user = await userService.addCredits(req.user.id, amount);

  const payment = await paymentService.createPayment(paymentPayload);

  // eslint-disable-next-line
  io.emit(`credits-${user.id}`, user);

  res.status(httpStatus.CREATED).send(payment);
});

// const paymentWebhook = catchAsync(async (req, res) => {});

module.exports = {
  createPayment,
  // paymentWebhook,
};
