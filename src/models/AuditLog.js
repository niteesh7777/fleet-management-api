import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'driver_assignment',
        'trip_completion',
        'vehicle_status_change',
        'user_creation',
        'user_update',
        'user_deletion',
        'vehicle_creation',
        'vehicle_update',
        'vehicle_deletion',
        'trip_creation',
        'trip_update',
        'trip_deletion',
      ],
    },
    entityType: {
      type: String,
      required: true,
      enum: ['user', 'driver', 'vehicle', 'trip', 'maintenance', 'route', 'client'],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ companyId: 1, action: 1, createdAt: -1 });
auditLogSchema.index({ companyId: 1, entityType: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ companyId: 1, userId: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
