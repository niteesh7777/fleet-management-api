import mongoose from 'mongoose';
import { DEFAULT_PLAN, COMPANY_STATUS } from '../constants/plans.js';

const companySchema = new mongoose.Schema(
  {
    // Basic Information
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

    // Subscription & Plan Information
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

    // Subscription Metadata
    subscriptionId: {
      type: String,
      default: null,
      // For future integration with payment providers (Stripe, etc.)
    },
    subscriptionStartDate: {
      type: Date,
      default: () => new Date(),
    },
    subscriptionEndDate: {
      type: Date,
      default: null,
      // For trial or limited-time plans
    },
    trialEndsAt: {
      type: Date,
      default: null,
      // For free trial tracking
    },
    lastPlanChangeDate: {
      type: Date,
      default: () => new Date(),
    },

    // Billing Information
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

    // Usage Tracking
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

    // Suspension Reason (when status is suspended)
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

// Indexes
// Note: slug already has unique index from schema definition
companySchema.index({ ownerUserId: 1 });
companySchema.index({ status: 1 });
companySchema.index({ createdAt: -1 });

const Company = mongoose.model('Company', companySchema);
export default Company;
