const Users = require('../../model/userModel');
const { AppError, catchAsync } = require('@utils/tdb_globalutils');
const {
  ERRORS,
  STATUS_CODE,
  SUCCESS_MSG,
  STATUS,
} = require('@constants/tdb-constants');
const { uploadS3 } = require('@utils/tdb_globalutils');

// To filter unwanted fields from req.body
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const result = await Users.find();

  if (!result) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND), STATUS_CODE.NOT_FOUND);
  }

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL,
    total: result.length,
    data: {
      result,
    },
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  res.send(ERRORS.INVALID.NOT_FOUND);
});

exports.getUser = catchAsync(async (req, res, next) => {
  const result = await Users.findById(req.params.id);

  if (!result) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND), STATUS_CODE.NOT_FOUND);
  }

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL,
    data: {
      result,
    },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const result = await Users.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });

  if (!result)
    return next(new AppError(ERRORS.INVALID.NOT_FOUND), STATUS_CODE.NOT_FOUND);

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL,
    data: {
      result,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const result = await Users.findByIdAndDelete(req.params.id);

  if (!result) {
    return next(new AppError(ERRORS.INVALID.NOT_FOUND), STATUS_CODE.NOT_FOUND);
  }

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.OPERATION_SUCCESSFULL,
    data: null,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // Create error if user tying to change/update passowrd data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(ERRORS.INVALID.INVALID_ROUTE, STATUS_CODE.BAD_REQUEST),
    );
  }

  // Image Upload
  if (req.file) {
    let { Location } = await uploadS3(
      req.file,
      process.env.AWS_BUCKET_REGION,
      process.env.AWS_ACCESS_KEY,
      process.env.AWS_SECRET_KEY,
      process.env.AWS_BUCKET_NAME,
    );
    req.body.image = Location;
  }

  // filter out fileds that cannot be updated e.g Role etc
  const filteredBody = filterObj(
    req.body,
    'displayName',
    'firstName',
    'middleName',
    'lastName',
    'image',
    'gender',
    'country',
    'city',
    'dateOfBirth',
  );

  // Update User document
  const user = await Users.findByIdAndUpdate(req.user.id, filteredBody, {
    runValidators: true,
    new: true,
  });

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.UPDATE,
    result: {
      user,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await Users.findByIdAndUpdate(req.user.id, { active: false });

  res.status(STATUS_CODE.OK).json({
    status: STATUS.SUCCESS,
    message: SUCCESS_MSG.SUCCESS_MESSAGES.USER_DELETED,
  });
});
