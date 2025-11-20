import { error as errorResponse } from '../utils/response.utils.js';

// BUG // value of the object inside console error is undefined 

export default (err, req, res, next) => {
  console.error('Error Details:', {
    name: err.name,
    message: err.message,
    status: err.statusCode || err.status,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  const isProduction = process.env.NODE_ENV === 'production';
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  const errorDetails = isProduction ? { 
    name: err.name 
  } : { 
    name: err.name, 
    message: err.message, 
    stack: err.stack 
  };

  return errorResponse(res, message, status, errorDetails);
};
