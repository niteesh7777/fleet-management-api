import mongoose from 'mongoose';
import argon2 from 'argon2';

const userSchema = new mongoose.Schema(
  {
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
      unique: true,
      lowercase: true,
      trim: true,

    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'driver'],
      required: true,
      default: 'driver',
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

// userSchema.pre('save', async function (next) {
//   if (!this.isModified('passwordHash')) return next();
//   try {
//     this.passwordHash = await argon2.hash(this.passwordHash);
//   } catch (err) {
//     next(err);
//   }
// });

userSchema.methods.verifyPassword = async function (plainPassword) {
  return await argon2.verify(this.passwordHash, plainPassword);
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

userSchema.index({ refreshTokenJti: 1 });

const User = mongoose.model('User', userSchema);
export default User;
