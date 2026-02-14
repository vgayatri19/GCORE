const Notification = require('../models/Notification');

const createNotification = async (payload) => Notification.create(payload);

module.exports = { createNotification };
