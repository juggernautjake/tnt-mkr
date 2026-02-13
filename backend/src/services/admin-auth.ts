/**
 * Shared admin authentication check.
 * Extracted from shipping controller — can be reused by any admin-only endpoint.
 */
import { Context } from 'koa';

const ADMIN_ROLES = new Set(['admin', 'administrator']);

export async function isAdmin(ctx: Context): Promise<boolean> {
  const { user } = ctx.state;

  if (!user) {
    return false;
  }

  try {
    const userWithRole = await strapi.entityService.findOne('plugin::users-permissions.user', user.id, {
      populate: ['role'],
    });

    if (!userWithRole?.role) {
      return false;
    }

    const role = userWithRole.role as any;
    const roleName = (role.name || '').toLowerCase();
    const roleType = (role.type || '').toLowerCase();

    return ADMIN_ROLES.has(roleName) || ADMIN_ROLES.has(roleType);
  } catch (error) {
    strapi.log.error('Error checking admin role:', error);
    return false;
  }
}
