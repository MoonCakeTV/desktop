package services

import (
	"database/sql"
	"embed"
	"fmt"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)

type DatabaseService struct {
	db *sql.DB
}

func NewDatabaseService(dbPath string, migrationsFS embed.FS) (*DatabaseService, error) {
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
	if err := migrationService.RunMigrations(migrationsFS); err != nil {
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

// GetUserByID returns a specific user by their ID
func (ds *DatabaseService) GetUserByID(userID int) (map[string]interface{}, error) {
	query := `SELECT id, username, email, user_role, meta_data, created_at, updated_at
			  FROM users
			  WHERE id = ?`

	user := make(map[string]interface{})
	var id int
	var username, email, userRole, createdAt, updatedAt string
	var metaData sql.NullString

	err := ds.db.QueryRow(query, userID).Scan(&id, &username, &email, &userRole, &metaData, &createdAt, &updatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, err
	}

	user["id"] = id
	user["username"] = username
	user["email"] = email
	user["user_role"] = userRole
	if metaData.Valid {
		user["meta_data"] = metaData.String
	} else {
		user["meta_data"] = nil
	}
	user["created_at"] = createdAt
	user["updated_at"] = updatedAt

	return user, nil
}

// GetUserSettings returns all settings for a specific user (including global settings)
func (ds *DatabaseService) GetUserSettings(userID int) ([]map[string]interface{}, error) {
	// Get both user-specific settings and global settings (where user_id is NULL)
	query := `SELECT id, user_id, setting_key, setting_value, created_at, updated_at
			  FROM settings
			  WHERE user_id = ? OR user_id IS NULL
			  ORDER BY user_id IS NULL DESC, setting_key`

	rows, err := ds.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var settings []map[string]interface{}
	for rows.Next() {
		setting := make(map[string]interface{})
		var id int
		var userIDVal sql.NullInt64
		var key, value, createdAt, updatedAt string

		if err := rows.Scan(&id, &userIDVal, &key, &value, &createdAt, &updatedAt); err != nil {
			return nil, err
		}

		setting["id"] = id
		setting["key"] = key
		setting["value"] = value
		setting["created_at"] = createdAt
		setting["updated_at"] = updatedAt

		// Mark whether this is a global or personal setting
		if userIDVal.Valid {
			setting["type"] = "personal"
			setting["user_id"] = userIDVal.Int64
		} else {
			setting["type"] = "global"
			setting["user_id"] = nil
		}

		settings = append(settings, setting)
	}

	return settings, nil
}

// UpdateSetting updates a setting value
func (ds *DatabaseService) UpdateSetting(settingID int, newValue string, userID int, isAdmin bool) error {
	// First, check if the setting exists and get its owner
	var settingUserID sql.NullInt64
	err := ds.db.QueryRow("SELECT user_id FROM settings WHERE id = ?", settingID).Scan(&settingUserID)
	if err != nil {
		if err == sql.ErrNoRows {
			return fmt.Errorf("setting not found")
		}
		return err
	}

	// Check permissions
	if settingUserID.Valid {
		// Personal setting - can only be edited by the owner
		if int(settingUserID.Int64) != userID {
			return fmt.Errorf("permission denied: cannot edit other user's settings")
		}
	} else {
		// Global setting - can only be edited by admin
		if !isAdmin {
			return fmt.Errorf("permission denied: only admin can edit global settings")
		}
	}

	// Update the setting
	_, err = ds.db.Exec(`
		UPDATE settings
		SET setting_value = ?, updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
	`, newValue, settingID)

	return err
}

// DeleteSetting deletes a setting
func (ds *DatabaseService) DeleteSetting(settingID int, userID int, isAdmin bool) error {
	// First, check if the setting exists and get its owner
	var settingUserID sql.NullInt64
	err := ds.db.QueryRow("SELECT user_id FROM settings WHERE id = ?", settingID).Scan(&settingUserID)
	if err != nil {
		if err == sql.ErrNoRows {
			return fmt.Errorf("setting not found")
		}
		return err
	}

	// Check permissions
	if settingUserID.Valid {
		// Personal setting - can only be deleted by the owner
		if int(settingUserID.Int64) != userID {
			return fmt.Errorf("permission denied: cannot delete other user's settings")
		}
	} else {
		// Global setting - can only be deleted by admin
		if !isAdmin {
			return fmt.Errorf("permission denied: only admin can delete global settings")
		}
	}

	// Delete the setting
	_, err = ds.db.Exec("DELETE FROM settings WHERE id = ?", settingID)

	return err
}

// AddBookmark adds a bookmark for a user
func (ds *DatabaseService) AddBookmark(userID int, mcID string) error {
	_, err := ds.db.Exec(`
		INSERT INTO bookmarks (user_id, mc_id)
		VALUES (?, ?)
		ON CONFLICT(user_id, mc_id) DO NOTHING
	`, userID, mcID)
	return err
}

// RemoveBookmark removes a bookmark for a user
func (ds *DatabaseService) RemoveBookmark(userID int, mcID string) error {
	_, err := ds.db.Exec(`
		DELETE FROM bookmarks
		WHERE user_id = ? AND mc_id = ?
	`, userID, mcID)
	return err
}

// IsBookmarked checks if a user has bookmarked a specific media
func (ds *DatabaseService) IsBookmarked(userID int, mcID string) (bool, error) {
	var count int
	err := ds.db.QueryRow(`
		SELECT COUNT(*) FROM bookmarks
		WHERE user_id = ? AND mc_id = ?
	`, userID, mcID).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// GetUserBookmarks returns all bookmarked mc_ids for a user
func (ds *DatabaseService) GetUserBookmarks(userID int) ([]string, error) {
	rows, err := ds.db.Query(`
		SELECT mc_id FROM bookmarks
		WHERE user_id = ?
		ORDER BY created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var bookmarks []string
	for rows.Next() {
		var mcID string
		if err := rows.Scan(&mcID); err != nil {
			return nil, err
		}
		bookmarks = append(bookmarks, mcID)
	}
	return bookmarks, nil
}

// GetBookmarkedMediaDetails returns full media details for user's bookmarks
func (ds *DatabaseService) GetBookmarkedMediaDetails(userID int) ([]map[string]interface{}, error) {
	rows, err := ds.db.Query(`
		SELECT
			b.mc_id,
			b.created_at as bookmarked_at,
			m.title,
			m.description,
			m.year,
			m.genre,
			m.poster_url,
			m.video_urls,
			COALESCE(m.douban_rating, m.imdb_rating, m.tmdb_rating, 0) as rating
		FROM bookmarks b
		LEFT JOIN medias m ON b.mc_id = m.mc_id
		WHERE b.user_id = ?
		ORDER BY b.created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var bookmarks []map[string]interface{}
	for rows.Next() {
		bookmark := make(map[string]interface{})
		var mcID, bookmarkedAt string
		var title, description, posterURL, videoURLs sql.NullString
		var year sql.NullInt64
		var genre sql.NullString
		var rating sql.NullFloat64

		if err := rows.Scan(&mcID, &bookmarkedAt, &title, &description, &year, &genre, &posterURL, &videoURLs, &rating); err != nil {
			return nil, err
		}

		bookmark["mc_id"] = mcID
		bookmark["bookmarked_at"] = bookmarkedAt
		if title.Valid {
			bookmark["title"] = title.String
		}
		if description.Valid {
			bookmark["description"] = description.String
		}
		if year.Valid {
			bookmark["year"] = year.Int64
		}
		if genre.Valid {
			bookmark["category"] = genre.String
		}
		if posterURL.Valid {
			bookmark["poster"] = posterURL.String
		}
		if videoURLs.Valid {
			bookmark["m3u8_urls"] = videoURLs.String
		}
		if rating.Valid {
			bookmark["rating"] = rating.Float64
		}

		bookmarks = append(bookmarks, bookmark)
	}
	return bookmarks, nil
}

// SaveOrUpdateMedia saves or updates media information
func (ds *DatabaseService) SaveOrUpdateMedia(mcID, title, description string, year int, genre, posterURL, videoURLs string, rating float64) error {
	_, err := ds.db.Exec(`
		INSERT INTO medias (mc_id, title, description, year, genre, poster_url, video_urls, douban_rating, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		ON CONFLICT(mc_id) DO UPDATE SET
			title = excluded.title,
			description = excluded.description,
			year = excluded.year,
			genre = excluded.genre,
			poster_url = excluded.poster_url,
			video_urls = excluded.video_urls,
			douban_rating = excluded.douban_rating,
			updated_at = CURRENT_TIMESTAMP
	`, mcID, title, description, year, genre, posterURL, videoURLs, rating)
	return err
}