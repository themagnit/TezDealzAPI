const Ticket = require('../../models/ticket/ticketModel');
const Validator = require('email-validator');
const { AppError, catchAsync } = require('@utils/tdb_globalutils');
const { STATUS, STATUS_CODE, SUCCESS_MSG, ERRORS } = require('@constants/tdb-constants');
const { filter } = require('../factory/factoryHandler');
const { regex } = require('../../utils/regex');

// Importing log files
var log4js = require("log4js");
log4js.configure({
  "appenders": {
    "app": { "type": "file", "filename": "../../app.log" }
  },
  "categories": {
    "default": {
      "appenders": ["app"],
      "level": "all"
    }
  }
});
var logger = log4js.getLogger("Ads");

exports.createTechAssistance = catchAsync(async (req, res, next) => {
  if (req.user) {
    req.body.email = req.user.email;
    req.body.phone = req.user.phone;
    req.body.user_id = req.user._id;
  } else {
    const { email, phone } = req.body;
    if (!email || !phone) {
      logger.error("Custom Error Message")
      return next(new AppError(ERRORS.REQUIRED.EMAIL_AND_PHONE_REQUIRED, STATUS_CODE.BAD_REQUEST));
    }
  }
  if (!req.body.description) {
    logger.error("Custom Error Message")
    return next(new AppError(ERRORS.REQUIRED.DESCRIPTION_REQUIRED, STATUS_CODE.BAD_REQUEST));
  }
  req.body.type = 'Technical Assistance';
  if (regex.pakPhone.test(req.body.phone) && Validator.validate(req.body.email)) {
    try{
    const result = await Ticket.create(req.body);

    if (!result) {
      logger.error("Custom Error Message")
      return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
    }

    res.status(STATUS_CODE.CREATED).json({
      status: STATUS.SUCCESS,
      message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL,
      data: {
        result,
      },
    });
  }
    catch(e){
      logger.error("Custom Error Message")
    logger.trace("Something unexpected has occured.", e)
    }
  } else {
    logger.error("Custom Error Message")
    return next(
      new AppError('Please Provide valid Email or Phone Number', STATUS_CODE.BAD_REQUEST),
    );
  }
});

exports.createAdvAssistance = catchAsync(async (req, res, next) => {
  req.body.email = req.user.email;
  req.body.phone = req.user.phone;
  req.body.user_id = req.user._id;
  req.body.type = 'Advertisement Assistance';
  const result = await Ticket.create(req.body);
  if (!result) return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));

  res.status(STATUS_CODE.CREATED).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL,
    data: {
      result,
    },
  });
});

exports.getAll = catchAsync(async (req, res, next) => {
  try{
  const [result, totalCount] = await filter(Ticket.find(), req.query);

  if (result.length <= 0) {
    logger.error("Custom Error Message")
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }
}
catch(e){
  logger.error("Custom Error Message")
    logger.trace("Something unexpected has occured.", e)
}

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL,
    countOnPage: result.length,
    totalCount: totalCount,
    data: {
      result,
    },
  });
});

exports.getOne = catchAsync(async (req, res, next) => {
  try{
  const result = await Ticket.findById(req.params.id);
  }catch(e){
    logger.error("Custom Error Message")
    logger.trace("Something unexpected has occured.", e)
  }
  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL,
    data: {
      result,
    },
  });
});

exports.deleteOne = catchAsync(async (req, res, next) => {
  try{
  const result = await Ticket.findByIdAndDelete(req.params.id);
  if (!result){
 return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }
}
  catch(e){
    logger.error("Custom Error Message")
    logger.trace("Something unexpected has occured.", e)
  }
  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL,
    data: null,
  });
});

exports.updateOne = catchAsync(async (req, res, next) => {
  try{
  const result = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!result) {
    logger.error("Custom Error Message")
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }
}
  catch(e){
    logger.error("Custom Error Message")
    logger.trace("Something unexpected has occured.", e)
  }
  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.UPDATE,
    data: {
      result,
    },
  });
});

exports.closeTicket = catchAsync(async (req, res, next) => {
  try{
  const data = await Ticket.findOne({ _id: req.params.id, status: 'opened' });
  if (!data) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND, STATUS_CODE.NOT_FOUND));
  }
  const result = await Ticket.findByIdAndUpdate(
    req.params.id,
    {
      status: 'closed',
      closedAt: new Date(),
    },
    { new: true },
  );
}
catch(e){
  logger.error("Custom Error Message")
    logger.trace("Something unexpected has occured.", e)
}

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: 'Ticket Closed successfully',
    data: {
      result,
    },
  });
});
