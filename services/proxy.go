package services

import (
	"fmt"
	"io"
	"net/http"
)

// ProxyService handles HTTP proxy operations
type ProxyService struct{}

// NewProxyService creates a new ProxyService instance
func NewProxyService() *ProxyService {
	return &ProxyService{}
}

// ProxyImageResponse represents the response from ProxyImage
type ProxyImageResponse struct {
	Data        []byte `json:"data"`
	ContentType string `json:"contentType"`
}

// ProxyImage fetches an image from a URL and returns the image data with content type
func (p *ProxyService) ProxyImage(imageURL string) (*ProxyImageResponse, error) {
	client := &http.Client{}
	req, err := http.NewRequest("GET", imageURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set User-Agent to mimic a browser
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
	req.Header.Set("Referer", "https://www.douban.com/")

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch image: %w", err)
	}
	defer resp.Body.Close()

	contentType := resp.Header.Get("Content-Type")

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch image: status %d", resp.StatusCode)
	}

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read image data: %w", err)
	}

	return &ProxyImageResponse{
		Data:        data,
		ContentType: contentType,
	}, nil
}