import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from './env.js';

const socketAuthMiddleware = (socket, next) => {
  try {

    const cookies = socket.handshake.headers.cookie;
    let token = null;

    if (cookies) {
      const cookieArray = cookies.split(';');
      for (const cookie of cookieArray) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'accessToken') {
          token = value;
          break;
        }
      }
    }

    if (!token) {
      token = socket.handshake.auth.token;
    }

    if (!token) {
      return next(new Error('Authentication token missing'));
    }

    let payload;
    try {
      payload = jwt.verify(token, config.accessTokenSecret);
    } catch {
      return next(new Error('Invalid or expired token'));
    }

    if (!payload.companyId || !payload.id) {
      return next(new Error('Invalid token: missing required fields (companyId, userId)'));
    }

    socket.user = {
      id: payload.id,
      userId: payload.id,
      email: payload.email,
      companyId: payload.companyId,
      platformRole: payload.platformRole,
      companyRole: payload.companyRole,
    };

    const companyRoom = `company:${payload.companyId}`;
    socket.join(companyRoom);

    console.log(`[Socket] User ${payload.id} (company: ${payload.companyId}) connected`);
    console.log(`[Socket] Joined room: ${companyRoom}`);

    next();
  } catch (err) {
    console.error('[Socket] Authentication error:', err.message);
    next(new Error('Socket authentication failed'));
  }
};

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: config.frontendURL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST'],
    },

    transports: ['websocket', 'polling'],
    pingInterval: 25000,
    pingTimeout: 60000,
  });

  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    console.log(`[Socket] Socket ${socket.id} connected for user ${socket.user.id}`);

    socket.on('driver:location:update', async (data, callback) => {
      try {

        if (!data || typeof data !== 'object') {
          const error = 'Invalid location update payload';
          console.warn(`[Socket] ${error}`);
          return callback?.({ success: false, error });
        }

        const { driverId, latitude, longitude, accuracy, timestamp } = data;

        if (!driverId || latitude === undefined || longitude === undefined) {
          const error = 'Missing required fields: driverId, latitude, longitude';
          console.warn(`[Socket] ${error}`);
          return callback?.({ success: false, error });
        }

        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
          const error = 'Invalid coordinates';
          console.warn(`[Socket] Invalid coordinates from user ${socket.user.id}`);
          return callback?.({ success: false, error });
        }

        const locationUpdate = {
          driverId,
          companyId: socket.user.companyId,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          accuracy: accuracy ? parseFloat(accuracy) : null,
          timestamp: timestamp || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const companyRoom = `company:${socket.user.companyId}`;
        io.to(companyRoom).emit('driver:location:updated', locationUpdate);

        console.log(
          `[Socket] Location update broadcast to ${companyRoom}`,
          `(driver: ${driverId}, lat: ${latitude}, lng: ${longitude})`
        );

        callback?.({ success: true, message: 'Location update broadcast' });
      } catch (err) {
        console.error('[Socket] Error handling location update:', err.message);
        callback?.({ success: false, error: err.message });
      }
    });

    socket.on('driver:connected', async (data, callback) => {
      try {
        const { driverId } = data || {};

        if (!driverId) {
          return callback?.({ success: false, error: 'driverId required' });
        }

        const companyRoom = `company:${socket.user.companyId}`;
        io.to(companyRoom).emit('driver:online', {
          driverId,
          companyId: socket.user.companyId,
          status: 'online',
          connectedAt: new Date().toISOString(),
        });

        console.log(`[Socket] Driver ${driverId} online notification to ${companyRoom}`);

        callback?.({ success: true });
      } catch (err) {
        console.error('[Socket] Error in driver:connected:', err.message);
        callback?.({ success: false, error: err.message });
      }
    });

    socket.on('driver:disconnected', async (data, callback) => {
      try {
        const { driverId } = data || {};

        if (!driverId) {
          return callback?.({ success: false, error: 'driverId required' });
        }

        const companyRoom = `company:${socket.user.companyId}`;
        io.to(companyRoom).emit('driver:offline', {
          driverId,
          companyId: socket.user.companyId,
          status: 'offline',
          disconnectedAt: new Date().toISOString(),
        });

        console.log(`[Socket] Driver ${driverId} offline notification to ${companyRoom}`);

        callback?.({ success: true });
      } catch (err) {
        console.error('[Socket] Error in driver:disconnected:', err.message);
        callback?.({ success: false, error: err.message });
      }
    });

    socket.on('vehicle:status:update', async (data, callback) => {
      try {
        const { vehicleId, status } = data || {};

        if (!vehicleId || !status) {
          return callback?.({ success: false, error: 'vehicleId and status required' });
        }

        const companyRoom = `company:${socket.user.companyId}`;
        io.to(companyRoom).emit('vehicle:status:updated', {
          vehicleId,
          companyId: socket.user.companyId,
          status,
          updatedAt: new Date().toISOString(),
        });

        console.log(`[Socket] Vehicle ${vehicleId} status update to ${companyRoom}:`, status);

        callback?.({ success: true });
      } catch (err) {
        console.error('[Socket] Error in vehicle:status:update:', err.message);
        callback?.({ success: false, error: err.message });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(
        `[Socket] Socket ${socket.id} disconnected. User: ${socket.user?.id}, Reason: ${reason}`
      );
    });

    socket.on('error', (err) => {
      console.error(`[Socket] Socket ${socket.id} error:`, err);
    });
  });

  return io;
};

export default socketAuthMiddleware;
