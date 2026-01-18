package database

import (
	"fmt"
	"log"
	"path/filepath"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

func Initialize(databaseURL string) (*sqlx.DB, error) {
	db, err := sqlx.Connect("postgres", databaseURL)
	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		return nil, err
	}

	log.Println("Database connection established")
	return db, nil
}

func RunMigrations(db *sqlx.DB) error {
	// Get the underlying *sql.DB from *sqlx.DB
	sqlDB := db.DB

	// Create postgres driver instance
	driver, err := postgres.WithInstance(sqlDB, &postgres.Config{})
	if err != nil {
		return fmt.Errorf("failed to create postgres driver: %w", err)
	}

	// Get absolute path to migrations directory
	// This ensures migrations work regardless of where the binary is run from
	migrationsPath, err := filepath.Abs("migrations")
	if err != nil {
		return fmt.Errorf("failed to get migrations path: %w", err)
	}

	// Convert to file:// URL format (file:///absolute/path on Unix)
	migrationURL := fmt.Sprintf("file://%s", migrationsPath)

	log.Printf("Running migrations from: %s", migrationURL)

	// Create migrate instance with file source
	m, err := migrate.NewWithDatabaseInstance(
		migrationURL,
		"postgres",
		driver,
	)
	if err != nil {
		return fmt.Errorf("failed to create migrate instance: %w", err)
	}

	// Run migrations up to the latest version
	if err := m.Up(); err != nil {
		// If we're already at the latest version, that's fine
		if err == migrate.ErrNoChange {
			log.Println("Database is already at the latest migration version")
			return nil
		}
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	log.Println("Migrations completed successfully")
	return nil
}

// Legacy migration constants removed - now using golang-migrate
// Migration files are in the migrations/ directory
