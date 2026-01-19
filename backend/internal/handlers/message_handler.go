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
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req struct {
		OtherUserID int `json:"other_user_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	currentUserID := userID.(int)
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
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	currentUserID := userID.(int)
	log.Printf("Fetching conversations for user ID: %d", currentUserID)

	query := `
		SELECT c.*,
		       u1.name as user1_name,
		       u2.name as user2_name,
		       COALESCE((SELECT COUNT(*) FROM messages m 
		        WHERE m.conversation_id = c.id 
		        AND m.receiver_id = $1 
		        AND m.is_read = FALSE), 0) as unread_count,
		       (SELECT m.message FROM messages m 
		        WHERE m.conversation_id = c.id 
		        ORDER BY m.created_at DESC LIMIT 1) as last_message
		FROM conversations c
		LEFT JOIN users u1 ON c.user1_id = u1.id
		LEFT JOIN users u2 ON c.user2_id = u2.id
		WHERE c.user1_id = $1 OR c.user2_id = $1
		ORDER BY c.last_message_at DESC
	`

	var conversations []models.Conversation
	err := h.DB.DB.Select(&conversations, query, currentUserID)
	if err != nil {
		log.Printf("Error fetching conversations: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch conversations"})
		return
	}

	log.Printf("Found %d conversations for user %d", len(conversations), currentUserID)
	c.JSON(http.StatusOK, conversations)
}

// Get messages for a conversation
func (h *MessageHandler) GetMessages(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	conversationID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid conversation ID"})
		return
	}

	currentUserID := userID.(int)

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
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req models.MessageCreate
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	senderID := userID.(int)
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
		INSERT INTO messages (conversation_id, sender_id, receiver_id, message, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $5)
		RETURNING *
	`
	now := time.Now()
	var message models.Message
	err = h.DB.DB.Get(&message, insertMessageQuery, conversation.ID, senderID, receiverID, req.Message, now)
	if err != nil {
		log.Printf("Error creating message: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send message"})
		return
	}

	// Update conversation last_message_at
	h.DB.DB.Exec("UPDATE conversations SET last_message_at = $1, updated_at = $1 WHERE id = $2", now, conversation.ID)

	// Get sender name
	var senderName string
	h.DB.DB.Get(&senderName, "SELECT name FROM users WHERE id = $1", senderID)
	message.SenderName = &senderName

	c.JSON(http.StatusCreated, message)
}

// Get unread message count
func (h *MessageHandler) GetUnreadCount(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var count int
	err := h.DB.DB.Get(&count, "SELECT COUNT(*) FROM messages WHERE receiver_id = $1 AND is_read = FALSE", userID)
	if err != nil {
		log.Printf("Error fetching unread count: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch unread count"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"count": count})
}

