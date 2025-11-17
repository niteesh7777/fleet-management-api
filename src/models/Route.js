import mongoose from 'mongoose';

const waypointSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    stopDurationMin: { type: Number, default: 0 }, // optional rest time or stop
  },
  { _id: false }
);

const tollSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    cost: { type: Number, default: 0 },
  },
  { _id: false }
);

const routeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    source: {
      name: { type: String, required: true, trim: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },

    destination: {
      name: { type: String, required: true, trim: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },

    waypoints: [waypointSchema],

    distanceKm: {
      type: Number,
      required: true,
      min: [1, 'Distance must be greater than 0'],
    },

    estimatedDurationHr: {
      type: Number,
      required: true,
      min: [0.1, 'Duration must be greater than 0'],
    },

    tolls: [tollSchema],

    preferredVehicleTypes: [
      {
        type: String,
        enum: ['Truck', 'Mini Truck', 'Trailer', 'Van', 'Other'],
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

routeSchema.index({ 'source.name': 1, 'destination.name': 1 });

routeSchema.virtual('trips', {
  ref: 'Trip',
  localField: '_id',
  foreignField: 'routeId',
});

const Route = mongoose.model('Route', routeSchema);
export default Route;
