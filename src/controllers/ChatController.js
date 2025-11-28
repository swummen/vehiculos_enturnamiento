// Chat Controller - Presentation Layer
const ChatService = require('../services/ChatService');

class ChatController {
  // POST /api/chats
  async sendMessage(req, res) {
    try {
      const { toUserId, message, offerId } = req.body;

      if (!toUserId || !message) {
        return res.status(400).json({
          success: false,
          message: 'toUserId y message son requeridos'
        });
      }

      const result = await ChatService.sendMessage(req.user, {
        toUserId, message, offerId
      });

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ success: false, message: 'Error del servidor' });
    }
  }

  // GET /api/chats?withUser=id
  async getConversation(req, res) {
    try {
      const { withUser } = req.query;

      if (!withUser) {
        return res.status(400).json({
          success: false,
          message: 'withUser query parameter is required'
        });
      }

      const result = await ChatService.getConversation(req.user, withUser);

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Get conversation error:', error);
      res.status(500).json({ success: false, message: 'Error del servidor' });
    }
  }

  // GET /api/chats/conversations
  async getConversations(req, res) {
    try {
      const result = await ChatService.getUserConversations(req.user);

      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({ success: false, message: 'Error del servidor' });
    }
  }

  // GET /api/users/search?username=term
  async searchUsers(req, res) {
    try {
      const { username } = req.query;

      if (!username) {
        return res.status(400).json({
          success: false,
          message: 'username query parameter is required'
        });
      }

      const result = await ChatService.searchUsers(username);

      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Search users error:', error);
      res.status(500).json({ success: false, message: 'Error del servidor' });
    }
  }

  // GET /api/users/:id
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const result = await ChatService.getUserById(id);

      if (result.success) {
        res.json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('Get user by id error:', error);
      res.status(500).json({ success: false, message: 'Error del servidor' });
    }
  }
}

module.exports = new ChatController();