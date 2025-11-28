// Message Entity Model
class Message {
  constructor(data = {}) {
    this.id = data.id;
    this.from_user = data.from_user;
    this.to_user = data.to_user;
    this.message = data.message;
    this.offer_id = data.offer_id;
    this.created_at = data.created_at;
    this.from_name = data.from_name;
    this.to_name = data.to_name;
  }

  // Validation methods
  isValid() {
    return this.from_user && this.to_user && this.message;
  }

  isFromUser(userId) {
    return this.from_user === userId;
  }

  isToUser(userId) {
    return this.to_user === userId;
  }

  // Check if message is related to a specific offer
  isRelatedToOffer(offerId) {
    return this.offer_id === offerId;
  }

  // Check if message is between two users
  isBetween(user1, user2) {
    return (this.isFromUser(user1) && this.isToUser(user2)) ||
           (this.isFromUser(user2) && this.isToUser(user1));
  }
}

module.exports = Message;