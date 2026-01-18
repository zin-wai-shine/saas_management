package handlers

import (
	"net/http"
	"strconv"
	"time"

	"saas-management-api/internal/database"
	"saas-management-api/internal/models"

	"github.com/gin-gonic/gin"
)

type BusinessHandler struct {
	DB *database.DB
}

func NewBusinessHandler(db *database.DB) *BusinessHandler {
	return &BusinessHandler{DB: db}
}

func (h *BusinessHandler) List(c *gin.Context) {
	var businesses []models.Business
	err := h.DB.DB.Select(&businesses, "SELECT * FROM businesses ORDER BY created_at DESC")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch businesses"})
		return
	}
	c.JSON(http.StatusOK, businesses)
}

func (h *BusinessHandler) Get(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var business models.Business
	err = h.DB.DB.Get(&business, "SELECT * FROM businesses WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Business not found"})
		return
	}
	c.JSON(http.StatusOK, business)
}

func (h *BusinessHandler) Create(c *gin.Context) {
	var business models.Business
	if err := c.ShouldBindJSON(&business); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, _ := c.Get("user")
	u := user.(*models.User)
	business.UserID = &u.ID

	err := h.DB.DB.Get(&business, `
		INSERT INTO businesses (user_id, name, slug, description, logo, industry, phone, address, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10)
		RETURNING id, user_id, name, slug, description, logo, industry, phone, address, status, created_at, updated_at
	`, business.UserID, business.Name, business.Slug, business.Description, business.Logo, business.Industry, business.Phone, business.Address, business.Status, time.Now())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create business"})
		return
	}

	c.JSON(http.StatusCreated, business)
}

func (h *BusinessHandler) Update(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var business models.Business
	if err := c.ShouldBindJSON(&business); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = h.DB.DB.Get(&business, `
		UPDATE businesses 
		SET name = $1, slug = $2, description = $3, logo = $4, industry = $5, phone = $6, address = $7, status = $8, updated_at = $9
		WHERE id = $10
		RETURNING id, user_id, name, slug, description, logo, industry, phone, address, status, created_at, updated_at
	`, business.Name, business.Slug, business.Description, business.Logo, business.Industry, business.Phone, business.Address, business.Status, time.Now(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update business"})
		return
	}

	c.JSON(http.StatusOK, business)
}

func (h *BusinessHandler) Delete(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	_, err = h.DB.DB.Exec("DELETE FROM businesses WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete business"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Business deleted successfully"})
}

