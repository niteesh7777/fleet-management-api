import mongoose from 'mongoose';
import { DEFAULT_PLAN, COMPANY_STATUS } from '../constants/plans.js';

const companySchema = new mongoose.Schema(
  {

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'],
    },
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    plan: {
      type: String,
      enum: ['free', 'starter', 'professional', 'enterprise'],
      default: DEFAULT_PLAN,
    },
    status: {
      type: String,
      enum: [COMPANY_STATUS.ACTIVE, COMPANY_STATUS.SUSPENDED, COMPANY_STATUS.CANCELLED],
      default: COMPANY_STATUS.ACTIVE,
    },

    subscriptionId: {
      type: String,
      default: null,

    },
    subscriptionStartDate: {
      type: Date,
      default: () => new Date(),
    },
    subscriptionEndDate: {
      type: Date,
      default: null,

    },
    trialEndsAt: {
      type: Date,
      default: null,

    },
    lastPlanChangeDate: {
      type: Date,
      default: () => new Date(),
    },

    billingEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
    },

    resourceUsage: {
      vehiclesCreatedThisMonth: {
        type: Number,
        default: 0,
      },
      driversCreatedThisMonth: {
        type: Number,
        default: 0,
      },
      usersCreatedThisMonth: {
        type: Number,
        default: 0,
      },
      tripsCompletedThisMonth: {
        type: Number,
        default: 0,
      },
      lastUsageReset: {
        type: Date,
        default: () => new Date(),
      },
    },

    suspensionReason: {
      type: String,
      default: null,
    },
    suspendedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

companySchema.index({ ownerUserId: 1 });
companySchema.index({ status: 1 });
companySchema.index({ createdAt: -1 });

const Company = mongoose.model('Company', companySchema);
export default Company;
