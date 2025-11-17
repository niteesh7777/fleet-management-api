import { error as errorResponse } from '../utils/response.utils.js';

export default (err, req, res) => {
  console.error(err);

  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  return errorResponse(res, message, status);
};
