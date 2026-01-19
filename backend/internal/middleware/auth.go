package middleware

import (
	"log"
	"net/http"
	"strings"

	"saas-management-api/internal/auth"
	"saas-management-api/internal/models"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := ""
		authHeader := c.GetHeader("Authorization")
		
		if authHeader != "" {
			tokenString = strings.TrimPrefix(authHeader, "Bearer ")
		} else {
			// Check query parameter for WebSocket connections
			tokenString = c.Query("token")
		}

		if tokenString == "" {
			log.Printf("Auth Error: No token provided in header or query")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
			c.Abort()
			return
		}

		user, err := auth.ValidateToken(tokenString)
		if err != nil {
			log.Printf("Auth Error: Token validation failed: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		c.Set("user", user)
		c.Set("user_id", user.ID)
		c.Set("user_role", user.Role)
		c.Next()
	}
}

func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		user, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
			c.Abort()
			return
		}

		u, ok := user.(*models.User)
		if !ok || !u.IsAdmin() {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
			c.Abort()
			return
		}

		c.Next()
	}
}

func OwnerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		user, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
			c.Abort()
			return
		}

		u, ok := user.(*models.User)
		if !ok || !u.IsOwner() {
			c.JSON(http.StatusForbidden, gin.H{"error": "Owner access required"})
			c.Abort()
			return
		}

		c.Next()
	}
}

