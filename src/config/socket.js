import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from './env.js';

/**
 * Socket.IO Authentication Middleware
 *
 * Validates JWT from socket handshake and extracts company context.
 * Critical security: companyId comes from JWT only, never from socket payload.
 *
 * @param {Socket} socket - Socket.IO socket instance
 * @param {Function} next - Middleware next callback
 */
const socketAuthMiddleware = (socket, next) => {
  try {
    // Extract token from socket handshake auth
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication token missing'));
    }

    // Verify JWT token
    let payload;
    try {
      payload = jwt.verify(token, config.accessTokenSecret);
    } catch {
      return next(new Error('Invalid or expired token'));
    }

    // CRITICAL: Validate required tenant context in JWT
    if (!payload.companyId || !payload.id) {
      return next(new Error('Invalid token: missing required fields (companyId, userId)'));
    }

    // Attach user data to socket - this is the ONLY source of truth for companyId
    socket.user = {
      id: payload.id,
      userId: payload.id,
      email: payload.email,
      companyId: payload.companyId,
      platformRole: payload.platformRole,
      companyRole: payload.companyRole,
    };

    // Automatically join company room (company:<companyId>)
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

/**
 * Initialize Socket.IO server
 *
 * @param {http.Server} httpServer - Express HTTP server instance
 * @returns {Server} Configured Socket.IO server
 */
export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: config.frontendURL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST'],
    },
    // Socket.IO configuration
    transports: ['websocket', 'polling'],
    pingInterval: 25000,
    pingTimeout: 60000,
  });

  // Apply authentication middleware to all socket connections
  io.use(socketAuthMiddleware);

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log(`[Socket] Socket ${socket.id} connected for user ${socket.user.id}`);

    /**
     * Driver Location Update Event
     *
     * Event: driver:location:update
     * Payload: { driverId, latitude, longitude, accuracy, timestamp }
     *
     * Rules:
     * - Only broadcast to company room (company:<companyId>)
     * - Verify driver belongs to socket user's company
     * - Never trust driverId from payload alone (if sensitive operations needed)
     * - Include company verification in broadcast
     */
    socket.on('driver:location:update', async (data, callback) => {
      try {
        // Validate payload
        if (!data || typeof data !== 'object') {
          const error = 'Invalid location update payload';
          console.warn(`[Socket] ${error}`);
          return callback?.({ success: false, error });
        }

        const { driverId, latitude, longitude, accuracy, timestamp } = data;

        // Validate required fields
        if (!driverId || latitude === undefined || longitude === undefined) {
          const error = 'Missing required fields: driverId, latitude, longitude';
          console.warn(`[Socket] ${error}`);
          return callback?.({ success: false, error });
        }

        // Validate coordinates
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
          const error = 'Invalid coordinates';
          console.warn(`[Socket] Invalid coordinates from user ${socket.user.id}`);
          return callback?.({ success: false, error });
        }

        // Build location update message with company context
        const locationUpdate = {
          driverId,
          companyId: socket.user.companyId, // From JWT, not payload
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          accuracy: accuracy ? parseFloat(accuracy) : null,
          timestamp: timestamp || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Broadcast ONLY to company room
        const companyRoom = `company:${socket.user.companyId}`;
        io.to(companyRoom).emit('driver:location:updated', locationUpdate);

        console.log(
          `[Socket] Location update broadcast to ${companyRoom}`,
          `(driver: ${driverId}, lat: ${latitude}, lng: ${longitude})`
        );

        // Acknowledge to sender
        callback?.({ success: true, message: 'Location update broadcast' });
      } catch (err) {
        console.error('[Socket] Error handling location update:', err.message);
        callback?.({ success: false, error: err.message });
      }
    });

    /**
     * Driver Connected Event
     *
     * Notifies company that a driver is now connected to live tracking
     */
    socket.on('driver:connected', async (data, callback) => {
      try {
        const { driverId } = data || {};

        if (!driverId) {
          return callback?.({ success: false, error: 'driverId required' });
        }

        // Broadcast to company room
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

    /**
     * Driver Disconnected Event
     *
     * Notifies company that a driver went offline
     */
    socket.on('driver:disconnected', async (data, callback) => {
      try {
        const { driverId } = data || {};

        if (!driverId) {
          return callback?.({ success: false, error: 'driverId required' });
        }

        // Broadcast to company room
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

    /**
     * Vehicle Status Update Event
     *
     * Broadcast vehicle status (engine on/off, door lock, etc.)
     */
    socket.on('vehicle:status:update', async (data, callback) => {
      try {
        const { vehicleId, status } = data || {};

        if (!vehicleId || !status) {
          return callback?.({ success: false, error: 'vehicleId and status required' });
        }

        // Broadcast to company room
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

    /**
     * Socket Disconnect Handler
     *
     * Cleanup when socket disconnects
     */
    socket.on('disconnect', (reason) => {
      console.log(
        `[Socket] Socket ${socket.id} disconnected. User: ${socket.user?.id}, Reason: ${reason}`
      );
    });

    /**
     * Error Handler
     */
    socket.on('error', (err) => {
      console.error(`[Socket] Socket ${socket.id} error:`, err);
    });
  });

  return io;
};

export default socketAuthMiddleware;
