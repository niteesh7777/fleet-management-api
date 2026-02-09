const createResponse = (res, success, message, data = null, status = 200, error = null) => {
  const response = {
    success,
    message,
    statusCode: status
  };

  if (success) {
    if (data !== null) response.data = data;
  } else {
    if (error) response.error = error;
  }

  return res.status(status).json(response);
};

export const success = (res, message, data = null, status = 200) => {
  return createResponse(res, true, message, data, status);
};

export const error = (res, message, status = 500, error = null) => {
  return createResponse(res, false, message, null, status, error);
};
