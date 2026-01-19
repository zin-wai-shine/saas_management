package models

import (
	"time"
)

type Conversation struct {
	ID           int        `json:"id" db:"id"`
	User1ID      int        `json:"user1_id" db:"user1_id"`
	User2ID      int        `json:"user2_id" db:"user2_id"`
	LastMessageAt *time.Time `json:"last_message_at,omitempty" db:"last_message_at"`
	CreatedAt    time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at" db:"updated_at"`
	
	// Join fields
	User1Name    *string `json:"user1_name,omitempty" db:"user1_name"`
	User2Name    *string `json:"user2_name,omitempty" db:"user2_name"`
	User1Avatar  *string `json:"user1_avatar,omitempty" db:"user1_avatar"`
	User2Avatar  *string `json:"user2_avatar,omitempty" db:"user2_avatar"`
	UnreadCount  int     `json:"unread_count" db:"unread_count"`
	LastMessage  *string `json:"last_message,omitempty" db:"last_message"`
}

type Message struct {
	ID            int       `json:"id" db:"id"`
	ConversationID int      `json:"conversation_id" db:"conversation_id"`
	SenderID      int       `json:"sender_id" db:"sender_id"`
	ReceiverID    int       `json:"receiver_id" db:"receiver_id"`
	Message       string    `json:"message" db:"message"`
	IsRead        bool      `json:"is_read" db:"is_read"`
	ReadAt        *time.Time `json:"read_at,omitempty" db:"read_at"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time `json:"updated_at" db:"updated_at"`
	
	// Join fields
	SenderName    *string `json:"sender_name,omitempty" db:"sender_name"`
	ReceiverName  *string `json:"receiver_name,omitempty" db:"receiver_name"`
}

type MessageCreate struct {
	ReceiverID int    `json:"receiver_id"`
	Message    string `json:"message"`
}

