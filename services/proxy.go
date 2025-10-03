package services

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"
	"time"
)

// ProxyService handles HTTP proxy operations
type ProxyService struct{}

// NewProxyService creates a new ProxyService instance
func NewProxyService() *ProxyService {
	return &ProxyService{}
}

// SpeedTestResult represents the result of a speed test
type SpeedTestResult struct {
	SpeedMBps float64 `json:"speedMBps"`
	Error     string  `json:"error,omitempty"`
}

// ProxyImageResponse represents the response from ProxyImage
type ProxyImageResponse struct {
	Data        []byte `json:"data"`
	ContentType string `json:"contentType"`
}

// resolveURL resolves a potentially relative URL against a base URL
func resolveURL(baseURL, maybeRelative string) string {
	if strings.HasPrefix(maybeRelative, "http://") || strings.HasPrefix(maybeRelative, "https://") {
		return maybeRelative
	}

	// Simple URL resolution
	if strings.HasPrefix(maybeRelative, "/") {
		// Extract scheme and host from base
		parts := strings.SplitN(baseURL, "://", 2)
		if len(parts) != 2 {
			return maybeRelative
		}
		scheme := parts[0]
		hostPath := strings.Split(parts[1], "/")
		return scheme + "://" + hostPath[0] + maybeRelative
	}

	// Relative path
	lastSlash := strings.LastIndex(baseURL, "/")
	if lastSlash == -1 {
		return baseURL + "/" + maybeRelative
	}
	return baseURL[:lastSlash+1] + maybeRelative
}

// pickFirstSegmentURL extracts the first segment URL from a media playlist
func pickFirstSegmentURL(manifest, manifestURL string) string {
	lines := strings.Split(manifest, "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		return resolveURL(manifestURL, line)
	}
	return ""
}

// pickFirstVariantURL extracts the first variant playlist URL from a master playlist
func pickFirstVariantURL(masterManifest, masterURL string) string {
	lines := strings.Split(masterManifest, "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		return resolveURL(masterURL, line)
	}
	return ""
}

// TestMediaSpeed tests the download speed of an m3u8 media stream
func (p *ProxyService) TestMediaSpeed(m3u8URL string) *SpeedTestResult {
	const bytesToFetch = 512 * 1024 // 512KB
	const timeoutMS = 6000

	ctx, cancel := context.WithTimeout(context.Background(), timeoutMS*time.Millisecond)
	defer cancel()

	client := &http.Client{
		Timeout: timeoutMS * time.Millisecond,
	}

	// Fetch the manifest
	req, err := http.NewRequestWithContext(ctx, "GET", m3u8URL, nil)
	if err != nil {
		return &SpeedTestResult{Error: "Failed to create request"}
	}

	resp, err := client.Do(req)
	if err != nil {
		return &SpeedTestResult{Error: "Failed to fetch manifest"}
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return &SpeedTestResult{Error: fmt.Sprintf("Manifest fetch failed: %d", resp.StatusCode)}
	}

	manifestBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return &SpeedTestResult{Error: "Failed to read manifest"}
	}
	masterManifest := string(manifestBytes)

	mediaPlaylistURL := m3u8URL
	var segmentURL string

	// Check if it's a master playlist
	masterPlaylistRegex := regexp.MustCompile(`(?i)EXT-X-STREAM-INF`)
	if masterPlaylistRegex.MatchString(masterManifest) {
		// It's a master playlist, get first variant
		variantURL := pickFirstVariantURL(masterManifest, m3u8URL)
		if variantURL == "" {
			return &SpeedTestResult{Error: "Variant playlist not found"}
		}
		mediaPlaylistURL = variantURL

		// Fetch variant playlist
		variantReq, err := http.NewRequestWithContext(ctx, "GET", mediaPlaylistURL, nil)
		if err != nil {
			return &SpeedTestResult{Error: "Failed to create variant request"}
		}

		variantResp, err := client.Do(variantReq)
		if err != nil {
			return &SpeedTestResult{Error: "Failed to fetch variant"}
		}
		defer variantResp.Body.Close()

		if variantResp.StatusCode != http.StatusOK {
			return &SpeedTestResult{Error: fmt.Sprintf("Variant fetch failed: %d", variantResp.StatusCode)}
		}

		variantBytes, err := io.ReadAll(variantResp.Body)
		if err != nil {
			return &SpeedTestResult{Error: "Failed to read variant"}
		}

		segmentURL = pickFirstSegmentURL(string(variantBytes), mediaPlaylistURL)
	} else {
		// It's a media playlist
		segmentURL = pickFirstSegmentURL(masterManifest, mediaPlaylistURL)
	}

	if segmentURL == "" {
		return &SpeedTestResult{Error: "Segment not found"}
	}

	// Test speed by downloading part of the segment
	start := time.Now()
	segmentReq, err := http.NewRequestWithContext(ctx, "GET", segmentURL, nil)
	if err != nil {
		return &SpeedTestResult{Error: "Failed to create segment request"}
	}
	segmentReq.Header.Set("Range", fmt.Sprintf("bytes=0-%d", bytesToFetch-1))

	segmentResp, err := client.Do(segmentReq)
	if err != nil {
		return &SpeedTestResult{Error: "Failed to fetch segment"}
	}
	defer segmentResp.Body.Close()

	if segmentResp.StatusCode != http.StatusOK && segmentResp.StatusCode != http.StatusPartialContent {
		return &SpeedTestResult{Error: fmt.Sprintf("Segment fetch failed: %d", segmentResp.StatusCode)}
	}

	segmentData, err := io.ReadAll(segmentResp.Body)
	if err != nil {
		return &SpeedTestResult{Error: "Failed to read segment"}
	}

	durationMS := time.Since(start).Milliseconds()
	bytesRead := len(segmentData)

	if durationMS == 0 || bytesRead == 0 {
		return &SpeedTestResult{Error: "Invalid test result"}
	}

	bytesPerSec := float64(bytesRead) / (float64(durationMS) / 1000.0)
	mbPerSec := bytesPerSec / (1024 * 1024)

	return &SpeedTestResult{SpeedMBps: mbPerSec}
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