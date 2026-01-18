package models

import (
	"time"
)

type Notification struct {
	ID         int       `json:"id" db:"id"`
	UserID     int       `json:"user_id" db:"user_id"`
	FromUserID *int      `json:"from_user_id,omitempty" db:"from_user_id"`
	Subject    string    `json:"subject" db:"subject"`
	Message    string    `json:"message" db:"message"`
	Type       string    `json:"type" db:"type"`
	Status     string    `json:"status" db:"status"`
	IsRead     bool      `json:"is_read" db:"is_read"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time `json:"updated_at" db:"updated_at"`
	
	// Join fields
	FromUserName *string `json:"from_user_name,omitempty" db:"from_user_name"`
	UserName     *string `json:"user_name,omitempty" db:"user_name"`
}

type NotificationCreate struct {
	UserID    *int   `json:"user_id,omitempty"` // If null, send to all admins
	Subject   string `json:"subject"`
	Message   string `json:"message"`
	Type      string `json:"type,omitempty"`
}

