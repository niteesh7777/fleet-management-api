import mongoose from 'mongoose';
import argon2 from 'argon2';

const userSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      // Note: Unique constraint removed - now scoped by companyId via compound index
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    platformRole: {
      type: String,
      enum: ['platform_admin', 'platform_support', 'user'],
      default: 'user',
    },
    companyRole: {
      type: String,
      enum: ['company_owner', 'company_admin', 'company_manager', 'company_driver', 'company_user'],
      default: 'company_user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshTokenJti: {
      type: String,
      select: false,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash') || this.passwordHash.startsWith('$argon2')) return next();

  try {
    this.passwordHash = await argon2.hash(this.passwordHash);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.verifyPassword = async function (plainPassword) {
  return await argon2.verify(this.passwordHash, plainPassword);
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

userSchema.index({ refreshTokenJti: 1 });
// Compound unique index: same email can exist across different companies
userSchema.index({ companyId: 1, email: 1 }, { unique: true });
userSchema.index({ companyId: 1, platformRole: 1 });

const User = mongoose.model('User', userSchema);
export default User;
