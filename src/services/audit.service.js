import AuditLog from '../models/AuditLog.js';

class AuditService {

  static async logDriverAssignment(driverId, tripId, userId, companyId, metadata = {}) {
    try {
      const auditLog = new AuditLog({
        action: 'driver_assignment',
        entityType: 'trip',
        entityId: tripId,
        userId,
        companyId,
        metadata: {
          driverId,
          ...metadata,
        },
      });
      await auditLog.save();
    } catch (error) {
      console.error('Failed to log driver assignment:', error);

    }
  }

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
        companyId,
        oldValue,
        newValue,
        metadata,
      });
      await auditLog.save();
    } catch (error) {
      console.error('Failed to log trip completion:', error);
    }
  }

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
        companyId,
        oldValue: { status: oldStatus },
        newValue: { status: newStatus },
        metadata,
      });
      await auditLog.save();
    } catch (error) {
      console.error('Failed to log vehicle status change:', error);
    }
  }

  static async logAction(action, entityType, entityId, userId, companyId, data = {}) {
    try {
      const auditLog = new AuditLog({
        action,
        entityType,
        entityId,
        userId,
        companyId,
        ...data,
      });
      await auditLog.save();
      return auditLog;
    } catch (error) {
      console.error('Failed to create audit log:', error);

    }
  }

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

  static async getAuditLogs(companyId, filters = {}, page = 1, limit = 50) {
    try {
      const skip = (page - 1) * limit;

      const query = {
        companyId,
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

  static async getEntityAuditLogs(companyId, entityType, entityId, limit = 20) {
    try {
      return await AuditLog.find({
        companyId,
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
