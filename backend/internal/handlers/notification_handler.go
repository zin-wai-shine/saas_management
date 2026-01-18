package handlers

import (
	"database/sql"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"saas-management-api/internal/database"
	"saas-management-api/internal/models"

	"github.com/gin-gonic/gin"
)

type NotificationHandler struct {
	DB *database.DB
}

func NewNotificationHandler(db *database.DB) *NotificationHandler {
	return &NotificationHandler{DB: db}
}

// List notifications - Admin can see all, users see only their own
func (h *NotificationHandler) List(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userRole, _ := c.Get("user_role")
	isAdmin := userRole == "admin"

	var notifications []models.Notification
	var err error

	if isAdmin {
		// Admin sees all notifications with user names
		query := `
			SELECT n.*, 
			       u1.name as user_name,
			       u2.name as from_user_name
			FROM notifications n
			LEFT JOIN users u1 ON n.user_id = u1.id
			LEFT JOIN users u2 ON n.from_user_id = u2.id
			ORDER BY n.created_at DESC
		`
		err = h.DB.DB.Select(&notifications, query)
	} else {
		// Regular users see only their own notifications
		query := `
			SELECT n.*,
			       u2.name as from_user_name
			FROM notifications n
			LEFT JOIN users u2 ON n.from_user_id = u2.id
			WHERE n.user_id = $1
			ORDER BY n.created_at DESC
		`
		err = h.DB.DB.Select(&notifications, query, userID)
	}

	if err != nil {
		log.Printf("Error fetching notifications: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch notifications"})
		return
	}

	c.JSON(http.StatusOK, notifications)
}

// Get single notification
func (h *NotificationHandler) Get(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userRole, _ := c.Get("user_role")
	isAdmin := userRole == "admin"

	var notification models.Notification
	if isAdmin {
		query := `
			SELECT n.*,
			       u1.name as user_name,
			       u2.name as from_user_name
			FROM notifications n
			LEFT JOIN users u1 ON n.user_id = u1.id
			LEFT JOIN users u2 ON n.from_user_id = u2.id
			WHERE n.id = $1
		`
		err = h.DB.DB.Get(&notification, query, id)
	} else {
		query := `
			SELECT n.*,
			       u2.name as from_user_name
			FROM notifications n
			LEFT JOIN users u2 ON n.from_user_id = u2.id
			WHERE n.id = $1 AND n.user_id = $2
		`
		err = h.DB.DB.Get(&notification, query, id, userID)
	}

	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
			return
		}
		log.Printf("Error fetching notification: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch notification"})
		return
	}

	c.JSON(http.StatusOK, notification)
}

// Create notification - Users can send messages to admins
func (h *NotificationHandler) Create(c *gin.Context) {
	var req models.NotificationCreate
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fromUserID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// If user_id is null or 0, send to all admins
	if req.UserID == nil || *req.UserID == 0 {
		// Get all admin user IDs
		var adminIDs []int
		err := h.DB.DB.Select(&adminIDs, "SELECT id FROM users WHERE role = 'admin'")
		if err != nil {
			log.Printf("Error fetching admin IDs: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send notification"})
			return
		}

		if len(adminIDs) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No admin users found"})
			return
		}

		// Create notification for each admin
		notifications := []models.Notification{}
		for _, adminID := range adminIDs {
			query := `
				INSERT INTO notifications (user_id, from_user_id, subject, message, type, status, is_read, created_at, updated_at)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
				RETURNING *
			`
			now := time.Now()
			var notification models.Notification
			err := h.DB.DB.Get(&notification, query,
				adminID,
				fromUserID,
				req.Subject,
				req.Message,
				req.Type,
				"unread",
				false,
				now,
				now,
			)
			if err != nil {
				log.Printf("Error creating notification for admin %d: %v", adminID, err)
				continue
			}
			notifications = append(notifications, notification)
		}

		if len(notifications) == 0 {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create notifications"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"message": "Notifications sent", "notifications": notifications})
		return
	}

	// Send to specific user
	query := `
		INSERT INTO notifications (user_id, from_user_id, subject, message, type, status, is_read, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING *
	`
	now := time.Now()
	var notification models.Notification
	err := h.DB.DB.Get(&notification, query,
		req.UserID,
		fromUserID,
		req.Subject,
		req.Message,
		req.Type,
		"unread",
		false,
		now,
		now,
	)

	if err != nil {
		log.Printf("Error creating notification: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create notification"})
		return
	}

	c.JSON(http.StatusCreated, notification)
}

