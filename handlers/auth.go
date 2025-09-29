package handlers

import "mooncaketv/services"

type AuthHandler struct {
	authService *services.AuthService
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

// Login authenticates a user
func (h *AuthHandler) Login(username, password string) (*services.AuthResponse, error) {
	req := services.LoginRequest{
		Username: username,
		Password: password,
	}
	return h.authService.Login(req)
}

// Signup creates a new user account
func (h *AuthHandler) Signup(username, email, password string) (*services.AuthResponse, error) {
	req := services.SignupRequest{
		Username: username,
		Email:    email,
		Password: password,
	}
	return h.authService.Signup(req)
}

// Future auth methods can be added here:
// - Logout
// - GetCurrentUser
// - UpdatePassword
// - ResetPassword
// - ValidateSession