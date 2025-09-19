package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"runtime"

	"mooncaketv/services"
)

// App struct
type App struct {
	ctx context.Context
	db  *services.DatabaseService
}

// getAppDataPath returns the appropriate directory for storing app data based on the OS
func getAppDataPath(filename string) (string, error) {
	var appDataDir string
	
	switch runtime.GOOS {
	case "windows":
		appDataDir = os.Getenv("APPDATA")
		if appDataDir == "" {
			return "", fmt.Errorf("APPDATA environment variable not set")
		}
		appDataDir = filepath.Join(appDataDir, "MooncakeTV")
	case "darwin": // macOS
		homeDir, err := os.UserHomeDir()
		if err != nil {
			return "", fmt.Errorf("failed to get user home directory: %w", err)
		}
		appDataDir = filepath.Join(homeDir, "Library", "Application Support", "MooncakeTV")
	case "linux":
		// Use XDG Base Directory specification
		xdgDataHome := os.Getenv("XDG_DATA_HOME")
		if xdgDataHome == "" {
			homeDir, err := os.UserHomeDir()
			if err != nil {
				return "", fmt.Errorf("failed to get user home directory: %w", err)
			}
			xdgDataHome = filepath.Join(homeDir, ".local", "share")
		}
		appDataDir = filepath.Join(xdgDataHome, "mooncaketv")
	default:
		return "", fmt.Errorf("unsupported operating system: %s", runtime.GOOS)
	}
	
	// Create the directory if it doesn't exist
	if err := os.MkdirAll(appDataDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create app data directory: %w", err)
	}
	
	return filepath.Join(appDataDir, filename), nil
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
	dbPath, err := getAppDataPath("mooncaketv.db")
	if err != nil {
		log.Fatalf("Failed to get app data path: %v", err)
	}
	
	db, err := services.NewDatabaseService(dbPath)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	a.db = db
}

// shutdown is called when the app is shutting down
func (a *App) shutdown(ctx context.Context) {
	if a.db != nil {
		a.db.Close()
	}
}
