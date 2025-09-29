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

func NewDatabaseService(dbPath, migrationsPath string) (*DatabaseService, error) {
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

	// Run migrations
	migrationService := NewMigrationService(db)
	if err := migrationService.RunMigrations(migrationsPath); err != nil {
		return nil, fmt.Errorf("failed to run migrations: %w", err)
	}

	return service, nil
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

// GetAllTables returns a list of all tables in the database
func (ds *DatabaseService) GetAllTables() ([]string, error) {
	query := `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;`
	rows, err := ds.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tables []string
	for rows.Next() {
		var table string
		if err := rows.Scan(&table); err != nil {
			return nil, err
		}
		tables = append(tables, table)
	}
	return tables, nil
}

// GetMigrations returns all migration records
func (ds *DatabaseService) GetMigrations() ([]map[string]interface{}, error) {
	query := `SELECT id, file_name as filename, executed_at as applied_at, success
			  FROM migrations
			  ORDER BY executed_at DESC;`
	rows, err := ds.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var migrations []map[string]interface{}
	for rows.Next() {
		migration := make(map[string]interface{})
		var id int
		var fileName, executedAt string
		var success bool

		if err := rows.Scan(&id, &fileName, &executedAt, &success); err != nil {
			return nil, err
		}

		migration["id"] = id
		migration["filename"] = fileName
		migration["applied_at"] = executedAt
		migration["success"] = success

		migrations = append(migrations, migration)
	}
	return migrations, nil
}

// GetAllUsers returns all users in the database
func (ds *DatabaseService) GetAllUsers() ([]map[string]interface{}, error) {
	query := `SELECT id, username, email, user_role, created_at, updated_at FROM users ORDER BY created_at DESC;`
	rows, err := ds.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []map[string]interface{}
	for rows.Next() {
		user := make(map[string]interface{})
		var id int
		var username, email, userRole, createdAt, updatedAt string

		if err := rows.Scan(&id, &username, &email, &userRole, &createdAt, &updatedAt); err != nil {
			return nil, err
		}

		user["id"] = id
		user["username"] = username
		user["email"] = email
		user["user_role"] = userRole
		user["created_at"] = createdAt
		user["updated_at"] = updatedAt

		users = append(users, user)
	}
	return users, nil
}

// GetAllSettings returns all settings records
func (ds *DatabaseService) GetAllSettings() ([]map[string]interface{}, error) {
	query := `SELECT s.id, s.user_id, s.setting_key, s.setting_value, s.created_at, s.updated_at, u.username
			  FROM settings s
			  LEFT JOIN users u ON s.user_id = u.id
			  ORDER BY s.user_id NULLS FIRST, s.setting_key;`
	rows, err := ds.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var settings []map[string]interface{}
	for rows.Next() {
		setting := make(map[string]interface{})
		var id int
		var userID sql.NullInt64
		var key, value, createdAt, updatedAt string
		var username sql.NullString

		if err := rows.Scan(&id, &userID, &key, &value, &createdAt, &updatedAt, &username); err != nil {
			return nil, err
		}

		setting["id"] = id
		if userID.Valid {
			setting["user_id"] = userID.Int64
			setting["username"] = username.String
		} else {
			setting["user_id"] = nil
			setting["username"] = "全局设置"
		}
		setting["key"] = key
		setting["value"] = value

		settings = append(settings, setting)
	}
	return settings, nil
}