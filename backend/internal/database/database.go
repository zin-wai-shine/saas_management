package database

import (
	"log"

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
	migrations := []string{
		createUsersTable,
		createBusinessesTable,
		createWebsitesTable,
		createPlansTable,
		createSubscriptionsTable,
		createDomainsTable,
		createInvoicesTable,
		createPaymentsTable,
	}

	for _, migration := range migrations {
		if _, err := db.Exec(migration); err != nil {
			return err
		}
	}

	log.Println("Migrations completed successfully")
	return nil
}

const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
	id SERIAL PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	email VARCHAR(255) UNIQUE NOT NULL,
	password VARCHAR(255) NOT NULL,
	role VARCHAR(50) DEFAULT 'owner',
	email_verified_at TIMESTAMP,
	remember_token VARCHAR(255),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`

const createBusinessesTable = `
CREATE TABLE IF NOT EXISTS businesses (
	id SERIAL PRIMARY KEY,
	user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
	name VARCHAR(255) NOT NULL,
	slug VARCHAR(255) UNIQUE NOT NULL,
	description TEXT,
	logo VARCHAR(255),
	industry VARCHAR(255),
	phone VARCHAR(50),
	address VARCHAR(255),
	status VARCHAR(50) DEFAULT 'pending',
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`

const createWebsitesTable = `
CREATE TABLE IF NOT EXISTS websites (
	id SERIAL PRIMARY KEY,
	business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
	title VARCHAR(255) NOT NULL,
	theme_name VARCHAR(255) DEFAULT 'default',
	content JSONB,
	is_demo BOOLEAN DEFAULT true,
	is_claimed BOOLEAN DEFAULT false,
	status VARCHAR(50) DEFAULT 'pending',
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`

const createPlansTable = `
CREATE TABLE IF NOT EXISTS plans (
	id SERIAL PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	description TEXT,
	price DECIMAL(10, 2) NOT NULL,
	billing_cycle VARCHAR(50) DEFAULT 'monthly',
	features JSONB,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`

const createSubscriptionsTable = `
CREATE TABLE IF NOT EXISTS subscriptions (
	id SERIAL PRIMARY KEY,
	business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
	plan_id INTEGER REFERENCES plans(id) ON DELETE CASCADE,
	status VARCHAR(50) DEFAULT 'active',
	ends_at TIMESTAMP,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`

const createDomainsTable = `
CREATE TABLE IF NOT EXISTS domains (
	id SERIAL PRIMARY KEY,
	business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
	domain_name VARCHAR(255) UNIQUE NOT NULL,
	is_custom BOOLEAN DEFAULT false,
	status VARCHAR(50) DEFAULT 'pending',
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`

const createInvoicesTable = `
CREATE TABLE IF NOT EXISTS invoices (
	id SERIAL PRIMARY KEY,
	business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
	amount DECIMAL(10, 2) NOT NULL,
	status VARCHAR(50) DEFAULT 'unpaid',
	due_at TIMESTAMP,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`

const createPaymentsTable = `
CREATE TABLE IF NOT EXISTS payments (
	id SERIAL PRIMARY KEY,
	invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
	amount DECIMAL(10, 2) NOT NULL,
	payment_method VARCHAR(255),
	transaction_id VARCHAR(255),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`

