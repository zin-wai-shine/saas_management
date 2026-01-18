package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"saas-management-api/internal/database"
	"saas-management-api/internal/models"

	"github.com/gin-gonic/gin"
)

type WebsiteHandler struct {
	DB *database.DB
}

func NewWebsiteHandler(db *database.DB) *WebsiteHandler {
	return &WebsiteHandler{DB: db}
}

func (h *WebsiteHandler) List(c *gin.Context) {
	var websites []models.Website
	err := h.DB.DB.Select(&websites, "SELECT * FROM websites ORDER BY created_at DESC")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch websites"})
		return
	}
	c.JSON(http.StatusOK, websites)
}

func (h *WebsiteHandler) Get(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var website models.Website
	err = h.DB.DB.Get(&website, "SELECT * FROM websites WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Website not found"})
		return
	}
	c.JSON(http.StatusOK, website)
}

func (h *WebsiteHandler) Create(c *gin.Context) {
	var website models.Website
	if err := c.ShouldBindJSON(&website); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var contentJSON sql.NullString
	if website.Content != nil {
		contentBytes, _ := json.Marshal(website.Content)
		contentJSON = sql.NullString{String: string(contentBytes), Valid: true}
	}

	err := h.DB.DB.Get(&website, `
		INSERT INTO websites (business_id, title, theme_name, content, is_demo, is_claimed, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
		RETURNING id, business_id, title, theme_name, content, is_demo, is_claimed, status, created_at, updated_at
	`, website.BusinessID, website.Title, website.ThemeName, contentJSON, website.IsDemo, website.IsClaimed, website.Status, time.Now())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create website"})
		return
	}

	c.JSON(http.StatusCreated, website)
}

func (h *WebsiteHandler) Update(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var website models.Website
	if err := c.ShouldBindJSON(&website); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var contentJSON sql.NullString
	if website.Content != nil {
		contentBytes, _ := json.Marshal(website.Content)
		contentJSON = sql.NullString{String: string(contentBytes), Valid: true}
	}

	err = h.DB.DB.Get(&website, `
		UPDATE websites 
		SET title = $1, theme_name = $2, content = $3, is_demo = $4, is_claimed = $5, status = $6, updated_at = $7
		WHERE id = $8
		RETURNING id, business_id, title, theme_name, content, is_demo, is_claimed, status, created_at, updated_at
	`, website.Title, website.ThemeName, contentJSON, website.IsDemo, website.IsClaimed, website.Status, time.Now(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update website"})
		return
	}

	c.JSON(http.StatusOK, website)
}

func (h *WebsiteHandler) Delete(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	_, err = h.DB.DB.Exec("DELETE FROM websites WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete website"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Website deleted successfully"})
}

