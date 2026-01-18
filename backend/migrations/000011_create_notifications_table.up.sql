CREATE TABLE IF NOT EXISTS notifications (
	id SERIAL PRIMARY KEY,
	user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
	from_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
	subject VARCHAR(255) NOT NULL,
	message TEXT NOT NULL,
	type VARCHAR(50) DEFAULT 'message',
	status VARCHAR(50) DEFAULT 'unread',
	is_read BOOLEAN DEFAULT FALSE,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

