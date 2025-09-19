package services

import (
	"database/sql"
	"fmt"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)

type DatabaseService struct {
	db *sql.DB
}

func NewDatabaseService(dbPath string) (*DatabaseService, error) {
	// Ensure the database file has .db extension
	if filepath.Ext(dbPath) == "" {
		dbPath += ".db"
	}

	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Test the connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	service := &DatabaseService{db: db}
	
	// Initialize tables
	if err := service.initTables(); err != nil {
		return nil, fmt.Errorf("failed to initialize tables: %w", err)
	}

	return service, nil
}

func (ds *DatabaseService) initTables() error {
	// Create migrations table to track database migrations
	migrationsQuery := `
	CREATE TABLE IF NOT EXISTS migrations (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		file_name TEXT NOT NULL UNIQUE,
		executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		success BOOLEAN NOT NULL DEFAULT 0
	);
	`
	
	if _, err := ds.db.Exec(migrationsQuery); err != nil {
		return fmt.Errorf("failed to create migrations table: %w", err)
	}


	

	return nil
}

func (ds *DatabaseService) Close() error {
	if ds.db != nil {
		return ds.db.Close()
	}
	return nil
}

func (ds *DatabaseService) GetDB() *sql.DB {
	return ds.db
}