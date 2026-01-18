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

type PlanHandler struct {
	DB *database.DB
}

func NewPlanHandler(db *database.DB) *PlanHandler {
	return &PlanHandler{DB: db}
}

func (h *PlanHandler) List(c *gin.Context) {
	var plans []models.Plan
	err := h.DB.DB.Select(&plans, "SELECT * FROM plans ORDER BY price ASC")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch plans"})
		return
	}
	c.JSON(http.StatusOK, plans)
}

func (h *PlanHandler) Get(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var plan models.Plan
	err = h.DB.DB.Get(&plan, "SELECT * FROM plans WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Plan not found"})
		return
	}
	c.JSON(http.StatusOK, plan)
}

func (h *PlanHandler) Create(c *gin.Context) {
	var plan models.Plan
	if err := c.ShouldBindJSON(&plan); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var featuresJSON sql.NullString
	if plan.Features != nil {
		featuresBytes, _ := json.Marshal(plan.Features)
		featuresJSON = sql.NullString{String: string(featuresBytes), Valid: true}
	}

	err := h.DB.DB.Get(&plan, `
		INSERT INTO plans (name, description, price, billing_cycle, features, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $6)
		RETURNING id, name, description, price, billing_cycle, features, created_at, updated_at
	`, plan.Name, plan.Description, plan.Price, plan.BillingCycle, featuresJSON, time.Now())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create plan"})
		return
	}

	c.JSON(http.StatusCreated, plan)
}

func (h *PlanHandler) Update(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var plan models.Plan
	if err := c.ShouldBindJSON(&plan); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var featuresJSON sql.NullString
	if plan.Features != nil {
		featuresBytes, _ := json.Marshal(plan.Features)
		featuresJSON = sql.NullString{String: string(featuresBytes), Valid: true}
	}

	err = h.DB.DB.Get(&plan, `
		UPDATE plans 
		SET name = $1, description = $2, price = $3, billing_cycle = $4, features = $5, updated_at = $6
		WHERE id = $7
		RETURNING id, name, description, price, billing_cycle, features, created_at, updated_at
	`, plan.Name, plan.Description, plan.Price, plan.BillingCycle, featuresJSON, time.Now(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update plan"})
		return
	}

	c.JSON(http.StatusOK, plan)
}

func (h *PlanHandler) Delete(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	_, err = h.DB.DB.Exec("DELETE FROM plans WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete plan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Plan deleted successfully"})
}

