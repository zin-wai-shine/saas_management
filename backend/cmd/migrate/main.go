package main

import (
	"log"
	"os"

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

	log.Println("Running migrations...")
	// Run migrations
	if err := database.RunMigrations(db); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	log.Println("✅ Migrations completed successfully!")

	// Check if SEED_DB is set, otherwise ask
	seedDB := os.Getenv("SEED_DB")
	if seedDB == "" {
		log.Println("\nTo seed the database, run:")
		log.Println("  SEED_DB=true go run cmd/migrate/main.go")
		log.Println("Or:")
		log.Println("  SEED_DB=true go run main.go")
		return
	}

	if seedDB == "true" {
		log.Println("\nSeeding database...")
		if err := database.SeedDatabase(db); err != nil {
			log.Fatalf("Failed to seed database: %v", err)
		}
		log.Println("✅ Database seeded successfully!")
	}
}

