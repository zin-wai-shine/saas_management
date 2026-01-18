package main

import (
	"fmt"
	"log"

	"saas-management-api/internal/config"
	"saas-management-api/internal/database"
)

func main() {
	// Load configuration
	cfg := config.Load()

	log.Println("Connecting to database...")
	// Initialize database
	db, err := database.Initialize(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Check if notifications table exists
	var exists bool
	err = db.Get(&exists, `
		SELECT EXISTS (
			SELECT FROM information_schema.tables 
			WHERE table_schema = 'public' 
			AND table_name = 'notifications'
		);
	`)
	if err != nil {
		log.Fatalf("Failed to check table: %v", err)
	}

	if exists {
		log.Println("✅ Notifications table exists!")
		
		// Check table structure
		var columns []struct {
			ColumnName string `db:"column_name"`
			DataType   string `db:"data_type"`
		}
		err = db.Select(&columns, `
			SELECT column_name, data_type 
			FROM information_schema.columns 
			WHERE table_name = 'notifications' 
			ORDER BY ordinal_position;
		`)
		if err == nil {
			fmt.Println("\nTable structure:")
			for _, col := range columns {
				fmt.Printf("  - %s (%s)\n", col.ColumnName, col.DataType)
			}
		}
	} else {
		log.Println("❌ Notifications table does NOT exist!")
	}
}

