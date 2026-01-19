CREATE TABLE IF NOT EXISTS conversations (
	id SERIAL PRIMARY KEY,
	user1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
	user2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
	last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	UNIQUE(user1_id, user2_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_user1_id ON conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2_id ON conversations(user2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);

