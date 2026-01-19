package ws

import (
	"encoding/json"
	"saas-management-api/internal/database"
)

// Hub maintains the set of active clients and broadcasts messages to the clients.
type Hub struct {
	// Registered clients.
	clients map[*Client]bool

	// User ID to active clients mapping
	userClients map[int]int

	// Inbound messages from the clients.
	broadcast chan []byte

	// Register requests from the clients.
	register chan *Client

	// Unregister requests from clients.
	unregister chan *Client

	// Database connection
	db *database.DB
}

func NewHub(db *database.DB) *Hub {
	return &Hub{
		broadcast:   make(chan []byte),
		register:    make(chan *Client),
		unregister:  make(chan *Client),
		clients:     make(map[*Client]bool),
		userClients: make(map[int]int),
		db:          db,
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
			h.userClients[client.userID]++
			h.broadcastOnlineUsers()
		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				h.userClients[client.userID]--
				if h.userClients[client.userID] <= 0 {
					delete(h.userClients, client.userID)
				}
				h.broadcastOnlineUsers()
			}
		case message := <-h.broadcast:
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}

func (h *Hub) broadcastOnlineUsers() {
	onlineUsers := make([]int, 0, len(h.userClients))
	for userID := range h.userClients {
		onlineUsers = append(onlineUsers, userID)
	}

	msg, _ := json.Marshal(map[string]interface{}{
		"type": "online_users",
		"users": onlineUsers,
	})

	for client := range h.clients {
		select {
		case client.send <- msg:
		default:
			close(client.send)
			delete(h.clients, client)
		}
	}
}
