package main

import (
	"context"
	"embed"
	"log"
	"os/exec"
	"path/filepath"
	"runtime"

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
	migrations  embed.FS
}


// NewApp creates a new App application struct
func NewApp(migrations embed.FS) *App {
	return &App{
		migrations: migrations,
	}
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

	db, err := services.NewDatabaseService(dbPath, a.migrations)
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

// GetCurrentUser returns the current user's information by user ID
func (a *App) GetCurrentUser(userID int) models.APIResponse[map[string]interface{}] {
	user, err := a.db.GetUserByID(userID)
	if err != nil {
		return models.NewErrorResponse[map[string]interface{}](err.Error())
	}
	return models.NewSuccessResponse(user)
}

// GetUserSettings returns all settings for a specific user
func (a *App) GetUserSettings(userID int) models.APIResponse[[]map[string]interface{}] {
	settings, err := a.db.GetUserSettings(userID)
	if err != nil {
		return models.NewErrorResponse[[]map[string]interface{}](err.Error())
	}
	return models.NewSuccessResponse(settings)
}

// UpdateSetting updates a setting value
func (a *App) UpdateSetting(settingID int, newValue string, userID int, isAdmin bool) models.APIResponse[bool] {
	err := a.db.UpdateSetting(settingID, newValue, userID, isAdmin)
	if err != nil {
		return models.NewErrorResponse[bool](err.Error())
	}
	return models.NewSuccessResponse(true)
}

// DeleteSetting deletes a setting
func (a *App) DeleteSetting(settingID int, userID int, isAdmin bool) models.APIResponse[bool] {
	err := a.db.DeleteSetting(settingID, userID, isAdmin)
	if err != nil {
		return models.NewErrorResponse[bool](err.Error())
	}
	return models.NewSuccessResponse(true)
}

// OpenDatabaseDirectory opens the directory containing the SQLite database file
func (a *App) OpenDatabaseDirectory() models.APIResponse[string] {
	dbPath, err := utils.GetAppDataPath("mooncaketv.db")
	if err != nil {
		return models.NewErrorResponse[string](err.Error())
	}

	dir := filepath.Dir(dbPath)

	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("explorer", dir)
	case "darwin":
		cmd = exec.Command("open", dir)
	case "linux":
		cmd = exec.Command("xdg-open", dir)
	default:
		return models.NewErrorResponse[string]("Unsupported operating system")
	}

	if err := cmd.Start(); err != nil {
		return models.NewErrorResponse[string]("Failed to open directory: " + err.Error())
	}

	return models.NewSuccessResponse(dir)
}

// Bookmark Management Functions

// AddBookmark adds a bookmark for a user
func (a *App) AddBookmark(userID int, mcID string) models.APIResponse[bool] {
	err := a.db.AddBookmark(userID, mcID)
	if err != nil {
		return models.NewErrorResponse[bool](err.Error())
	}
	return models.NewSuccessResponse(true)
}

// RemoveBookmark removes a bookmark for a user
func (a *App) RemoveBookmark(userID int, mcID string) models.APIResponse[bool] {
	err := a.db.RemoveBookmark(userID, mcID)
	if err != nil {
		return models.NewErrorResponse[bool](err.Error())
	}
	return models.NewSuccessResponse(true)
}

// IsBookmarked checks if a user has bookmarked a specific media
func (a *App) IsBookmarked(userID int, mcID string) models.APIResponse[bool] {
	isBookmarked, err := a.db.IsBookmarked(userID, mcID)
	if err != nil {
		return models.NewErrorResponse[bool](err.Error())
	}
	return models.NewSuccessResponse(isBookmarked)
}

// GetUserBookmarks returns all bookmarked mc_ids for a user
func (a *App) GetUserBookmarks(userID int) models.APIResponse[[]string] {
	bookmarks, err := a.db.GetUserBookmarks(userID)
	if err != nil {
		return models.NewErrorResponse[[]string](err.Error())
	}
	return models.NewSuccessResponse(bookmarks)
}

// GetBookmarkedMediaDetails returns full media details for user's bookmarks
func (a *App) GetBookmarkedMediaDetails(userID int) models.APIResponse[[]map[string]interface{}] {
	bookmarks, err := a.db.GetBookmarkedMediaDetails(userID)
	if err != nil {
		return models.NewErrorResponse[[]map[string]interface{}](err.Error())
	}
	return models.NewSuccessResponse(bookmarks)
}

// SaveMediaInfo saves media information to the database
func (a *App) SaveMediaInfo(mcID, title, description string, year int, genre, region, category, posterURL, videoURLs string, rating float64) models.APIResponse[bool] {
	err := a.db.SaveOrUpdateMedia(mcID, title, description, year, genre, region, category, posterURL, videoURLs, rating)
	if err != nil {
		return models.NewErrorResponse[bool](err.Error())
	}
	return models.NewSuccessResponse(true)
}

// DeleteMediaInfo deletes media information from the database
func (a *App) DeleteMediaInfo(mcID string) models.APIResponse[bool] {
	err := a.db.DeleteMedia(mcID)
	if err != nil {
		return models.NewErrorResponse[bool](err.Error())
	}
	return models.NewSuccessResponse(true)
}

