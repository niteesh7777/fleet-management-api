// src/services/admin.service.js
import AuthService from './auth.service.js';
import DriverService from './driver.service.js';

export default class AdminService {
  constructor() {
    this.authService = new AuthService();
    this.driverService = new DriverService();
  }

  async createDriverComposite(data) {
    // 1. Create User (role = driver)
    const user = await this.authService.register({
      name: data.name,
      email: data.email,
      password: data.password,
      role: 'driver',
    });

    // 2. Create DriverProfile
    const profile = await this.driverService.createDriver({
      userId: user.id,
      licenseNo: data.licenseNo,
      contact: {
        phone: data.phone,
        address: data.address || '',
      },
      experienceYears: data.experienceYears,
      status: 'inactive',
    });

    return { user, profile };
  }
}
