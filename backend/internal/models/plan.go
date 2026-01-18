package models

import (
	"time"
)

type Plan struct {
	ID          int       `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Description *string   `json:"description,omitempty" db:"description"`
	Price       float64   `json:"price" db:"price"`
	BillingCycle string   `json:"billing_cycle" db:"billing_cycle"`
	Features    JSONBArray `json:"features,omitempty" db:"features"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

