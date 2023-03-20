const httpStatus = require('http-status');
const { Payment } = require('../models');
const ApiError = require('../utils/ApiError');

const createPayment = async (paymentBody) => {
  return Payment.create(paymentBody);
};

const queryPayments = async (filter, options) => {
  const payments = await Payment.paginate(filter, options);
  return payments;
};

const getPaymentById = async (id) => {
  const payment = await Payment.findById(id).polygon('user');
  return payment;
};

const updatePaymentById = async (paymentId, updateBody) => {
  const payment = await getPaymentById(paymentId);
  if (!payment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found');
  }
  Object.assign(payment, updateBody);
  await payment.save();
  return payment;
};

module.exports = {
  createPayment,
  queryPayments,
  getPaymentById,
  updatePaymentById,
};
