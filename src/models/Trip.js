import mongoose from 'mongoose';

const progressUpdateSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    location: {
      lat: Number,
      lng: Number,
    },
    note: { type: String, trim: true },
    status: {
      type: String,
      enum: ['started', 'in-transit', 'delayed', 'arrived', 'completed'],
      default: 'in-transit',
    },
  },
  { _id: false }
);

const tripSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    tripCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,

    },

    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      required: true,
    },

    vehicleIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
      },
    ],

    driverIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DriverProfile',
      },
    ],

    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },

    goodsInfo: {
      type: String,
      required: true,
      trim: true,
    },

    loadWeightKg: {
      type: Number,
      required: true,
      min: 0,
    },

    tripCost: {
      type: Number,
      required: true,
      min: 0,
    },

    startTime: Date,
    endTime: Date,

    status: {
      type: String,
      enum: ['scheduled', 'started', 'in-transit', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },

    progressUpdates: [progressUpdateSchema],

    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

tripSchema.index({ startTime: 1, endTime: 1 });

tripSchema.virtual('route', {
  ref: 'Route',
  localField: 'routeId',
  foreignField: '_id',
  justOne: true,
});

tripSchema.virtual('vehicles', {
  ref: 'Vehicle',
  localField: 'vehicleIds',
  foreignField: '_id',
});

tripSchema.virtual('drivers', {
  ref: 'DriverProfile',
  localField: 'driverIds',
  foreignField: '_id',
});

tripSchema.virtual('client', {
  ref: 'Client',
  localField: 'clientId',
  foreignField: '_id',
  justOne: true,
});

tripSchema.index({ companyId: 1, tripCode: 1 }, { unique: true });
tripSchema.index({ companyId: 1, status: 1 });
tripSchema.index({ companyId: 1, createdAt: -1 });
tripSchema.index({ companyId: 1, clientId: 1 });
tripSchema.index({ companyId: 1, routeId: 1 });

tripSchema.methods.addProgressUpdate = async function (updateData) {
  this.progressUpdates.push(updateData);
  await this.save();
  return this;
};

tripSchema.methods.markCompleted = async function () {
  this.status = 'completed';
  this.endTime = new Date();
  await this.save();
  return this;
};

const Trip = mongoose.model('Trip', tripSchema);
export default Trip;
