package models

import (
	"time"
)

type Business struct {
	ID          int       `json:"id" db:"id"`
	UserID      *int      `json:"user_id,omitempty" db:"user_id"`
	Name        string    `json:"name" db:"name"`
	Slug        string    `json:"slug" db:"slug"`
	Description *string   `json:"description,omitempty" db:"description"`
	Logo        *string   `json:"logo,omitempty" db:"logo"`
	Industry    *string   `json:"industry,omitempty" db:"industry"`
	Phone       *string   `json:"phone,omitempty" db:"phone"`
	Address     *string   `json:"address,omitempty" db:"address"`
	Status      string    `json:"status" db:"status"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

