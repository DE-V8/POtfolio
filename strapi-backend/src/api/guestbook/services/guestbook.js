const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::guestbook.guestbook');
