package utils

import (
	"fmt"
	"os"
	"path/filepath"
	"runtime"
)

// GetAppDataPath returns the appropriate directory for storing app data based on the OS
func GetAppDataPath(filename string) (string, error) {
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
		appDataDir = filepath.Join(xdgDataHome, "MooncakeTV")
	default:
		return "", fmt.Errorf("unsupported operating system: %s", runtime.GOOS)
	}

	// Create the directory if it doesn't exist
	if err := os.MkdirAll(appDataDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create app data directory: %w", err)
	}

	return filepath.Join(appDataDir, filename), nil
}