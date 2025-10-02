package services

import (
	"crypto/rand"
	"crypto/subtle"
	"database/sql"
	"encoding/base64"
	"fmt"
	"time"

	"golang.org/x/crypto/argon2"
)

type AuthService struct {
	db *DatabaseService
}

type User struct {
	ID        int     `json:"id"`
	Username  string  `json:"username"`
	Email     string  `json:"email"`
	UserRole  string  `json:"user_role"`
	MetaData  *string `json:"meta_data,omitempty"`
	CreatedAt string  `json:"created_at"`
	UpdatedAt string  `json:"updated_at"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type SignupRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}


func NewAuthService(db *DatabaseService) *AuthService {
	return &AuthService{db: db}
}

// hashPassword generates a secure hash of the password using Argon2
func (as *AuthService) hashPassword(password string) (string, error) {
	// Generate a random salt
	salt := make([]byte, 16)
	if _, err := rand.Read(salt); err != nil {
		return "", fmt.Errorf("failed to generate salt: %w", err)
	}

	// Hash the password using Argon2id
	// Parameters: time=1, memory=64MB, threads=4, keyLen=32
	hash := argon2.IDKey([]byte(password), salt, 1, 64*1024, 4, 32)

	// Encode salt and hash to base64
	saltB64 := base64.RawStdEncoding.EncodeToString(salt)
	hashB64 := base64.RawStdEncoding.EncodeToString(hash)

	// Format: $argon2id$v=19$m=65536,t=1,p=4$salt$hash
	encoded := fmt.Sprintf("$argon2id$v=19$m=65536,t=1,p=4$%s$%s", saltB64, hashB64)

	return encoded, nil
}

// verifyPassword checks if the provided password matches the hash
func (as *AuthService) verifyPassword(password, encodedHash string) (bool, error) {
	// Parse the encoded hash
	var salt, hash string
	_, err := fmt.Sscanf(encodedHash, "$argon2id$v=19$m=65536,t=1,p=4$%s$%s", &salt, &hash)
	if err != nil {
		return false, fmt.Errorf("failed to parse hash: %w", err)
	}

	// Decode salt and hash from base64
	saltBytes, err := base64.RawStdEncoding.DecodeString(salt)
	if err != nil {
		return false, fmt.Errorf("failed to decode salt: %w", err)
	}

	expectedHash, err := base64.RawStdEncoding.DecodeString(hash)
	if err != nil {
		return false, fmt.Errorf("failed to decode hash: %w", err)
	}

	// Hash the provided password with the same salt
	actualHash := argon2.IDKey([]byte(password), saltBytes, 1, 64*1024, 4, 32)

	// Use constant time comparison to prevent timing attacks
	return subtle.ConstantTimeCompare(actualHash, expectedHash) == 1, nil
}

// Signup creates a new user account
func (as *AuthService) Signup(req SignupRequest) (*User, error) {
	// Validate input
	if req.Username == "" || req.Email == "" || req.Password == "" {
		return nil, fmt.Errorf("username, email and password are required")
	}

	if len(req.Password) < 6 {
		return nil, fmt.Errorf("password must be at least 6 characters long")
	}

	// Check if username already exists
	var exists bool
	err := as.db.GetDB().QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE username = ? OR email = ?)", req.Username, req.Username).Scan(&exists)
	if err != nil {
		return nil, fmt.Errorf("failed to check username existence: %w", err)
	}
	if exists {
		return nil, fmt.Errorf("username already exists")
	}

	// Check if email already exists
	err = as.db.GetDB().QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE email = ?)", req.Email).Scan(&exists)
	if err != nil {
		return nil, fmt.Errorf("failed to check email existence: %w", err)
	}
	if exists {
		return nil, fmt.Errorf("email already registered")
	}

	// Hash the password
	hashedPassword, err := as.hashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Check if this is the first user (for admin role assignment)
	var userCount int
	err = as.db.GetDB().QueryRow("SELECT COUNT(*) FROM users").Scan(&userCount)
	if err != nil {
		return nil, fmt.Errorf("failed to count users: %w", err)
	}

	// Assign role based on whether this is the first user
	userRole := "member"
	if userCount == 0 {
		userRole = "admin"
	}

	// Insert the new user
	result, err := as.db.GetDB().Exec(`
		INSERT INTO users (username, email, password_hash, user_role, created_at, updated_at)
		VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
	`, req.Username, req.Email, hashedPassword, userRole)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	userID, err := result.LastInsertId()
	if err != nil {
		return nil, fmt.Errorf("failed to get user ID: %w", err)
	}

	// Create the user object
	user := &User{
		ID:        int(userID),
		Username:  req.Username,
		Email:     req.Email,
		UserRole:  userRole,
		MetaData:  nil,
		CreatedAt: time.Now().Format(time.RFC3339),
		UpdatedAt: time.Now().Format(time.RFC3339),
	}

	return user, nil
}

// Login authenticates a user
func (as *AuthService) Login(req LoginRequest) (*User, error) {
	// Validate input
	if req.Username == "" || req.Password == "" {
		return nil, fmt.Errorf("username and password are required")
	}

	// Get user from database (allow login with username or email)
	var user User
	var passwordHash string
	err := as.db.GetDB().QueryRow(`
		SELECT id, username, email, password_hash, user_role, meta_data, created_at, updated_at
		FROM users
		WHERE username = ? OR email = ?
	`, req.Username, req.Username).Scan(&user.ID, &user.Username, &user.Email, &passwordHash, &user.UserRole, &user.MetaData, &user.CreatedAt, &user.UpdatedAt)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("invalid username or password")
	} else if err != nil {
		return nil, fmt.Errorf("failed to query user: %w", err)
	}

	// Verify password
	valid, err := as.verifyPassword(req.Password, passwordHash)
	if err != nil {
		return nil, fmt.Errorf("failed to verify password: %w", err)
	}

	if !valid {
		return nil, fmt.Errorf("invalid username or password")
	}

	return &user, nil
}