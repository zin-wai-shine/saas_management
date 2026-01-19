package router

import (
	"log"
	"saas-management-api/internal/config"
	"saas-management-api/internal/database"
	"saas-management-api/internal/handlers"
	"saas-management-api/internal/middleware"
	"saas-management-api/internal/ws"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

func SetupRouter(db *sqlx.DB, cfg *config.Config) *gin.Engine {
	r := gin.Default()

	// Serve uploaded files
	r.Static("/uploads", "./uploads")

	// CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Initialize handlers
	dbWrapper := database.NewDB(db)
	authHandler := handlers.NewAuthHandler(dbWrapper)
	businessHandler := handlers.NewBusinessHandler(dbWrapper)
	websiteHandler := handlers.NewWebsiteHandler(dbWrapper)
	planHandler := handlers.NewPlanHandler(dbWrapper)
	subscriptionHandler := handlers.NewSubscriptionHandler(dbWrapper)
	notificationHandler := handlers.NewNotificationHandler(dbWrapper)
	messageHandler := handlers.NewMessageHandler(dbWrapper)
	fileHandler := handlers.NewFileHandler()

	// Initialize WebSocket
	hub := ws.NewHub(dbWrapper)
	go hub.Run()
	wsHandler := handlers.NewWsHandler(hub)

	log.Println("Registering WebSocket route at /api/ws")

	// Public routes
	api := r.Group("/api")
	{
		// Auth routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
		}

		// Public business search
		api.GET("/businesses/search", businessHandler.List)
		api.GET("/websites/demos", websiteHandler.List)
		api.GET("/plans", planHandler.List)
	}

	// Protected routes
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/auth/me", authHandler.Me)
		protected.GET("/users/search", authHandler.SearchUsers)
		protected.GET("/ws", wsHandler.ServeWs)
		protected.POST("/upload", fileHandler.Upload)

		// Business routes
		businesses := protected.Group("/businesses")
		{
			businesses.GET("", businessHandler.List)
			businesses.GET("/:id", businessHandler.Get)
			businesses.POST("", businessHandler.Create)
			businesses.PUT("/:id", businessHandler.Update)
			businesses.DELETE("/:id", businessHandler.Delete)
		}

		// Website routes
		websites := protected.Group("/websites")
		{
			websites.GET("", websiteHandler.List)
			websites.GET("/:id", websiteHandler.Get)
			websites.POST("", websiteHandler.Create)
			websites.PUT("/:id", websiteHandler.Update)
			websites.DELETE("/:id", websiteHandler.Delete)
		}

		// Subscription routes
		subscriptions := protected.Group("/subscriptions")
		{
			subscriptions.GET("", subscriptionHandler.List)
			subscriptions.GET("/:id", subscriptionHandler.Get)
			subscriptions.POST("", subscriptionHandler.Create)
			subscriptions.PUT("/:id", subscriptionHandler.Update)
			subscriptions.DELETE("/:id", subscriptionHandler.Delete)
		}

		// Notification routes (all authenticated users)
		notifications := protected.Group("/notifications")
		{
			notifications.GET("", notificationHandler.List)
			notifications.GET("/unread-count", notificationHandler.UnreadCount)
			notifications.GET("/:id", notificationHandler.Get)
			notifications.POST("", notificationHandler.Create)
			notifications.PUT("/:id", notificationHandler.Update)
			notifications.DELETE("/:id", notificationHandler.Delete)
		}

		// Message/Conversation routes (all authenticated users)
		messages := protected.Group("/messages")
		{
			messages.GET("", messageHandler.ListAll)
			messages.GET("/conversations", messageHandler.ListConversations)
			messages.POST("/conversations", messageHandler.GetOrCreateConversation)
			messages.GET("/conversations/:id/messages", messageHandler.GetMessages)
			messages.POST("/send", messageHandler.SendMessage)
			messages.GET("/unread-count", messageHandler.GetUnreadCount)
		}
	}

	// Admin routes
	admin := protected.Group("/admin")
	admin.Use(middleware.AdminMiddleware())
	{
		// Plan management (admin only)
		plans := admin.Group("/plans")
		{
			plans.GET("", planHandler.List)
			plans.GET("/:id", planHandler.Get)
			plans.POST("", planHandler.Create)
			plans.PUT("/:id", planHandler.Update)
			plans.DELETE("/:id", planHandler.Delete)
		}
	}

	return r
}

