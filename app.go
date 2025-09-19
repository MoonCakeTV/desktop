package main

import (
	"context"
	"log"
	"path/filepath"

	"mooncaketv/services"
)

// App struct
type App struct {
	ctx context.Context
	db  *services.DatabaseService
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
	dbPath := filepath.Join(".", "data", "mooncaketv.db")
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
