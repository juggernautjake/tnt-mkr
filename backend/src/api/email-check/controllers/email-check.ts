import { Context } from 'koa';

export default {
  async emailExists(ctx: Context) {
    const { email } = ctx.query;

    if (!email || typeof email !== 'string') {
      return ctx.badRequest('Email is required and must be a string');
    }

    try {
      const count = await strapi.entityService.count('plugin::users-permissions.user', {
        filters: { email },
      });

      return { exists: count > 0 };
    } catch (error) {
      strapi.log.error('Error checking email existence:', error);
      return ctx.internalServerError('Failed to check email existence');
    }
  },
};