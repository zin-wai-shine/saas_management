package main

import (
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

	log.Println("Fixing dirty migration state...")
	
	// Fix dirty migration state
	_, err = db.Exec("UPDATE schema_migrations SET dirty = false WHERE version = 10")
	if err != nil {
		log.Printf("Error updating schema_migrations: %v", err)
		log.Println("Trying to insert if it doesn't exist...")
		
		// If update didn't work, try to set version 10 as not dirty
		_, err = db.Exec(`
			INSERT INTO schema_migrations (version, dirty) 
			VALUES (10, false) 
			ON CONFLICT (version) DO UPDATE SET dirty = false
		`)
		if err != nil {
			log.Fatalf("Failed to fix migration state: %v", err)
		}
	}

	log.Println("✅ Migration state fixed!")
	log.Println("You can now run migrations again with: go run cmd/migrate/main.go")
}