// Update notification (mark as read, update status)
func (h *NotificationHandler) Update(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userRole, _ := c.Get("user_role")
	isAdmin := userRole == "admin"

	var req struct {
		IsRead *bool   `json:"is_read,omitempty"`
		Status *string `json:"status,omitempty"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if user has access to this notification
	var notification models.Notification
	checkQuery := "SELECT * FROM notifications WHERE id = $1"
	if !isAdmin {
		checkQuery += " AND user_id = $2"
		err = h.DB.DB.Get(&notification, checkQuery, id, userID)
	} else {
		err = h.DB.DB.Get(&notification, checkQuery, id)
	}

	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
			return
		}
		log.Printf("Error fetching notification: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update notification"})
		return
	}

	// Build update query
	updates := []string{}
	args := []interface{}{}
	argIndex := 1

	if req.IsRead != nil {
		updates = append(updates, "is_read = $"+strconv.Itoa(argIndex))
		args = append(args, *req.IsRead)
		argIndex++
		if *req.IsRead {
			updates = append(updates, "status = $"+strconv.Itoa(argIndex))
			args = append(args, "read")
			argIndex++
		}
	}

	if req.Status != nil {
		updates = append(updates, "status = $"+strconv.Itoa(argIndex))
		args = append(args, *req.Status)
		argIndex++
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No fields to update"})
		return
	}

	updates = append(updates, "updated_at = $"+strconv.Itoa(argIndex))
	args = append(args, time.Now())
	argIndex++

	args = append(args, id)

	query := "UPDATE notifications SET " + strings.Join(updates, ", ") + " WHERE id = $" + strconv.Itoa(argIndex)
	if !isAdmin {
		argIndex++
		args = append(args, userID)
		query += " AND user_id = $" + strconv.Itoa(argIndex)
	}

	result, err := h.DB.DB.Exec(query, args...)
	if err != nil {
		log.Printf("Error updating notification: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update notification"})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
		return
	}

	// Fetch updated notification
	var updatedNotification models.Notification
	if isAdmin {
		query = `
			SELECT n.*,
			       u1.name as user_name,
			       u2.name as from_user_name
			FROM notifications n
			LEFT JOIN users u1 ON n.user_id = u1.id
			LEFT JOIN users u2 ON n.from_user_id = u2.id
			WHERE n.id = $1
		`
		err = h.DB.DB.Get(&updatedNotification, query, id)
	} else {
		query = `
			SELECT n.*,
			       u2.name as from_user_name
			FROM notifications n
			LEFT JOIN users u2 ON n.from_user_id = u2.id
			WHERE n.id = $1 AND n.user_id = $2
		`
		err = h.DB.DB.Get(&updatedNotification, query, id, userID)
	}

	if err != nil {
		log.Printf("Error fetching updated notification: %v", err)
		c.JSON(http.StatusOK, gin.H{"message": "Notification updated"})
		return
	}

	c.JSON(http.StatusOK, updatedNotification)
}

// Delete notification
func (h *NotificationHandler) Delete(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userRole, _ := c.Get("user_role")
	isAdmin := userRole == "admin"

	query := "DELETE FROM notifications WHERE id = $1"
	args := []interface{}{id}
	if !isAdmin {
		query += " AND user_id = $2"
		args = append(args, userID)
	}

	result, err := h.DB.DB.Exec(query, args...)
	if err != nil {
		log.Printf("Error deleting notification: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete notification"})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notification deleted"})
}

// Get unread count
func (h *NotificationHandler) UnreadCount(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var count int
	err := h.DB.DB.Get(&count, "SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE", userID)
	if err != nil {
		log.Printf("Error fetching unread count: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch unread count"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"count": count})
}

