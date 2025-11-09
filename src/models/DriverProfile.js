
import mongoose from 'mongoose';

const driverProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, 
    },

    licenseNo: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    contact: {
      phone: {
        type: String,
        required: true,
        trim: true,
        match: [/^\+?[0-9]{10,14}$/, 'Invalid phone number'],
      },
      address: {
        type: String,
        trim: true,
      },
    },

    experienceYears: {
      type: Number,
      default: 0,
      min: 0,
    },

    assignedVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
    },

    activeTripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      default: null,
    },

    status: {
      type: String,
      enum: ['active', 'inactive', 'on-trip'],
      default: 'inactive',
    },

    currentLocation: {
      lat: { type: Number },
      lng: { type: Number },
      lastUpdated: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);



driverProfileSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

driverProfileSchema.index({ status: 1 });
driverProfileSchema.index({ 'contact.phone': 1 });

const DriverProfile = mongoose.model('DriverProfile', driverProfileSchema);
export default DriverProfile;
