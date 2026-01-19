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
		{"Alice Brown", "alice@example.com"},
		{"Charlie Wilson", "charlie@example.com"},
		{"Diana Prince", "diana@example.com"},
	}

	var ownerIDs []int
	var allUserIDs []int // Track all user IDs for conversations
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
			allUserIDs = append(allUserIDs, id)
		} else {
			// Get existing user ID
			err = db.Get(&id, "SELECT id FROM users WHERE email = $1", owner.email)
			if err == nil {
				ownerIDs = append(ownerIDs, id)
				allUserIDs = append(allUserIDs, id)
			}
		}
	}

	// Add admin to all user IDs list
	if adminID > 0 {
		allUserIDs = append([]int{adminID}, allUserIDs...)
	}

	// Create additional admin users for messaging
	additionalAdmins := []struct {
		name  string
		email string
	}{
		{"Sarah Manager", "sarah@saas.com"},
		{"Mike Support", "mike@saas.com"},
	}

	var adminIDs []int
	if adminID > 0 {
		adminIDs = append(adminIDs, adminID)
	}
	for _, admin := range additionalAdmins {
		var id int
		err = db.Get(&id, `
			INSERT INTO users (name, email, password, role, created_at, updated_at)
			VALUES ($1, $2, $3, 'admin', $4, $4)
			ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
			RETURNING id
		`, admin.name, admin.email, passwordHash, time.Now())
		if err == nil {
			adminIDs = append(adminIDs, id)
			allUserIDs = append(allUserIDs, id)
		} else {
			err = db.Get(&id, "SELECT id FROM users WHERE email = $1", admin.email)
			if err == nil {
				adminIDs = append(adminIDs, id)
				allUserIDs = append(allUserIDs, id)
			}
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

	// Create Conversations and Messages
	if len(allUserIDs) >= 2 {
		log.Println("Creating fake conversations and messages...")
		
		// Create conversations between different users
		// Use only the users that actually exist
		conversationPairs := []struct {
			user1Idx int
			user2Idx int
		}{
			{0, 1}, // Admin (idx 0) with John Doe (idx 1)
			{0, 2}, // Admin (idx 0) with Jane Smith (idx 2)
			{0, 3}, // Admin (idx 0) with Bob Johnson (idx 3)
			{1, 2}, // John Doe (idx 1) with Jane Smith (idx 2)
			{1, 3}, // John Doe (idx 1) with Bob Johnson (idx 3)
			{2, 3}, // Jane Smith (idx 2) with Bob Johnson (idx 3)
		}

		var conversationIDs []int
		for _, pair := range conversationPairs {
			if pair.user1Idx < len(allUserIDs) && pair.user2Idx < len(allUserIDs) {
				user1ID := allUserIDs[pair.user1Idx]
				user2ID := allUserIDs[pair.user2Idx]
				
				// Ensure user1_id < user2_id
				if user1ID > user2ID {
					user1ID, user2ID = user2ID, user1ID
				}

				var convID int
				err = db.Get(&convID, `
					INSERT INTO conversations (user1_id, user2_id, created_at, updated_at, last_message_at)
					VALUES ($1, $2, $3, $3, $3)
					ON CONFLICT (user1_id, user2_id) DO UPDATE SET updated_at = EXCLUDED.updated_at
					RETURNING id
				`, user1ID, user2ID, time.Now())
				if err == nil {
					conversationIDs = append(conversationIDs, convID)
				} else {
					// Get existing conversation ID
					err = db.Get(&convID, "SELECT id FROM conversations WHERE user1_id = $1 AND user2_id = $2", user1ID, user2ID)
					if err == nil {
						conversationIDs = append(conversationIDs, convID)
					}
				}
			}
		}

		// Create messages for each conversation
		// Updated to match the actual conversation pairs
		fakeMessages := []struct {
			conversationIdx int
			senderIdx       int
			receiverIdx     int
			message         string
			minutesAgo      int
		}{
			// Conversation 0 (Admin <-> John Doe)
			{0, 0, 1, "Hello John! How can I help you today?", 120},
			{0, 1, 0, "Hi! I have a question about my subscription.", 115},
			{0, 0, 1, "Sure, I'd be happy to help. What's your question?", 110},
			{0, 1, 0, "Can I upgrade my plan?", 105},
			{0, 0, 1, "Absolutely! You can upgrade anytime from your dashboard.", 100},
			{0, 1, 0, "Great, thanks!", 95},
			
			// Conversation 1 (Admin <-> Jane Smith)
			{1, 0, 2, "Hi Jane! Welcome to our platform.", 90},
			{1, 2, 0, "Thank you! I'm excited to get started.", 85},
			{1, 0, 2, "If you need any help, just let me know!", 80},
			{1, 2, 0, "Will do, thanks!", 75},
			
			// Conversation 2 (Admin <-> Bob Johnson)
			{2, 0, 3, "Hi Bob! How's everything going?", 70},
			{2, 3, 0, "Everything is great! Thanks for checking in.", 65},
			{2, 0, 3, "Glad to hear it! Let me know if you need anything.", 60},
			
			// Conversation 3 (John Doe <-> Jane Smith)
			{3, 1, 2, "Hey Jane! How's your business going?", 50},
			{3, 2, 1, "Great! Just launched our new website.", 45},
			{3, 1, 2, "That's awesome! Congrats!", 40},
			{3, 2, 1, "Thanks! How about yours?", 35},
			{3, 1, 2, "Going well, thanks for asking!", 30},
			
			// Conversation 4 (John Doe <-> Bob Johnson)
			{4, 1, 3, "Hi Bob, are you attending the meeting tomorrow?", 20},
			{4, 3, 1, "Yes, I'll be there at 2 PM.", 15},
			{4, 1, 3, "Perfect, see you there!", 10},
			
			// Conversation 5 (Jane Smith <-> Bob Johnson)
			{5, 2, 3, "Hey Bob, did you see the new features?", 5},
			{5, 3, 2, "Yes! They look amazing.", 2},
			{5, 2, 3, "I'm excited to try them out!", 1},
		}

		for _, msg := range fakeMessages {
			if msg.conversationIdx < len(conversationIDs) {
				convID := conversationIDs[msg.conversationIdx]
				senderID := allUserIDs[msg.senderIdx]
				receiverID := allUserIDs[msg.receiverIdx]
				
				// Get the actual user IDs from the conversation
				var actualUser1ID, actualUser2ID int
				err = db.Get(&actualUser1ID, "SELECT user1_id FROM conversations WHERE id = $1", convID)
				if err != nil {
					continue
				}
				err = db.Get(&actualUser2ID, "SELECT user2_id FROM conversations WHERE id = $1", convID)
				if err != nil {
					continue
				}

				// Ensure sender and receiver are part of this conversation
				if (senderID == actualUser1ID || senderID == actualUser2ID) &&
					(receiverID == actualUser1ID || receiverID == actualUser2ID) &&
					senderID != receiverID {
					
					messageTime := time.Now().Add(-time.Duration(msg.minutesAgo) * time.Minute)
					_, err = db.Exec(`
						INSERT INTO messages (conversation_id, sender_id, receiver_id, message, is_read, created_at, updated_at)
						VALUES ($1, $2, $3, $4, $5, $6, $6)
						ON CONFLICT DO NOTHING
					`, convID, senderID, receiverID, msg.message, msg.minutesAgo > 10, messageTime)
					
					// Update conversation last_message_at
					db.Exec("UPDATE conversations SET last_message_at = $1, updated_at = $1 WHERE id = $2", messageTime, convID)
				}
			}
		}
		
		log.Println("✅ Created fake conversations and messages!")
	}

	log.Println("✅ Database seeded successfully!")
	return nil
}

