CREATE TABLE IF NOT EXISTS messages (
	id SERIAL PRIMARY KEY,
	conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
	sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
	receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
	message TEXT NOT NULL,
	is_read BOOLEAN DEFAULT FALSE,
	read_at TIMESTAMP,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);

