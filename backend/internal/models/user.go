package models

import (
	"time"
)

type User struct {
	ID             int       `json:"id" db:"id"`
	Name           string    `json:"name" db:"name"`
	Email          string    `json:"email" db:"email"`
	Password       string    `json:"-" db:"password"`
	Role           string    `json:"role" db:"role"`
	EmailVerifiedAt *time.Time `json:"email_verified_at,omitempty" db:"email_verified_at"`
	RememberToken  *string   `json:"-" db:"remember_token"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time `json:"updated_at" db:"updated_at"`
}

func (u *User) IsAdmin() bool {
	return u.Role == "admin"
}

func (u *User) IsOwner() bool {
	return u.Role == "owner"
}

