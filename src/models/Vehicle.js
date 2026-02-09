import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    vehicleNo: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9-]+$/, 'Invalid vehicle registration number format'],

    },

    model: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ['Truck', 'Mini Truck', 'Trailer', 'Van', 'Other'],
      default: 'Truck',
    },

    capacityKg: {
      type: Number,
      required: true,
      min: [100, 'Vehicle capacity must be at least 100 kg'],
    },

    status: {
      type: String,
      enum: ['available', 'in-trip', 'maintenance'],
      default: 'available',
      index: true,
    },

    insurance: {
      policyNumber: { type: String, trim: true },
      expiryDate: { type: Date },
    },

    currentTripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      default: null,
    },

    assignedDrivers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DriverProfile',
      },
    ],

    maintenanceLogs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MaintenanceLog',
      },
    ],

    documents: {
      rcBookUrl: { type: String },
      insuranceUrl: { type: String },
      pollutionCertUrl: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

vehicleSchema.virtual('activeTrip', {
  ref: 'Trip',
  localField: 'currentTripId',
  foreignField: '_id',
  justOne: true,
});

vehicleSchema.virtual('drivers', {
  ref: 'DriverProfile',
  localField: 'assignedDrivers',
  foreignField: '_id',
});

vehicleSchema.index({ companyId: 1, vehicleNo: 1 }, { unique: true });
vehicleSchema.index({ companyId: 1, status: 1 });
vehicleSchema.index({ companyId: 1, createdAt: -1 });

vehicleSchema.methods.isInsuranceExpired = function () {
  if (!this.insurance?.expiryDate) return false;
  return new Date() > new Date(this.insurance.expiryDate);
};

vehicleSchema.methods.markAvailable = function () {
  this.status = 'available';
  this.currentTripId = null;
  return this.save();
};

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
