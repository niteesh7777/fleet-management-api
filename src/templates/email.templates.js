export const emailTemplates = {

  welcome: (data) => ({
    subject: `Welcome to Fleet Management - ${data.companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to Fleet Management! 🚛</h2>
        <p>Hi ${data.ownerName},</p>
        <p>Thank you for signing up with Fleet Management. Your company <strong>${data.companyName}</strong> is now ready to go!</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your Account Details:</h3>
          <p><strong>Company:</strong> ${data.companyName}</p>
          <p><strong>Plan:</strong> ${data.plan.toUpperCase()}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          ${data.trialEndsAt ? `<p><strong>Trial Ends:</strong> ${new Date(data.trialEndsAt).toLocaleDateString()}</p>` : ''}
        </div>

        <p><strong>Next Steps:</strong></p>
        <ol>
          <li>Add your vehicles to the fleet</li>
          <li>Create driver profiles</li>
          <li>Set up your first route</li>
          <li>Start tracking trips in real-time</li>
        </ol>

        <a href="${process.env.FRONTEND_URL}/dashboard" 
           style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Go to Dashboard
        </a>

        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Need help? Reply to this email or visit our support center.
        </p>
      </div>
    `,
    text: `Welcome to Fleet Management!\n\nHi ${data.ownerName},\n\nThank you for signing up. Your company ${data.companyName} is ready!\n\nPlan: ${data.plan}\nEmail: ${data.email}\n\nNext steps:\n1. Add vehicles\n2. Create driver profiles\n3. Set up routes\n4. Start tracking\n\nVisit: ${process.env.FRONTEND_URL}/dashboard`,
  }),

  // Password reset email
  'password-reset': (data) => ({
    subject: 'Reset Your Password - Fleet Management',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>Hi ${data.userName},</p>
        <p>We received a request to reset your password for your Fleet Management account.</p>
        
        <a href="${data.resetLink}" 
           style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Reset Password
        </a>

        <p style="color: #6b7280; font-size: 14px;">
          This link will expire in ${data.expiresIn || '1 hour'}.
        </p>

        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          If you didn't request this, please ignore this email.
        </p>
      </div>
    `,
    text: `Password Reset Request\n\nHi ${data.userName},\n\nReset your password: ${data.resetLink}\n\nThis link expires in ${data.expiresIn || '1 hour'}.\n\nIf you didn't request this, ignore this email.`,
  }),

  // Maintenance reminder
  'maintenance-reminder': (data) => ({
    subject: `Maintenance Due - Vehicle ${data.vehicleNo}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ea580c;">🔧 Maintenance Reminder</h2>
        <p>Vehicle <strong>${data.vehicleNo}</strong> requires maintenance attention.</p>
        
        <div style="background: #fff7ed; border-left: 4px solid #ea580c; padding: 20px; margin: 20px 0;">
          <p><strong>Maintenance Type:</strong> ${data.maintenanceType}</p>
          <p><strong>Due Date:</strong> ${new Date(data.dueDate).toLocaleDateString()}</p>
          <p><strong>Current Mileage:</strong> ${data.currentMileage} km</p>
        </div>

        <p>Please schedule this maintenance to keep your fleet running safely and efficiently.</p>

        <a href="${process.env.FRONTEND_URL}/maintenance" 
           style="display: inline-block; background: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          View Maintenance Schedule
        </a>
      </div>
    `,
    text: `Maintenance Reminder\n\nVehicle ${data.vehicleNo} requires maintenance.\n\nType: ${data.maintenanceType}\nDue: ${new Date(data.dueDate).toLocaleDateString()}\nMileage: ${data.currentMileage} km\n\nSchedule at: ${process.env.FRONTEND_URL}/maintenance`,
  }),

  // Trip assignment notification
  'trip-assigned': (data) => ({
    subject: `New Trip Assignment - ${data.tripCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">📍 New Trip Assigned</h2>
        <p>Hi ${data.driverName},</p>
        <p>You have been assigned to a new trip.</p>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Trip Code:</strong> ${data.tripCode}</p>
          <p><strong>Vehicle:</strong> ${data.vehicleNo}</p>
          <p><strong>Route:</strong> ${data.source} → ${data.destination}</p>
          <p><strong>Start Date:</strong> ${new Date(data.scheduledStart).toLocaleDateString()}</p>
          ${data.goodsInfo ? `<p><strong>Goods:</strong> ${data.goodsInfo}</p>` : ''}
        </div>

        <a href="${process.env.FRONTEND_URL}/trips/${data.tripId}" 
           style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          View Trip Details
        </a>
      </div>
    `,
    text: `New Trip Assigned\n\nHi ${data.driverName},\n\nTrip: ${data.tripCode}\nVehicle: ${data.vehicleNo}\nRoute: ${data.source} → ${data.destination}\nStart: ${new Date(data.scheduledStart).toLocaleDateString()}\n\nView at: ${process.env.FRONTEND_URL}/trips/${data.tripId}`,
  }),

  // Subscription expiring soon
  'subscription-expiring': (data) => ({
    subject: `Your ${data.plan} Plan Expires Soon`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">⚠️ Subscription Expiring</h2>
        <p>Hi ${data.ownerName},</p>
        <p>Your <strong>${data.plan}</strong> subscription for ${data.companyName} will expire in ${data.daysRemaining} days.</p>
        
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0;">
          <p><strong>Expiration Date:</strong> ${new Date(data.expiryDate).toLocaleDateString()}</p>
          <p>Renew now to avoid interruption to your fleet management services.</p>
        </div>

        <a href="${process.env.FRONTEND_URL}/subscription" 
           style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Renew Subscription
        </a>
      </div>
    `,
    text: `Subscription Expiring\n\nYour ${data.plan} plan expires in ${data.daysRemaining} days on ${new Date(data.expiryDate).toLocaleDateString()}.\n\nRenew at: ${process.env.FRONTEND_URL}/subscription`,
  }),

  // Plan limit warning
  'plan-limit-warning': (data) => ({
    subject: `Approaching ${data.plan} Plan Limit`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d97706;">⚠️ Plan Limit Warning</h2>
        <p>Hi ${data.ownerName},</p>
        <p>Your company <strong>${data.companyName}</strong> is approaching the limit for your ${data.plan} plan.</p>
        
        <div style="background: #fffbeb; border-left: 4px solid #d97706; padding: 20px; margin: 20px 0;">
          <p><strong>Resource:</strong> ${data.resourceType}</p>
          <p><strong>Current Usage:</strong> ${data.currentCount} / ${data.maxLimit}</p>
          <p><strong>Utilization:</strong> ${Math.round((data.currentCount / data.maxLimit) * 100)}%</p>
        </div>

        <p>Consider upgrading your plan to continue adding ${data.resourceType}.</p>

        <a href="${process.env.FRONTEND_URL}/subscription/upgrade" 
           style="display: inline-block; background: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Upgrade Plan
        </a>
      </div>
    `,
    text: `Plan Limit Warning\n\nYou're approaching your ${data.plan} plan limit.\n\n${data.resourceType}: ${data.currentCount} / ${data.maxLimit} (${Math.round((data.currentCount / data.maxLimit) * 100)}%)\n\nUpgrade at: ${process.env.FRONTEND_URL}/subscription/upgrade`,
  }),
};

// Get template by type
export const getTemplate = (type, data) => {
  const template = emailTemplates[type];
  if (!template) {
    throw new Error(`Email template '${type}' not found`);
  }
  return template(data);
};
