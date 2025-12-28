import express from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validation.middleware.js';
import AuditService from '../../services/audit.service.js';
import { success } from '../../utils/response.utils.js';
import { createPaginatedResponse } from '../../middlewares/pagination.middleware.js';
import { getAuditLogsSchema } from '../../validations/audit.validation.js';
import { OWNER_ADMIN_ROLES } from '../../constants/roleGroups.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(requireAuth());
router.use(requireRole(...OWNER_ADMIN_ROLES));

/**
 * GET /api/v1/audit
 * Get audit logs with filtering and pagination
 * IMPORTANT: Scoped to company for multi-tenant isolation
 */
router.get('/', validate(getAuditLogsSchema), async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      action,
      entityType,
      entityId,
      userId,
      dateFrom,
      dateTo,
    } = req.query;

    const filters = {};
    if (action) filters.action = action;
    if (entityType) filters.entityType = entityType;
    if (entityId) filters.entityId = entityId;
    if (userId) filters.userId = userId;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;

    // ✅ CRITICAL: Enforce company scoping to prevent cross-tenant data access
    const result = await AuditService.getAuditLogs(
      req.user.companyId, // ✅ Always scope to requesting user's company
      filters,
      parseInt(page),
      parseInt(limit)
    );
    const paginatedResponse = createPaginatedResponse(
      result.logs,
      result.pagination.total,
      result.pagination.page,
      result.pagination.limit
    );

    return success(res, 'Audit logs retrieved successfully', paginatedResponse);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/audit/:entityType/:entityId
 * Get audit logs for a specific entity
 * IMPORTANT: Scoped to company for multi-tenant isolation
 */
router.get('/:entityType/:entityId', async (req, res, next) => {
  try {
    const { entityType, entityId } = req.params;
    const { limit = 20 } = req.query;

    // ✅ CRITICAL: Enforce company scoping to prevent cross-tenant data access
    const logs = await AuditService.getEntityAuditLogs(
      req.user.companyId, // ✅ Always scope to requesting user's company
      entityType,
      entityId,
      parseInt(limit)
    );

    return success(res, 'Entity audit logs retrieved successfully', { logs });
  } catch (error) {
    next(error);
  }
});

export default router;
