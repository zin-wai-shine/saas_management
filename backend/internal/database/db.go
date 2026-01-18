package database

import (
	"github.com/jmoiron/sqlx"
)

type DB struct {
	*sqlx.DB
}

func NewDB(db *sqlx.DB) *DB {
	return &DB{DB: db}
}

