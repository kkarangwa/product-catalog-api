const sendResponse = (res, statusCode, success, message, data = null, pagination = null) => {
  const response = {
    success,
    message,
    ...(data && { data }),
    ...(pagination && { pagination })
  };
  
  res.status(statusCode).json(response);
};

const sendError = (res, statusCode, message) => {
  res.status(statusCode).json({
    success: false,
    message
  });
};

const sendSuccess = (res, message, data = null, pagination = null) => {
  sendResponse(res, 200, true, message, data, pagination);
};

const sendCreated = (res, message, data) => {
  sendResponse(res, 201, true, message, data);
};

module.exports = {
  sendResponse,
  sendError,
  sendSuccess,
  sendCreated
};