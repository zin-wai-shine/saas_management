package handlers

import (
	"database/sql"
	"log"
	"net/http"
	"strconv"
	"time"

	"saas-management-api/internal/database"
	"saas-management-api/internal/models"

	"github.com/gin-gonic/gin"
)

type MessageHandler struct {
	DB *database.DB
}

func NewMessageHandler(db *database.DB) *MessageHandler {
	return &MessageHandler{DB: db}
}

// Get or create conversation between two users
func (h *MessageHandler) GetOrCreateConversation(c *gin.Context) {
	val, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	user := val.(*models.User)
	currentUserID := user.ID

	var req struct {
		OtherUserID int `json:"other_user_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	otherUserID := req.OtherUserID

	// Ensure user1_id < user2_id for consistency
	user1ID := currentUserID
	user2ID := otherUserID
	if currentUserID > otherUserID {
		user1ID = otherUserID
		user2ID = currentUserID
	}

	// Try to get existing conversation
	var conversation models.Conversation
	query := `
		SELECT c.*,
		       u1.name as user1_name,
		       u2.name as user2_name
		FROM conversations c
		LEFT JOIN users u1 ON c.user1_id = u1.id
		LEFT JOIN users u2 ON c.user2_id = u2.id
		WHERE c.user1_id = $1 AND c.user2_id = $2
	`
	err := h.DB.DB.Get(&conversation, query, user1ID, user2ID)

	if err == sql.ErrNoRows {
		// Create new conversation
		insertQuery := `
			INSERT INTO conversations (user1_id, user2_id, created_at, updated_at)
			VALUES ($1, $2, $3, $4)
			RETURNING *
		`
		now := time.Now()
		err = h.DB.DB.Get(&conversation, insertQuery, user1ID, user2ID, now, now)
		if err != nil {
			log.Printf("Error creating conversation: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create conversation"})
			return
		}

		// Get user names
		var user1Name, user2Name string
		h.DB.DB.Get(&user1Name, "SELECT name FROM users WHERE id = $1", user1ID)
		h.DB.DB.Get(&user2Name, "SELECT name FROM users WHERE id = $1", user2ID)
		conversation.User1Name = &user1Name
		conversation.User2Name = &user2Name
	} else if err != nil {
		log.Printf("Error fetching conversation: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch conversation"})
		return
	}

	c.JSON(http.StatusOK, conversation)
}

// List conversations for current user
func (h *MessageHandler) ListConversations(c *gin.Context) {
	val, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	user := val.(*models.User)
	currentUserID := user.ID

	// Fetch all conversations for this user with a simplified, robust query
	query := `
		SELECT 
			c.id,
			c.user1_id,
			c.user2_id,
			c.last_message_at,
			c.created_at,
			c.updated_at,
			u1.name as user1_name,
			u2.name as user2_name
		FROM conversations c
		LEFT JOIN users u1 ON c.user1_id = u1.id
		LEFT JOIN users u2 ON c.user2_id = u2.id
		WHERE c.user1_id = $1 OR c.user2_id = $1
		ORDER BY COALESCE(c.last_message_at, c.created_at) DESC
	`

	var conversations []models.Conversation
	err := h.DB.DB.Select(&conversations, query, currentUserID)
	if err != nil {
		log.Printf("Error fetching conversations: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch conversations"})
		return
	}

	// Manually populate unread_count and last_message for each conversation
	for i := range conversations {
		// Get unread count
		var unreadCount int
		h.DB.DB.Get(&unreadCount,
			"SELECT COUNT(*) FROM messages WHERE conversation_id = $1 AND receiver_id = $2 AND is_read = FALSE",
			conversations[i].ID, currentUserID)
			conversations[i].UnreadCount = unreadCount

		// Get last message
		var lastMsg sql.NullString
		h.DB.DB.Get(&lastMsg,
			"SELECT message FROM messages WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT 1",
			conversations[i].ID)
		if lastMsg.Valid {
			conversations[i].LastMessage = &lastMsg.String
		}
	}

	c.JSON(http.StatusOK, conversations)
}

// Helper function to ensure conversations exist for messages
func (h *MessageHandler) ensureConversationsFromMessages(currentUserID int) error {
	// Check if messages table exists and has data
	var messageCount int
	err := h.DB.DB.Get(&messageCount,
		"SELECT COUNT(*) FROM messages WHERE sender_id = $1 OR receiver_id = $1", currentUserID)
	if err != nil {
		// Table might not exist or query failed - that's okay
		return nil
	}

	if messageCount == 0 {
		// No messages for this user - nothing to do
		return nil
	}

	// Find unique conversation pairs from messages
	type MessagePair struct {
		User1ID  int       `db:"u1_id"`
		User2ID  int       `db:"u2_id"`
		FirstMsg time.Time `db:"first_msg"`
		LastMsg  time.Time `db:"last_msg"`
	}

	var messagePairs []MessagePair
	findPairsQuery := `
		SELECT 
			LEAST(sender_id, receiver_id) as u1_id,
			GREATEST(sender_id, receiver_id) as u2_id,
			MIN(created_at) as first_msg,
			MAX(created_at) as last_msg
		FROM messages
		WHERE (sender_id = $1 OR receiver_id = $1)
		GROUP BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id)
	`

	err = h.DB.DB.Select(&messagePairs, findPairsQuery, currentUserID)
	if err != nil {
		return err
	}

	// Create conversations for pairs that don't exist
	for _, pair := range messagePairs {
		var existingID int
		checkQuery := "SELECT id FROM conversations WHERE user1_id = $1 AND user2_id = $2"
		err := h.DB.DB.Get(&existingID, checkQuery, pair.User1ID, pair.User2ID)

		if err == sql.ErrNoRows {
			// Create new conversation
			insertQuery := `
				INSERT INTO conversations (user1_id, user2_id, created_at, updated_at, last_message_at)
				VALUES ($1, $2, $3, $4, $5)
				ON CONFLICT (user1_id, user2_id) DO NOTHING
			`
			_, err = h.DB.DB.Exec(insertQuery, pair.User1ID, pair.User2ID, pair.FirstMsg, pair.LastMsg, pair.LastMsg)
			if err != nil {
				log.Printf("Error creating conversation for users %d-%d: %v", pair.User1ID, pair.User2ID, err)
			}
		} else if err != nil && err != sql.ErrNoRows {
			log.Printf("Error checking conversation: %v", err)
		}
	}

	// Update conversation IDs in messages that might have NULL or wrong conversation_id
	updateMessagesQuery := `
		UPDATE messages m
		SET conversation_id = c.id
		FROM conversations c
		WHERE (m.conversation_id IS NULL OR m.conversation_id = 0)
		AND (
			(c.user1_id = LEAST(m.sender_id, m.receiver_id)
			 AND c.user2_id = GREATEST(m.sender_id, m.receiver_id))
		)
		AND (m.sender_id = $1 OR m.receiver_id = $1)
	`
	_, err = h.DB.DB.Exec(updateMessagesQuery, currentUserID)
	if err != nil {
		log.Printf("Warning: Error updating message conversation_ids: %v", err)
	}

	return nil
}

// Get messages for a conversation
func (h *MessageHandler) GetMessages(c *gin.Context) {
	val, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	user := val.(*models.User)
	currentUserID := user.ID

	conversationID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid conversation ID"})
		return
	}

	// Verify user is part of this conversation
	var conversation models.Conversation
	checkQuery := "SELECT * FROM conversations WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)"
	err = h.DB.DB.Get(&conversation, checkQuery, conversationID, currentUserID)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Conversation not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify conversation"})
		return
	}

	// Get messages
	query := `
		SELECT m.*,
		       u1.name as sender_name,
		       u2.name as receiver_name
		FROM messages m
		LEFT JOIN users u1 ON m.sender_id = u1.id
		LEFT JOIN users u2 ON m.receiver_id = u2.id
		WHERE m.conversation_id = $1
		ORDER BY m.created_at ASC
	`

	var messages []models.Message
	err = h.DB.DB.Select(&messages, query, conversationID)
	if err != nil {
		log.Printf("Error fetching messages: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch messages"})
		return
	}

	// Mark messages as read
	updateQuery := `
		UPDATE messages 
		SET is_read = TRUE, read_at = $1
		WHERE conversation_id = $2 
		AND receiver_id = $3 
		AND is_read = FALSE
	`
	now := time.Now()
	h.DB.DB.Exec(updateQuery, now, conversationID, currentUserID)

	// Update conversation last_message_at
	h.DB.DB.Exec("UPDATE conversations SET last_message_at = $1, updated_at = $1 WHERE id = $2", now, conversationID)

	c.JSON(http.StatusOK, messages)
}

// Send a message
func (h *MessageHandler) SendMessage(c *gin.Context) {
	val, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	user := val.(*models.User)
	senderID := user.ID

	var req models.MessageCreate
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	receiverID := req.ReceiverID

	// Ensure user1_id < user2_id for consistency
	user1ID := senderID
	user2ID := receiverID
	if senderID > receiverID {
		user1ID = receiverID
		user2ID = senderID
	}

	// Get or create conversation
	var conversation models.Conversation
	query := "SELECT * FROM conversations WHERE user1_id = $1 AND user2_id = $2"
	err := h.DB.DB.Get(&conversation, query, user1ID, user2ID)

	if err == sql.ErrNoRows {
		// Create new conversation
		insertQuery := `
			INSERT INTO conversations (user1_id, user2_id, created_at, updated_at, last_message_at)
			VALUES ($1, $2, $3, $3, $3)
			RETURNING *
		`
		now := time.Now()
		err = h.DB.DB.Get(&conversation, insertQuery, user1ID, user2ID, now)
		if err != nil {
			log.Printf("Error creating conversation: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create conversation"})
			return
		}
	}

	// Create message
	insertMessageQuery := `
		INSERT INTO messages (conversation_id, sender_id, receiver_id, message, message_type, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $6)
		RETURNING id, conversation_id, sender_id, receiver_id, message, message_type, is_read, read_at, created_at, updated_at
	`
	now := time.Now()
	var message models.Message
	msgType := req.MessageType
	if msgType == "" {
		msgType = "text"
	}
	err = h.DB.DB.Get(&message, insertMessageQuery, conversation.ID, senderID, receiverID, req.Message, msgType, now)
	if err != nil {
		log.Printf("Error creating message: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send message"})
		return
	}

	// Update conversation last_message_at
	h.DB.DB.Exec("UPDATE conversations SET last_message_at = $1, updated_at = $1 WHERE id = $2", now, conversation.ID)

	// Get sender name
	var senderName string
	err = h.DB.DB.Get(&senderName, "SELECT name FROM users WHERE id = $1", senderID)
	if err == nil {
	message.SenderName = &senderName
	} else {
		// Log but don't fail the entire request
		log.Printf("Warning: Could not get sender name: %v", err)
	}

	c.JSON(http.StatusCreated, message)
}

// Get unread message count
func (h *MessageHandler) GetUnreadCount(c *gin.Context) {
	val, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	user := val.(*models.User)
	userID := user.ID

	var count int
	err := h.DB.DB.Get(&count, "SELECT COUNT(*) FROM messages WHERE receiver_id = $1 AND is_read = FALSE", userID)
	if err != nil {
		log.Printf("Error fetching unread count: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch unread count"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"count": count})
}

// ListAll - Get all messages from database
// Admin can see all messages, users see only their own (sent or received)
func (h *MessageHandler) ListAll(c *gin.Context) {
	val, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	user := val.(*models.User)
	userID := user.ID
	userRole := user.Role
	isAdmin := userRole == "admin"

	var messages []models.Message
	var err error

	if isAdmin {
		// Admin sees all messages with sender and receiver names
		query := `
			SELECT m.*,
			       u1.name as sender_name,
			       u2.name as receiver_name
			FROM messages m
			LEFT JOIN users u1 ON m.sender_id = u1.id
			LEFT JOIN users u2 ON m.receiver_id = u2.id
			ORDER BY m.created_at DESC
		`
		err = h.DB.DB.Select(&messages, query)
	} else {
		// Regular users see only messages they sent or received
		query := `
			SELECT m.*,
			       u1.name as sender_name,
			       u2.name as receiver_name
			FROM messages m
			LEFT JOIN users u1 ON m.sender_id = u1.id
			LEFT JOIN users u2 ON m.receiver_id = u2.id
			WHERE m.sender_id = $1 OR m.receiver_id = $1
			ORDER BY m.created_at DESC
		`
		err = h.DB.DB.Select(&messages, query, userID)
	}

	if err != nil {
		log.Printf("Error fetching messages: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch messages"})
		return
	}

	c.JSON(http.StatusOK, messages)
}
