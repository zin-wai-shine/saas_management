package main

import (
	"log"
	"os"

	"saas-management-api/internal/auth"
	"saas-management-api/internal/config"
	"saas-management-api/internal/database"
	"saas-management-api/internal/router"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize database
	db, err := database.Initialize(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Run migrations
	if err := database.RunMigrations(db); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	// Seed database with fake data (only if SEED_DB=true)
	if os.Getenv("SEED_DB") == "true" {
		if err := database.SeedDatabase(db); err != nil {
			log.Printf("Warning: Failed to seed database: %v", err)
		}
	}

	// Initialize JWT
	auth.InitJWT(cfg.JWTSecret)

	// Set Gin mode
	if os.Getenv("GIN_MODE") == "" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize router
	r := router.SetupRouter(db, cfg)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

