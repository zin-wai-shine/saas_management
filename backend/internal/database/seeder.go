package database

import (
	"log"
	"time"

	"github.com/jmoiron/sqlx"
	"golang.org/x/crypto/bcrypt"
)

func SeedDatabase(db *sqlx.DB) error {
	log.Println("Seeding database with fake data...")

	// Hash password for users
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	passwordHash := string(hashedPassword)

	// Create Admin User
	adminUser := `
		INSERT INTO users (name, email, password, role, created_at, updated_at)
		VALUES ('Super Admin', 'admin@saas.com', $1, 'admin', $2, $2)
		ON CONFLICT (email) DO NOTHING
		RETURNING id
	`
	var adminID int
	err = db.Get(&adminID, adminUser, passwordHash, time.Now())
	if err != nil && err.Error() != "sql: no rows in result set" {
		log.Println("Admin user may already exist or error:", err)
	}

	// Create Owner Users
	owners := []struct {
		name  string
		email string
	}{
		{"John Doe", "john@example.com"},
		{"Jane Smith", "jane@example.com"},
		{"Bob Johnson", "bob@example.com"},
	}

	var ownerIDs []int
	for _, owner := range owners {
		var id int
		err = db.Get(&id, `
			INSERT INTO users (name, email, password, role, created_at, updated_at)
			VALUES ($1, $2, $3, 'owner', $4, $4)
			ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
			RETURNING id
		`, owner.name, owner.email, passwordHash, time.Now())
		if err == nil {
			ownerIDs = append(ownerIDs, id)
		}
	}

	// Create Plans
	plans := []struct {
		name         string
		description  string
		price        float64
		billingCycle string
		features     string
	}{
		{
			"Starter",
			"Perfect for small businesses just getting started",
			29.00,
			"monthly",
			`["1 Website", "Standard Support", "Basic Analytics", "Email Support"]`,
		},
		{
			"Professional",
			"Great for growing teams and established businesses",
			79.00,
			"monthly",
			`["5 Websites", "Priority Support", "Advanced Analytics", "Custom Domain", "API Access"]`,
		},
		{
			"Enterprise",
			"Best for large organizations with advanced needs",
			199.00,
			"monthly",
			`["Unlimited Websites", "24/7 Support", "Enterprise Analytics", "Custom Domains", "API Access", "Dedicated Manager", "Custom Integrations"]`,
		},
	}

	var planIDs []int
	for _, plan := range plans {
		var id int
		err = db.Get(&id, `
			INSERT INTO plans (name, description, price, billing_cycle, features, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5::jsonb, $6, $6)
			ON CONFLICT DO NOTHING
			RETURNING id
		`, plan.name, plan.description, plan.price, plan.billingCycle, plan.features, time.Now())
		if err == nil {
			planIDs = append(planIDs, id)
		} else {
			// Get existing plan ID
			err = db.Get(&id, "SELECT id FROM plans WHERE name = $1", plan.name)
			if err == nil {
				planIDs = append(planIDs, id)
			}
		}
	}

	// Create Businesses
	businesses := []struct {
		userID      int
		name        string
		slug        string
		description string
		industry    string
		phone       string
		address     string
		status      string
	}{
		{
			ownerIDs[0],
			"JD Consulting",
			"jd-consulting",
			"A premier consulting firm specializing in business strategy and digital transformation.",
			"Consulting",
			"+1-555-0101",
			"123 Business St, New York, NY 10001",
			"active",
		},
		{
			ownerIDs[1],
			"Smith & Co. Marketing",
			"smith-marketing",
			"Full-service digital marketing agency helping brands grow online.",
			"Marketing",
			"+1-555-0102",
			"456 Marketing Ave, Los Angeles, CA 90001",
			"active",
		},
		{
			ownerIDs[2],
			"TechStart Solutions",
			"techstart-solutions",
			"Cutting-edge technology solutions for modern businesses.",
			"Technology",
			"+1-555-0103",
			"789 Tech Blvd, San Francisco, CA 94102",
			"active",
		},
		{
			0,
			"Demo Restaurant",
			"demo-restaurant",
			"A sample restaurant website ready to be claimed.",
			"Food & Beverage",
			"+1-555-0104",
			"321 Main St, Chicago, IL 60601",
			"pending",
		},
		{
			0,
			"Demo Fitness Center",
			"demo-fitness",
			"A sample fitness center website ready to be claimed.",
			"Health & Fitness",
			"+1-555-0105",
			"654 Health Way, Miami, FL 33101",
			"pending",
		},
	}

	var businessIDs []int
	for _, business := range businesses {
		var id int
		if business.userID != 0 {
			err = db.Get(&id, `
				INSERT INTO businesses (user_id, name, slug, description, industry, phone, address, status, created_at, updated_at)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
				ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
				RETURNING id
			`, business.userID, business.name, business.slug, business.description, business.industry, business.phone, business.address, business.status, time.Now())
		} else {
			err = db.Get(&id, `
				INSERT INTO businesses (user_id, name, slug, description, industry, phone, address, status, created_at, updated_at)
				VALUES (NULL, $1, $2, $3, $4, $5, $6, $7, $8, $8)
				ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
				RETURNING id
			`, business.name, business.slug, business.description, business.industry, business.phone, business.address, business.status, time.Now())
		}
		if err == nil {
			businessIDs = append(businessIDs, id)
		}
	}

	// Create Websites
	websites := []struct {
		businessID int
		title      string
		themeName  string
		content    string
		isDemo     bool
		isClaimed  bool
		status     string
	}{
		{
			businessIDs[0],
			"JD Consulting - Professional Website",
			"professional",
			`{"sections": ["hero", "services", "about", "contact"], "theme": "blue"}`,
			false,
			true,
			"approved",
		},
		{
			businessIDs[1],
			"Smith Marketing - Digital Agency",
			"modern",
			`{"sections": ["hero", "portfolio", "testimonials", "contact"], "theme": "purple"}`,
			false,
			true,
			"approved",
		},
		{
			businessIDs[2],
			"TechStart Solutions - Tech Company",
			"tech",
			`{"sections": ["hero", "products", "team", "contact"], "theme": "dark"}`,
			false,
			true,
			"approved",
		},
		{
			businessIDs[3],
			"Demo Restaurant - Claim This Site",
			"restaurant",
			`{"sections": ["hero", "menu", "gallery", "reservations"], "theme": "warm"}`,
			true,
			false,
			"pending",
		},
		{
			businessIDs[4],
			"Demo Fitness Center - Claim This Site",
			"fitness",
			`{"sections": ["hero", "classes", "trainers", "membership"], "theme": "energetic"}`,
			true,
			false,
			"pending",
		},
	}

	for _, website := range websites {
		_, err = db.Exec(`
			INSERT INTO websites (business_id, title, theme_name, content, is_demo, is_claimed, status, created_at, updated_at)
			VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $8)
			ON CONFLICT DO NOTHING
		`, website.businessID, website.title, website.themeName, website.content, website.isDemo, website.isClaimed, website.status, time.Now())
	}

	// Create Subscriptions
	if len(ownerIDs) > 0 && len(planIDs) > 0 {
		subscriptions := []struct {
			businessID int
			planID     int
			status     string
			endsAt     *time.Time
		}{
			{businessIDs[0], planIDs[1], "active", nil},
			{businessIDs[1], planIDs[1], "active", nil},
			{businessIDs[2], planIDs[2], "active", nil},
		}

		for _, sub := range subscriptions {
			_, err = db.Exec(`
				INSERT INTO subscriptions (business_id, plan_id, status, ends_at, created_at, updated_at)
				VALUES ($1, $2, $3, $4, $5, $5)
				ON CONFLICT DO NOTHING
			`, sub.businessID, sub.planID, sub.status, sub.endsAt, time.Now())
		}
	}

	log.Println("✅ Database seeded successfully!")
	return nil
}

