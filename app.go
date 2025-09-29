package main

import (
	"context"
	"log"

	"mooncaketv/handlers"
	"mooncaketv/models"
	"mooncaketv/services"
	"mooncaketv/utils"
)

// App struct
type App struct {
	ctx         context.Context
	db          *services.DatabaseService
	authHandler *handlers.AuthHandler
}


// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	
	// Initialize database
	dbPath, err := utils.GetAppDataPath("mooncaketv.db")
	if err != nil {
		log.Fatalf("Failed to get app data path: %v", err)
	}

	// Get the migrations path (relative to the executable)
	migrationsPath := "migrations"

	db, err := services.NewDatabaseService(dbPath, migrationsPath)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	a.db = db

	// Initialize auth service and handler
	authService := services.NewAuthService(db)
	a.authHandler = handlers.NewAuthHandler(authService)
}

// shutdown is called when the app is shutting down
func (a *App) shutdown(ctx context.Context) {
	if a.db != nil {
		a.db.Close()
	}
}

// Login authenticates a user - delegates to auth handler
func (a *App) Login(username, password string) models.APIResponse[*services.User] {
	user, err := a.authHandler.Login(username, password)
	if err != nil {
		return models.NewErrorResponse[*services.User](err.Error())
	}
	return models.NewSuccessResponse(user)
}

// Signup creates a new user account - delegates to auth handler
func (a *App) Signup(username, email, password string) models.APIResponse[*services.User] {
	user, err := a.authHandler.Signup(username, email, password)
	if err != nil {
		return models.NewErrorResponse[*services.User](err.Error())
	}
	return models.NewSuccessResponse(user)
}

// Database Management Functions

// GetDatabaseTables returns a list of all tables in the database
func (a *App) GetDatabaseTables() models.APIResponse[[]string] {
	tables, err := a.db.GetAllTables()
	if err != nil {
		return models.NewErrorResponse[[]string](err.Error())
	}
	return models.NewSuccessResponse(tables)
}

// GetMigrations returns all migration records
func (a *App) GetMigrations() models.APIResponse[[]map[string]interface{}] {
	migrations, err := a.db.GetMigrations()
	if err != nil {
		return models.NewErrorResponse[[]map[string]interface{}](err.Error())
	}
	return models.NewSuccessResponse(migrations)
}

// GetAllUsers returns all users in the database
func (a *App) GetAllUsers() models.APIResponse[[]map[string]interface{}] {
	users, err := a.db.GetAllUsers()
	if err != nil {
		return models.NewErrorResponse[[]map[string]interface{}](err.Error())
	}
	return models.NewSuccessResponse(users)
}

// GetAllSettings returns all settings records
func (a *App) GetAllSettings() models.APIResponse[[]map[string]interface{}] {
	settings, err := a.db.GetAllSettings()
	if err != nil {
		return models.NewErrorResponse[[]map[string]interface{}](err.Error())
	}
	return models.NewSuccessResponse(settings)
}

