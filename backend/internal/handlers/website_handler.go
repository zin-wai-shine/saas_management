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
		log.Printf("Error binding JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	urlStr := ""
	if website.URL != nil {
		urlStr = *website.URL
	}
	log.Printf("Creating website with data: Title=%s, URL=%s, BusinessID=%v, ThemeName=%s, Status=%s",
		website.Title, urlStr, website.BusinessID, website.ThemeName, website.Status)

	var urlSQL sql.NullString
	if website.URL != nil && *website.URL != "" {
		// Trim whitespace from URL
		trimmedURL := strings.TrimSpace(*website.URL)
		if trimmedURL != "" {
			urlSQL = sql.NullString{String: trimmedURL, Valid: true}
		}
	}

	var businessIDSQL sql.NullInt64
	if website.BusinessID != nil {
		businessIDSQL = sql.NullInt64{Int64: int64(*website.BusinessID), Valid: true}
	}

	// Ensure URL column exists (migration check)
	_, _ = h.DB.DB.Exec(`
		DO $$ 
		BEGIN 
			IF NOT EXISTS (
				SELECT 1 FROM information_schema.columns 
				WHERE table_name='websites' AND column_name='url'
			) THEN
				ALTER TABLE websites ADD COLUMN url VARCHAR(500);
			END IF;
		END $$;
	`)

	log.Printf("Executing INSERT: businessID=%v (Valid=%v), title=%s, url=%v (Valid=%v), theme=%s, is_demo=%v, is_claimed=%v, status=%s",
		businessIDSQL, businessIDSQL.Valid, website.Title, urlSQL, urlSQL.Valid, website.ThemeName, website.IsDemo, website.IsClaimed, website.Status)

	// Use RETURNING with sql.Null types for proper NULL handling
	type WebsiteResult struct {
		ID         int            `db:"id"`
		BusinessID sql.NullInt64  `db:"business_id"`
		Title      string         `db:"title"`
		URL        sql.NullString `db:"url"`
		ImageURL   sql.NullString `db:"image_url"`
		ThemeName  string         `db:"theme_name"`
		IsDemo     bool           `db:"is_demo"`
		IsClaimed  bool           `db:"is_claimed"`
		Status     string         `db:"status"`
		CreatedAt  time.Time      `db:"created_at"`
		UpdatedAt  time.Time      `db:"updated_at"`
	}

	var imageURLSQL sql.NullString
	if website.ImageURL != nil {
		imageURLSQL = sql.NullString{String: *website.ImageURL, Valid: true}
	}

	var result WebsiteResult
	err := h.DB.DB.Get(&result, `
		INSERT INTO websites (business_id, title, url, image_url, theme_name, is_demo, is_claimed, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
		RETURNING id, business_id, title, url, image_url, theme_name, is_demo, is_claimed, status, created_at, updated_at
	`, businessIDSQL, website.Title, urlSQL, imageURLSQL, website.ThemeName, website.IsDemo, website.IsClaimed, website.Status, time.Now())

	if err != nil {
		log.Printf("ERROR creating website: %v", err)
		log.Printf("Error type: %T", err)
		log.Printf("Full error details: %+v", err)
		errorMsg := err.Error()
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create website: " + errorMsg,
		})
		return
	}

	// Convert result to Website model
	website.ID = result.ID
	website.Title = result.Title
	website.ThemeName = result.ThemeName
	website.IsDemo = result.IsDemo
	website.IsClaimed = result.IsClaimed
	website.Status = result.Status
	website.CreatedAt = result.CreatedAt
	website.UpdatedAt = result.UpdatedAt

	// Handle nullable business_id
	if result.BusinessID.Valid {
		businessID := int(result.BusinessID.Int64)
		website.BusinessID = &businessID
	} else {
		website.BusinessID = nil
	}

	// Handle nullable url
	if result.URL.Valid && result.URL.String != "" {
		website.URL = &result.URL.String
	} else {
		website.URL = nil
	}

	// Handle nullable image_url
	if result.ImageURL.Valid && result.ImageURL.String != "" {
		website.ImageURL = &result.ImageURL.String
	} else {
		website.ImageURL = nil
	}

	log.Printf("Website created successfully with ID: %d", website.ID)
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
		log.Printf("Error binding JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("Updating website ID %d with data: Title=%s, URL=%v, ThemeName=%s, Status=%s",
		id, website.Title, website.URL, website.ThemeName, website.Status)

	var urlSQL sql.NullString
	if website.URL != nil && *website.URL != "" {
		// Trim whitespace from URL
		trimmedURL := strings.TrimSpace(*website.URL)
		if trimmedURL != "" {
			urlSQL = sql.NullString{String: trimmedURL, Valid: true}
			log.Printf("Setting URL to: %s", trimmedURL)
		} else {
			log.Printf("URL is empty after trimming, will set to NULL")
		}
	} else {
		log.Printf("URL is empty or nil, will set to NULL")
	}

	log.Printf("Executing UPDATE: id=%d, title=%s, url=%v (Valid=%v), theme=%s, status=%s",
		id, website.Title, urlSQL, urlSQL.Valid, website.ThemeName, website.Status)

	// Use intermediate struct with sql.Null types for proper NULL handling
	type WebsiteResult struct {
		ID         int            `db:"id"`
		BusinessID sql.NullInt64  `db:"business_id"`
		Title      string         `db:"title"`
		URL        sql.NullString `db:"url"`
		ImageURL   sql.NullString `db:"image_url"`
		ThemeName  string         `db:"theme_name"`
		IsDemo     bool           `db:"is_demo"`
		IsClaimed  bool           `db:"is_claimed"`
		Status     string         `db:"status"`
		CreatedAt  time.Time      `db:"created_at"`
		UpdatedAt  time.Time      `db:"updated_at"`
	}

	var imageURLSQL sql.NullString
	if website.ImageURL != nil {
		imageURLSQL = sql.NullString{String: *website.ImageURL, Valid: true}
	}

	var result WebsiteResult
	err = h.DB.DB.Get(&result, `
		UPDATE websites 
		SET title = $1, url = $2, image_url = $3, theme_name = $4, is_demo = $5, is_claimed = $6, status = $7, updated_at = $8
		WHERE id = $9
		RETURNING id, business_id, title, url, image_url, theme_name, is_demo, is_claimed, status, created_at, updated_at
	`, website.Title, urlSQL, imageURLSQL, website.ThemeName, website.IsDemo, website.IsClaimed, website.Status, time.Now(), id)
	if err != nil {
		log.Printf("ERROR updating website: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update website: " + err.Error()})
		return
	}

	// Convert result to Website model
	website.ID = result.ID
	website.Title = result.Title
	website.ThemeName = result.ThemeName
	website.IsDemo = result.IsDemo
	website.IsClaimed = result.IsClaimed
	website.Status = result.Status
	website.CreatedAt = result.CreatedAt
	website.UpdatedAt = result.UpdatedAt

	// Handle nullable business_id
	if result.BusinessID.Valid {
		businessID := int(result.BusinessID.Int64)
		website.BusinessID = &businessID
	} else {
		website.BusinessID = nil
	}

	// Handle nullable url
	if result.URL.Valid && result.URL.String != "" {
		website.URL = &result.URL.String
		log.Printf("Updated URL is: %s", result.URL.String)
	} else {
		website.URL = nil
		log.Printf("Updated URL is NULL")
	}

	// Handle nullable image_url
	if result.ImageURL.Valid && result.ImageURL.String != "" {
		website.ImageURL = &result.ImageURL.String
	} else {
		website.ImageURL = nil
	}

	log.Printf("Website updated successfully with ID: %d, URL: %v", website.ID, website.URL)
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
