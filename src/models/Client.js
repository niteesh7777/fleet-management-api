import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    person: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\+?[0-9]{10,14}$/, 'Invalid phone number format'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter a valid email address'],
    },
  },
  { _id: false }
);

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    type: {
      type: String,
      enum: ['corporate', 'individual'],
      default: 'corporate',
    },

    contact: {
      type: contactSchema,
      required: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    gstNo: {
      type: String,
      trim: true,
      match: [/^[0-9A-Z]{15}$/, 'Invalid GST number'],
    },

    notes: {
      type: String,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);


clientSchema.virtual('trips', {
  ref: 'Trip',
  localField: '_id',
  foreignField: 'clientId',
});


clientSchema.index({ 'contact.phone': 1 });
clientSchema.index({ gstNo: 1 });

const Client = mongoose.model('Client', clientSchema);
export default Client;
