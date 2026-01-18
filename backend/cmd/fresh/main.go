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

	log.Println("=========================================")
	log.Println("FRESH Database Migration & Seeding")
	log.Println("=========================================")
	log.Println("")

	log.Println("Connecting to database...")
	// Initialize database
	db, err := database.Initialize(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	log.Println("Dropping all tables for fresh start...")
	// Drop all tables in reverse order (respecting foreign keys)
	tables := []string{
		"payments",
		"invoices",
		"domains",
		"subscriptions",
		"plans",
		"websites",
		"businesses",
		"users",
		"schema_migrations",
	}

	for _, table := range tables {
		_, err := db.Exec("DROP TABLE IF EXISTS " + table + " CASCADE")
		if err != nil {
			log.Printf("Warning: Failed to drop table %s: %v", table, err)
		} else {
			log.Printf("  ✓ Dropped table: %s", table)
		}
	}

	log.Println("\nRunning fresh migrations...")
	// Run migrations
	if err := database.RunMigrations(db); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	log.Println("✅ Migrations completed successfully!")

	// Seed database
	seedDB := os.Getenv("SEED_DB")
	if seedDB == "" || seedDB == "true" {
		log.Println("\nSeeding database...")
		if err := database.SeedDatabase(db); err != nil {
			log.Fatalf("Failed to seed database: %v", err)
		}
		log.Println("✅ Database seeded successfully!")
	}

	log.Println("\n✅ Fresh database migration and seeding completed!")
}

