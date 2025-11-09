import User from '../models/User.js';

export default class UserRepository {
  constructor() {
    this.Model = User;
  }

  async findByEmail(email) {
    return this.Model.findOne({ email }).select('+passwordHash +refreshTokenJti');
  }

  async findById(id) {
    return this.Model.findById(id).select('+passwordHash +refreshTokenJti');
  }

  async create(payload) {
    const doc = new this.Model(payload);
    return doc.save();
  }

  async save(userDoc) {
    return userDoc.save();
  }

  async clearRefreshToken(userId) {
    return this.Model.findByIdAndUpdate(userId, { $unset: { refreshTokenJti: '' } }, { new: true });
  }

  async setRefreshTokenJti(userId, jti) {
    return this.Model.findByIdAndUpdate(userId, { refreshTokenJti: jti }, { new: true });
  }
}
