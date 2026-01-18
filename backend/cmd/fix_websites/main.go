package main

import (
	"log"

	"saas-management-api/internal/config"
	"saas-management-api/internal/database"
)

func main() {
	// Load configuration
	cfg := config.Load()

	log.Println("=========================================")
	log.Println("Fix Websites Table: Add URL, Remove Content")
	log.Println("=========================================")
	log.Println("")

	log.Println("Connecting to database...")
	// Initialize database
	db, err := database.Initialize(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	log.Println("Checking current table structure...")
	
	// Check if URL column exists
	var urlExists bool
	err = db.Get(&urlExists, `
		SELECT EXISTS (
			SELECT 1 FROM information_schema.columns 
			WHERE table_name='websites' AND column_name='url'
		)
	`)
	if err != nil {
		log.Fatalf("Failed to check URL column: %v", err)
	}

	// Check if content column exists
	var contentExists bool
	err = db.Get(&contentExists, `
		SELECT EXISTS (
			SELECT 1 FROM information_schema.columns 
			WHERE table_name='websites' AND column_name='content'
		)
	`)
	if err != nil {
		log.Fatalf("Failed to check content column: %v", err)
	}

	log.Printf("URL column exists: %v", urlExists)
	log.Printf("Content column exists: %v", contentExists)
	log.Println("")

	// Add URL column if it doesn't exist
	if !urlExists {
		log.Println("Adding URL column...")
		_, err = db.Exec(`ALTER TABLE websites ADD COLUMN url VARCHAR(500)`)
		if err != nil {
			log.Fatalf("Failed to add URL column: %v", err)
		}
		log.Println("  ✓ URL column added successfully")
	} else {
		log.Println("  ✓ URL column already exists")
	}

	// Remove content column if it exists
	if contentExists {
		log.Println("Removing content column...")
		_, err = db.Exec(`ALTER TABLE websites DROP COLUMN IF EXISTS content`)
		if err != nil {
			log.Fatalf("Failed to remove content column: %v", err)
		}
		log.Println("  ✓ Content column removed successfully")
	} else {
		log.Println("  ✓ Content column already removed")
	}

	log.Println("")
	log.Println("✅ Websites table fixed successfully!")
	log.Println("")
	log.Println("Verifying structure...")
	
	// Verify the changes
	var columns []string
	err = db.Select(&columns, `
		SELECT column_name 
		FROM information_schema.columns 
		WHERE table_name='websites' 
		ORDER BY ordinal_position
	`)
	if err != nil {
		log.Printf("Warning: Failed to verify columns: %v", err)
	} else {
		log.Println("Current columns in websites table:")
		for _, col := range columns {
			log.Printf("  - %s", col)
		}
	}
}

