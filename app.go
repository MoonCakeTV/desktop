package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
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

// ProxyImageResponse represents the response from ProxyImage
type ProxyImageResponse struct {
	Data        []byte `json:"data"`
	ContentType string `json:"contentType"`
}

// ProxyImage fetches an image from a URL and returns the image data with content type
func (a *App) ProxyImage(imageURL string) (*ProxyImageResponse, error) {
	log.Printf("ProxyImage called with URL: %s", imageURL)

	client := &http.Client{}
	req, err := http.NewRequest("GET", imageURL, nil)
	if err != nil {
		log.Printf("Failed to create request: %v", err)
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set User-Agent to mimic a browser
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
	req.Header.Set("Referer", "https://www.douban.com/")

	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Failed to fetch image: %v", err)
		return nil, fmt.Errorf("failed to fetch image: %w", err)
	}
	defer resp.Body.Close()

	log.Printf("Response status: %d", resp.StatusCode)
	contentType := resp.Header.Get("Content-Type")
	log.Printf("Content-Type: %s", contentType)

	if resp.StatusCode != http.StatusOK {
		log.Printf("Bad status code: %d", resp.StatusCode)
		return nil, fmt.Errorf("failed to fetch image: status %d", resp.StatusCode)
	}

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Failed to read image data: %v", err)
		return nil, fmt.Errorf("failed to read image data: %w", err)
	}

	log.Printf("Successfully fetched image data: %d bytes", len(data))
	return &ProxyImageResponse{
		Data:        data,
		ContentType: contentType,
	}, nil
}
