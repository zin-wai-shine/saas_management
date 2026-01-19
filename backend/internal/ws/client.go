package ws

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"saas-management-api/internal/models"

	"github.com/gorilla/websocket"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // In production, you should check the origin
	},
}

// Client is a middleman between the websocket connection and the hub.
type Client struct {
	hub *Hub

	// The websocket connection.
	conn *websocket.Conn

	// Buffered channel of outbound messages.
	send chan []byte

	// User information
	userID   int
	username string
}

// readPump pumps messages from the websocket connection to the hub.
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}

		// Parse the message to check type
		var generic struct {
			Type        string `json:"type"`
			ReceiverID  int    `json:"receiver_id"`
			Message     string `json:"message"`
			MessageType string `json:"message_type"`
			IsTyping    bool   `json:"is_typing"`
		}
		if err := json.Unmarshal(message, &generic); err != nil {
			log.Printf("error unmarshaling incoming message: %v", err)
			continue
		}

		// Handle Typing Event
		if generic.Type == "typing" {
			broadcastMsg, _ := json.Marshal(map[string]interface{}{
				"type": "typing",
				"data": map[string]interface{}{
					"sender_id":   c.userID,
					"receiver_id": generic.ReceiverID,
					"is_typing":   generic.IsTyping,
				},
			})
			c.hub.broadcast <- broadcastMsg
			continue
		}

		// Proceed with regular message saving
		// Get or create conversation (simplified logic for WS)
		user1ID := c.userID
		user2ID := generic.ReceiverID
		if user1ID > user2ID {
			user1ID, user2ID = user2ID, user1ID
		}

		var convID int
		err = c.hub.db.Get(&convID, "SELECT id FROM conversations WHERE user1_id = $1 AND user2_id = $2", user1ID, user2ID)
		if err != nil {
			// Create conversation if not exists
			now := time.Now()
			err = c.hub.db.Get(&convID, "INSERT INTO conversations (user1_id, user2_id, created_at, updated_at, last_message_at) VALUES ($1, $2, $3, $3, $3) RETURNING id", user1ID, user2ID, now)
			if err != nil {
				log.Printf("error creating conversation in WS: %v", err)
				continue
			}
		}

		// Save message to DB
		now := time.Now()
		var msg models.Message
		msgType := generic.MessageType
		if msgType == "" {
			msgType = "text"
		}
		err = c.hub.db.Get(&msg, "INSERT INTO messages (conversation_id, sender_id, receiver_id, message, message_type, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $6) RETURNING *", convID, c.userID, generic.ReceiverID, generic.Message, msgType, now)
		if err != nil {
			log.Printf("error saving message in WS: %v", err)
			continue
		}

		// Update conversation last_message_at
		c.hub.db.Exec("UPDATE conversations SET last_message_at = $1, updated_at = $1 WHERE id = $2", now, convID)

		// Set sender name for broadcast
		if c.username != "" {
			msg.SenderName = &c.username
		} else {
			var name string
			err = c.hub.db.Get(&name, "SELECT name FROM users WHERE id = $1", c.userID)
			if err == nil {
				msg.SenderName = &name
			}
		}

		// Marshall back to broadcast
		broadcastMsg, _ := json.Marshal(map[string]interface{}{
			"type": "message",
			"data": msg,
		})
		c.hub.broadcast <- broadcastMsg
	}
}

// writePump pumps messages from the hub to the websocket connection.
func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel.
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// ServeWs handles websocket requests from the peer.
func ServeWs(hub *Hub, w http.ResponseWriter, r *http.Request, userID int, username string) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	client := &Client{hub: hub, conn: conn, send: make(chan []byte, 256), userID: userID, username: username}
	client.hub.register <- client

	// Send last 50 messages
	var lastMessages []models.Message
	query := `
		SELECT m.*, u1.name as sender_name, u2.name as receiver_name
		FROM messages m
		LEFT JOIN users u1 ON m.sender_id = u1.id
		LEFT JOIN users u2 ON m.receiver_id = u2.id
		WHERE m.sender_id = $1 OR m.receiver_id = $1
		ORDER BY m.created_at DESC
		LIMIT 50
	`
	err = hub.db.Select(&lastMessages, query, userID)
	if err == nil {
		history, _ := json.Marshal(map[string]interface{}{
			"type": "history",
			"data": lastMessages,
		})
		client.send <- history
	}

	// Allow collection of memory referenced by the caller by doing all work in
	// new goroutines.
	go client.writePump()
	go client.readPump()
}
