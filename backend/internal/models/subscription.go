package models

import (
	"time"
)

type Subscription struct {
	ID         int        `json:"id" db:"id"`
	BusinessID int        `json:"business_id" db:"business_id"`
	PlanID     int        `json:"plan_id" db:"plan_id"`
	Status     string     `json:"status" db:"status"`
	EndsAt     *time.Time `json:"ends_at,omitempty" db:"ends_at"`
	CreatedAt  time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at" db:"updated_at"`
}

