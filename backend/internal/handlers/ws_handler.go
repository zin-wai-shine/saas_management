package handlers

import (
	"log"
	"net/http"
	"saas-management-api/internal/models"
	"saas-management-api/internal/ws"

	"github.com/gin-gonic/gin"
)

type WsHandler struct {
	Hub *ws.Hub
}

func NewWsHandler(hub *ws.Hub) *WsHandler {
	return &WsHandler{Hub: hub}
}

func (h *WsHandler) ServeWs(c *gin.Context) {
	val, exists := c.Get("user")
	if !exists {
		log.Printf("WS Error: User not found in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	user := val.(*models.User)
	log.Printf("WS: Upgrading connection for user %d (%s)", user.ID, user.Name)

	ws.ServeWs(h.Hub, c.Writer, c.Request, user.ID, user.Name)
}

