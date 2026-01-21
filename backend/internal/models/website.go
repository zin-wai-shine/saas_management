package models

import (
	"time"
)

type Website struct {
	ID         int       `json:"id" db:"id"`
	BusinessID *int      `json:"business_id,omitempty" db:"business_id"`
	Title      string    `json:"title" db:"title"`
	URL        *string   `json:"url,omitempty" db:"url"`
	ImageURL   *string   `json:"image_url,omitempty" db:"image_url"`
	ThemeName  string    `json:"theme_name" db:"theme_name"`
	IsDemo     bool      `json:"is_demo" db:"is_demo"`
	IsClaimed  bool      `json:"is_claimed" db:"is_claimed"`
	Status     string    `json:"status" db:"status"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time `json:"updated_at" db:"updated_at"`
}
