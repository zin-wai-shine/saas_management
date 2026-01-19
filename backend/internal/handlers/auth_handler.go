package handlers

import (
	"log"
	"net/http"
	"strings"
	"time"

	"saas-management-api/internal/auth"
	"saas-management-api/internal/database"
	"saas-management-api/internal/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	DB *database.DB
}

func NewAuthHandler(db *database.DB) *AuthHandler {
	return &AuthHandler{DB: db}
}

type RegisterRequest struct {
	Name         string  `json:"name" binding:"required"`
	Email        string  `json:"email" binding:"required,email"`
	Password     string  `json:"password" binding:"required,min=8"`
	Role         string  `json:"role"`
	BusinessName *string `json:"business_name"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if user exists
	var existingUser models.User
	err := h.DB.DB.Get(&existingUser, "SELECT id FROM users WHERE email = $1", req.Email)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User already exists"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Set default role
	role := req.Role
	if role == "" {
		role = "owner"
	}

	// Insert user
	var user models.User
	err = h.DB.DB.Get(&user, `
		INSERT INTO users (name, email, password, role, business_name, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $6)
		RETURNING id, name, email, role, business_name, created_at, updated_at
	`, req.Name, req.Email, string(hashedPassword), role, req.BusinessName, time.Now())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Also create a business record if business name is provided
	if req.BusinessName != nil && *req.BusinessName != "" {
		slug := strings.ToLower(strings.ReplaceAll(*req.BusinessName, " ", "-"))
		h.DB.DB.Exec(`
			INSERT INTO businesses (user_id, name, slug, status, created_at, updated_at)
			VALUES ($1, $2, $3, 'active', $4, $4)
			ON CONFLICT (slug) DO NOTHING
		`, user.ID, *req.BusinessName, slug, time.Now())
	}

	// Generate token
	token, err := auth.GenerateToken(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"user":  user,
		"token": token,
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user
	var user models.User
	err := h.DB.DB.Get(&user, "SELECT id, name, email, password, role FROM users WHERE email = $1", req.Email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Check password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Generate token
	token, err := auth.GenerateToken(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Remove password from response
	user.Password = ""

	c.JSON(http.StatusOK, gin.H{
		"user":  user,
		"token": token,
	})
}

func (h *AuthHandler) Me(c *gin.Context) {
	user, _ := c.Get("user")
	c.JSON(http.StatusOK, gin.H{"user": user})
}

func (h *AuthHandler) SearchUsers(c *gin.Context) {
	query := c.Query("q")
	log.Printf("Searching users with query: %s", query)
	if query == "" {
		c.JSON(http.StatusOK, []models.User{})
		return
	}

	// Make search more flexible by replacing spaces with %
	flexibleSearch := "%" + strings.ReplaceAll(query, " ", "%") + "%"
	var users []models.User
	err := h.DB.DB.Select(&users, `
		SELECT id, name, email, role, business_name, created_at, updated_at
		FROM users
		WHERE (name ILIKE $1 OR business_name ILIKE $1)
		AND role != 'admin'
		LIMIT 10
	`, flexibleSearch)

	if err != nil {
		log.Printf("Search failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search users"})
		return
	}

	log.Printf("Found %d users for query: %s (pattern: %s)", len(users), query, flexibleSearch)
	c.JSON(http.StatusOK, users)
}

