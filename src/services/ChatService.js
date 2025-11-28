// Chat Service - Business Logic Layer
const MessageRepository = require('../repositories/MessageRepository');
const UserRepository = require('../repositories/UserRepository');

class ChatService {
  // Send message
  async sendMessage(user, messageData) {
    try {
      const { toUserId, message, offerId } = messageData;

      // Validate message data
      if (!toUserId || !message) {
        throw new Error('Datos del mensaje incompletos');
      }

      // Check if recipient exists
      const recipient = await UserRepository.findById(toUserId);
      if (!recipient) {
        throw new Error('Usuario destinatario no encontrado');
      }

      // Create message
      const message_obj = await MessageRepository.create({
        from_user: user.id,
        to_user: toUserId,
        message,
        offer_id: offerId || null,
      });

      return {
        success: true,
        message: 'Mensaje enviado',
        messageId: message_obj.id,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Get conversation between two users
  async getConversation(user, otherUserId) {
    try {
      // Check if the other user exists
      const otherUser = await UserRepository.findById(otherUserId);
      if (!otherUser) {
        throw new Error('Usuario no encontrado');
      }

      // Get conversation messages
      const messages = await MessageRepository.getConversation(user.id, otherUserId);

      return {
        success: true,
        messages,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Get user's conversations
  async getUserConversations(user) {
    try {
      const conversations = await MessageRepository.getConversations(user.id);

      return {
        success: true,
        conversations,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Get messages related to an offer
  async getOfferMessages(user, offerId) {
    try {
      // Get offer messages
      const messages = await MessageRepository.getOfferMessages(offerId);

      // Filter messages to only show those involving the current user
      const userMessages = messages.filter(msg => 
        msg.isFromUser(user.id) || msg.isToUser(user.id)
      );

      return {
        success: true,
        messages: userMessages,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Get messages between user and offer participants
  async getOfferUserMessages(user, offerId) {
    try {
      const messages = await MessageRepository.getOfferUserMessages(offerId, user.id);

      return {
        success: true,
        messages,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Get user's all messages
  async getUserMessages(user) {
    try {
      const messages = await MessageRepository.getUserMessages(user.id);

      return {
        success: true,
        messages,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Search users for chat
  async searchUsers(searchTerm) {
    try {
      const users = await UserRepository.search(searchTerm);
      
      // Return only basic user info for security
      const safeUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        nombre: user.nombre,
        role: user.role,
      }));

      return {
        success: true,
        users: safeUsers,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error buscando usuarios',
      };
    }
  }

  // Get user by ID (for chat display)
  async getUserById(userId) {
    try {
      const user = await UserRepository.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Return only public information
      const publicUser = {
        id: user.id,
        username: user.username,
        nombre: user.nombre,
        role: user.role,
      };

      return {
        success: true,
        user: publicUser,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Validate if two users can chat
  canUsersChat(user1Id, user2Id) {
    // For now, allow all authenticated users to chat
    // In the future, you might want to add business logic here
    // like checking if they have active offers together
    return user1Id !== user2Id;
  }
}

module.exports = new ChatService();