package models

import (
	"time"
)

type Website struct {
	ID        int       `json:"id" db:"id"`
	BusinessID int      `json:"business_id" db:"business_id"`
	Title     string    `json:"title" db:"title"`
	ThemeName string    `json:"theme_name" db:"theme_name"`
	Content   JSONB     `json:"content,omitempty" db:"content"`
	IsDemo    bool      `json:"is_demo" db:"is_demo"`
	IsClaimed bool      `json:"is_claimed" db:"is_claimed"`
	Status    string    `json:"status" db:"status"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

