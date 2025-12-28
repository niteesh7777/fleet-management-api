import AuditLog from '../models/AuditLog.js';

class AuditService {
  /**
   * Log a driver assignment action
   * @param {string} driverId - The ID of the driver being assigned
   * @param {string} tripId - The ID of the trip
   * @param {string} userId - The ID of the user performing the action
   * @param {string} companyId - The company ID for multi-tenant isolation
   * @param {Object} metadata - Additional metadata
   */
  static async logDriverAssignment(driverId, tripId, userId, companyId, metadata = {}) {
    try {
      const auditLog = new AuditLog({
        action: 'driver_assignment',
        entityType: 'trip',
        entityId: tripId,
        userId,
        companyId, // ✅ REQUIRED for multi-tenant compliance
        metadata: {
          driverId,
          ...metadata,
        },
      });
      await auditLog.save();
    } catch (error) {
      console.error('Failed to log driver assignment:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  /**
   * Log a trip completion action
   * @param {string} tripId - The ID of the completed trip
   * @param {string} userId - The ID of the user performing the action
   * @param {string} companyId - The company ID for multi-tenant isolation
   * @param {Object} oldValue - Previous trip state
   * @param {Object} newValue - New trip state
   * @param {Object} metadata - Additional metadata
   */
  static async logTripCompletion(
    tripId,
    userId,
    companyId,
    oldValue = null,
    newValue = null,
    metadata = {}
  ) {
    try {
      const auditLog = new AuditLog({
        action: 'trip_completion',
        entityType: 'trip',
        entityId: tripId,
        userId,
        companyId, // ✅ REQUIRED for multi-tenant compliance
        oldValue,
        newValue,
        metadata,
      });
      await auditLog.save();
    } catch (error) {
      console.error('Failed to log trip completion:', error);
    }
  }

  /**
   * Log a vehicle status change action
   * @param {string} vehicleId - The ID of the vehicle
   * @param {string} userId - The ID of the user performing the action
   * @param {string} companyId - The company ID for multi-tenant isolation
   * @param {string} oldStatus - Previous vehicle status
   * @param {string} newStatus - New vehicle status
   * @param {Object} metadata - Additional metadata
   */
  static async logVehicleStatusChange(
    vehicleId,
    userId,
    companyId,
    oldStatus,
    newStatus,
    metadata = {}
  ) {
    try {
      const auditLog = new AuditLog({
        action: 'vehicle_status_change',
        entityType: 'vehicle',
        entityId: vehicleId,
        userId,
        companyId, // ✅ REQUIRED for multi-tenant compliance
        oldValue: { status: oldStatus },
        newValue: { status: newStatus },
        metadata,
      });
      await auditLog.save();
    } catch (error) {
      console.error('Failed to log vehicle status change:', error);
    }
  }

  /**
   * Generic audit logging method with company scoping
   * @param {string} action - The action performed
   * @param {string} entityType - Type of entity affected
   * @param {string} entityId - ID of the entity
   * @param {string} userId - The user who performed the action
   * @param {string} companyId - The company ID for multi-tenant isolation
   * @param {Object} data - Additional audit data (oldValue, newValue, metadata)
   */
  static async logAction(action, entityType, entityId, userId, companyId, data = {}) {
    try {
      const auditLog = new AuditLog({
        action,
        entityType,
        entityId,
        userId,
        companyId, // ✅ REQUIRED for multi-tenant compliance
        ...data, // Spread: oldValue, newValue, metadata, etc.
      });
      await auditLog.save();
      return auditLog;
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  /**
   * Generic audit logging method
   * @param {Object} auditData - Audit log data
   */
  static async log(auditData) {
    try {
      const auditLog = new AuditLog(auditData);
      await auditLog.save();
      return auditLog;
    } catch (error) {
      console.error('Failed to create audit log:', error);
      throw error;
    }
  }

  /**
   * Get audit logs with filtering and pagination
   * IMPORTANT: Always scoped to a company for multi-tenant isolation
   * @param {string} companyId - The company ID to filter by (REQUIRED)
   * @param {Object} filters - Filter criteria
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   */
  static async getAuditLogs(companyId, filters = {}, page = 1, limit = 50) {
    try {
      const skip = (page - 1) * limit;

      const query = {
        companyId, // ✅ ALWAYS scope to company
      };
      if (filters.action) query.action = filters.action;
      if (filters.entityType) query.entityType = filters.entityType;
      if (filters.entityId) query.entityId = filters.entityId;
      if (filters.userId) query.userId = filters.userId;
      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
        if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
      }

      const total = await AuditLog.countDocuments(query);
      const logs = await AuditLog.find(query)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return {
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Failed to get audit logs:', error);
      throw error;
    }
  }

  /**
   * Get audit logs for a specific entity
   * IMPORTANT: Always scoped to a company for multi-tenant isolation
   * @param {string} companyId - The company ID to filter by (REQUIRED)
   * @param {string} entityType - Type of entity
   * @param {string} entityId - Entity ID
   * @param {number} limit - Maximum number of logs to return
   */
  static async getEntityAuditLogs(companyId, entityType, entityId, limit = 20) {
    try {
      return await AuditLog.find({
        companyId, // ✅ ALWAYS scope to company
        entityType,
        entityId,
      })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      console.error('Failed to get entity audit logs:', error);
      throw error;
    }
  }
}

export default AuditService;
