package models

// APIResponse is the standard response structure for all API calls
type APIResponse[T any] struct {
	Success bool   `json:"success"`
	Data    T      `json:"data"`
	Error   string `json:"error"`
}

// NewSuccessResponse creates a successful response with data
func NewSuccessResponse[T any](data T) APIResponse[T] {
	return APIResponse[T]{
		Success: true,
		Data:    data,
		Error:   "",
	}
}

// NewErrorResponse creates an error response
func NewErrorResponse[T any](errorMsg string) APIResponse[T] {
	var zero T
	return APIResponse[T]{
		Success: false,
		Data:    zero,
		Error:   errorMsg,
	}
}