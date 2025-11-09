// models/MaintenanceLog.js
import mongoose from 'mongoose';

const maintenanceLogSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
      index: true,
    },

    serviceType: {
      type: String,
      enum: [
        'oil-change',
        'engine-check',
        'tire-replacement',
        'brake-service',
        'accident-repair',
        'general-service',
        'pollution-check',
        'insurance-renewal',
        'other',
      ],
      default: 'general-service',
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    serviceDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    cost: {
      type: Number,
      required: true,
      min: 0,
    },

    nextDueDate: {
      type: Date,
      default: null,
    },

    odometerReadingKm: {
      type: Number,
      min: 0,
    },

    vendor: {
      name: { type: String, trim: true },
      contact: { type: String, trim: true },
      address: { type: String, trim: true },
    },

    attachments: [
      {
        url: { type: String, trim: true },
        fileType: { type: String, trim: true },
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Admin or fleet manager who recorded this
      required: true,
    },

    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// ===============================
// 🧩 Indexes & Virtuals
// ===============================

maintenanceLogSchema.index({ serviceDate: -1 });
maintenanceLogSchema.index({ nextDueDate: 1 });

// Virtual populate to easily access vehicle details
maintenanceLogSchema.virtual('vehicle', {
  ref: 'Vehicle',
  localField: 'vehicleId',
  foreignField: '_id',
  justOne: true,
});

const MaintenanceLog = mongoose.model('MaintenanceLog', maintenanceLogSchema);
export default MaintenanceLog;
