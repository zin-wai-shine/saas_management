package handlers

import (
	"net/http"
	"strconv"
	"time"

	"saas-management-api/internal/database"
	"saas-management-api/internal/models"

	"github.com/gin-gonic/gin"
)

type SubscriptionHandler struct {
	DB *database.DB
}

func NewSubscriptionHandler(db *database.DB) *SubscriptionHandler {
	return &SubscriptionHandler{DB: db}
}

func (h *SubscriptionHandler) List(c *gin.Context) {
	var subscriptions []models.Subscription
	err := h.DB.DB.Select(&subscriptions, "SELECT * FROM subscriptions ORDER BY created_at DESC")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch subscriptions"})
		return
	}
	c.JSON(http.StatusOK, subscriptions)
}

func (h *SubscriptionHandler) Get(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var subscription models.Subscription
	err = h.DB.DB.Get(&subscription, "SELECT * FROM subscriptions WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Subscription not found"})
		return
	}
	c.JSON(http.StatusOK, subscription)
}

func (h *SubscriptionHandler) Create(c *gin.Context) {
	var subscription models.Subscription
	if err := c.ShouldBindJSON(&subscription); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.DB.DB.Get(&subscription, `
		INSERT INTO subscriptions (business_id, plan_id, status, ends_at, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $5)
		RETURNING id, business_id, plan_id, status, ends_at, created_at, updated_at
	`, subscription.BusinessID, subscription.PlanID, subscription.Status, subscription.EndsAt, time.Now())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create subscription"})
		return
	}

	c.JSON(http.StatusCreated, subscription)
}

func (h *SubscriptionHandler) Update(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var subscription models.Subscription
	if err := c.ShouldBindJSON(&subscription); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = h.DB.DB.Get(&subscription, `
		UPDATE subscriptions 
		SET status = $1, ends_at = $2, updated_at = $3
		WHERE id = $4
		RETURNING id, business_id, plan_id, status, ends_at, created_at, updated_at
	`, subscription.Status, subscription.EndsAt, time.Now(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update subscription"})
		return
	}

	c.JSON(http.StatusOK, subscription)
}

func (h *SubscriptionHandler) Delete(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	_, err = h.DB.DB.Exec("DELETE FROM subscriptions WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete subscription"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Subscription deleted successfully"})
}

