package main

import (
	"log"
	"strings"

	"saas-management-api/internal/config"
	"saas-management-api/internal/database"
)

func main() {
	// Load configuration
	cfg := config.Load()

	log.Println("=========================================")
	log.Println("Reorder URL Column: Move after Title")
	log.Println("=========================================")
	log.Println("")

	log.Println("Connecting to database...")
	// Initialize database
	db, err := database.Initialize(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	log.Println("Reordering columns: moving URL after title...")

	// Start transaction
	tx, err := db.Beginx()
	if err != nil {
		log.Fatalf("Failed to begin transaction: %v", err)
	}
	defer tx.Rollback()

	// Create new table with correct column order (url after title)
	log.Println("  Step 1: Creating new table with correct column order...")
	_, err = tx.Exec(`
		CREATE TABLE websites_new (
			id SERIAL PRIMARY KEY,
			business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
			title VARCHAR(255) NOT NULL,
			url VARCHAR(500),
			theme_name VARCHAR(255) DEFAULT 'default',
			is_demo BOOLEAN DEFAULT true,
			is_claimed BOOLEAN DEFAULT false,
			status VARCHAR(50) DEFAULT 'pending',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		log.Fatalf("Failed to create new table: %v", err)
	}

	// Copy data from old table to new table
	log.Println("  Step 2: Copying data to new table...")
	_, err = tx.Exec(`
		INSERT INTO websites_new (id, business_id, title, url, theme_name, is_demo, is_claimed, status, created_at, updated_at)
		SELECT id, business_id, title, url, theme_name, is_demo, is_claimed, status, created_at, updated_at
		FROM websites
	`)
	if err != nil {
		log.Fatalf("Failed to copy data: %v", err)
	}

	// Drop old table
	log.Println("  Step 3: Dropping old table...")
	_, err = tx.Exec(`DROP TABLE websites CASCADE`)
	if err != nil {
		log.Fatalf("Failed to drop old table: %v", err)
	}

	// Rename new table to original name
	log.Println("  Step 4: Renaming new table...")
	_, err = tx.Exec(`ALTER TABLE websites_new RENAME TO websites`)
	if err != nil {
		log.Fatalf("Failed to rename table: %v", err)
	}

	// Fix sequence ownership (find the actual sequence name)
	log.Println("  Step 5: Fixing sequence...")
	var seqName string
	err = tx.Get(&seqName, `
		SELECT pg_get_serial_sequence('websites', 'id')
	`)
	if err == nil && seqName != "" {
		// Extract just the sequence name (remove schema prefix if any)
		seqParts := strings.Split(seqName, ".")
		actualSeqName := seqParts[len(seqParts)-1]
		_, err = tx.Exec(`ALTER SEQUENCE ` + actualSeqName + ` OWNED BY websites.id`)
		if err != nil {
			log.Printf("Warning: Failed to fix sequence (may not be critical): %v", err)
		}
	} else {
		log.Printf("Warning: Could not find sequence for websites.id (may use SERIAL which handles it automatically)")
	}

	// Commit transaction
	if err = tx.Commit(); err != nil {
		log.Fatalf("Failed to commit transaction: %v", err)
	}

	log.Println("")
	log.Println("✅ URL column reordered successfully!")
	log.Println("")
	log.Println("Verifying column order...")

	// Verify the column order
	var columns []struct {
		ColumnName string `db:"column_name"`
		Ordinal    int    `db:"ordinal_position"`
	}
	err = db.Select(&columns, `
		SELECT column_name, ordinal_position
		FROM information_schema.columns
		WHERE table_name = 'websites'
		ORDER BY ordinal_position
	`)
	if err != nil {
		log.Printf("Warning: Failed to verify columns: %v", err)
	} else {
		log.Println("Current column order in websites table:")
		for _, col := range columns {
			marker := ""
			if col.ColumnName == "url" {
				marker = " ← URL (after title)"
			} else if col.ColumnName == "title" {
				marker = " ← Title"
			}
			log.Printf("  %d. %s%s", col.Ordinal, col.ColumnName, marker)
		}
	}
}

