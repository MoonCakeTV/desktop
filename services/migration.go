package services

import (
	"database/sql"
	"embed"
	"fmt"
	"io/fs"
	"sort"
	"strings"
)

type Migration struct {
	FileName string
	Content  string
}

type MigrationService struct {
	db *sql.DB
}

func NewMigrationService(db *sql.DB) *MigrationService {
	return &MigrationService{db: db}
}

func (ms *MigrationService) RunMigrations(migrationsFS embed.FS) error {
	// Create migrations table if it doesn't exist
	if err := ms.createMigrationsTable(); err != nil {
		return fmt.Errorf("failed to create migrations table: %w", err)
	}

	// Read all migration files
	migrations, err := ms.readMigrationFiles(migrationsFS)
	if err != nil {
		return fmt.Errorf("failed to read migration files: %w", err)
	}

	// Execute migrations
	for _, migration := range migrations {
		if err := ms.executeMigration(migration); err != nil {
			return fmt.Errorf("failed to execute migration %s: %w", migration.FileName, err)
		}
	}

	return nil
}

func (ms *MigrationService) createMigrationsTable() error {
	query := `
	CREATE TABLE IF NOT EXISTS migrations (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		file_name TEXT NOT NULL UNIQUE,
		executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		success BOOLEAN NOT NULL DEFAULT 1
	);
	`
	_, err := ms.db.Exec(query)
	return err
}

func (ms *MigrationService) readMigrationFiles(migrationsFS embed.FS) ([]Migration, error) {
	files, err := fs.ReadDir(migrationsFS, "migrations")
	if err != nil {
		return nil, fmt.Errorf("failed to read migrations directory: %w", err)
	}

	var migrations []Migration
	for _, file := range files {
		if file.IsDir() || !strings.HasSuffix(file.Name(), ".sql") {
			continue
		}

		content, err := migrationsFS.ReadFile("migrations/" + file.Name())
		if err != nil {
			return nil, fmt.Errorf("failed to read migration file %s: %w", file.Name(), err)
		}

		migrations = append(migrations, Migration{
			FileName: file.Name(),
			Content:  string(content),
		})
	}

	// Sort migrations by filename to ensure they run in order
	sort.Slice(migrations, func(i, j int) bool {
		return migrations[i].FileName < migrations[j].FileName
	})

	return migrations, nil
}

func (ms *MigrationService) executeMigration(migration Migration) error {
	// Check if migration has already been executed
	var exists bool
	err := ms.db.QueryRow("SELECT EXISTS(SELECT 1 FROM migrations WHERE file_name = ?)", migration.FileName).Scan(&exists)
	if err != nil {
		return fmt.Errorf("failed to check migration status: %w", err)
	}

	if exists {
		// Migration already executed, skip
		return nil
	}

	// Begin transaction
	tx, err := ms.db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Execute migration SQL
	_, err = tx.Exec(migration.Content)
	if err != nil {
		// Record failed migration
		ms.recordMigration(migration.FileName, false)
		return fmt.Errorf("failed to execute migration SQL: %w", err)
	}

	// Record successful migration
	_, err = tx.Exec(
		"INSERT INTO migrations (file_name, success) VALUES (?, ?)",
		migration.FileName, true,
	)
	if err != nil {
		return fmt.Errorf("failed to record migration: %w", err)
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	fmt.Printf("Successfully executed migration: %s\n", migration.FileName)
	return nil
}

func (ms *MigrationService) recordMigration(fileName string, success bool) {
	// Try to record the migration even if it failed
	// This is done outside of the main transaction
	_, _ = ms.db.Exec(
		"INSERT OR REPLACE INTO migrations (file_name, success) VALUES (?, ?)",
		fileName, success,
	)
}