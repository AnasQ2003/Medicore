const { executeQuery } = require('../config/db');

class Notification {
  static async findByUser(userId) {
    const query = `
      SELECT * FROM Notifications 
      WHERE userId = @userId 
      ORDER BY createdAt DESC
    `;
    const result = await executeQuery(query, { userId });
    return result.recordset.map(r => ({
      id: r.id,
      title: r.title,
      body: r.body,
      type: r.type,
      unread: r.unread,
      time: this.formatTimeAgo(r.createdAt)
    }));
  }

  static async create(notifyData) {
    const { userId, title, body, type } = notifyData;
    const query = `
      INSERT INTO Notifications (userId, title, body, type, unread)
      OUTPUT INSERTED.*
      VALUES (@userId, @title, @body, @type, 1)
    `;
    const result = await executeQuery(query, { userId, title, body, type });
    return result.recordset[0];
  }

  static async markAsRead(id) {
    const query = `UPDATE Notifications SET unread = 0 WHERE id = @id`;
    await executeQuery(query, { id });
  }

  static async markAllAsRead(userId) {
    const query = `UPDATE Notifications SET unread = 0 WHERE userId = @userId`;
    await executeQuery(query, { userId });
  }

  static formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  }
}

module.exports = Notification;
