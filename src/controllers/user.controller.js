import User from '../models/User.js';
import AuditService from '../services/audit.service.js';
import { createPaginatedResponse } from '../middlewares/pagination.middleware.js';
import AppError from '../utils/appError.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments();
    const users = await User.find()
      .select('-passwordHash -refreshTokenJti')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const response = createPaginatedResponse(users, page, limit, totalUsers);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash -refreshTokenJti');
    if (!user) {
      throw new AppError('User not found', 404);
    }
    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, role = 'driver', password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    const user = new User({
      name,
      email,
      role,
      passwordHash: password,
    });

    await user.save();

    const userResponse = await User.findById(user._id).select('-passwordHash -refreshTokenJti');

    const creatorId = req.user?.id || req.user?._id;
    await AuditService.log({
      action: 'user_creation',
      entityType: 'user',
      entityId: user._id,
      userId: creatorId,
      newValue: { name, email, role },
      metadata: { createdBy: creatorId },
    });

    res.status(201).json({
      status: 'success',
      data: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;
    const userId = req.params.id;

    const originalUser = await User.findById(userId).select('-passwordHash -refreshTokenJti');

    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        throw new AppError('Email already in use', 400);
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, email, role },
      { new: true, runValidators: true }
    ).select('-passwordHash -refreshTokenJti');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updaterId = req.user?.id || req.user?._id;
    await AuditService.log({
      action: 'user_update',
      entityType: 'user',
      entityId: userId,
      userId: updaterId,
      oldValue: { name: originalUser.name, email: originalUser.email, role: originalUser.role },
      newValue: { name, email, role },
      metadata: { updatedBy: updaterId },
    });

    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {

    const userToDelete = await User.findById(req.params.id).select(
      '-passwordHash -refreshTokenJti'
    );

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const deleterId = req.user?.id || req.user?._id;
    await AuditService.log({
      action: 'user_deletion',
      entityType: 'user',
      entityId: req.params.id,
      userId: deleterId,
      oldValue: { name: userToDelete.name, email: userToDelete.email, role: userToDelete.role },
      metadata: { deletedBy: deleterId },
    });

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      status: 'success',
      data: {
        _id: user._id,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};
