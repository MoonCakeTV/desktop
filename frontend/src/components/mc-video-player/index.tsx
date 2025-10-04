import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Maximize, ExternalLink } from "lucide-react";
import { Button } from "../ui/button";
import { WindowFullscreen, BrowserOpenURL } from "../../../wailsjs/runtime/runtime";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

export function VideoPlayer({ src, poster, className = "" }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setError("");

    // Check if HLS is supported
    if (Hls.isSupported()) {
      // Initialize HLS.js
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
        },
      });

      hlsRef.current = hls;

      // Bind video element
      hls.attachMedia(video);

      // Load source
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log("Loading HLS source:", src);
        hls.loadSource(src);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("HLS manifest loaded successfully");
          video.play().catch((e) => console.log("Autoplay prevented:", e));
        });
      });

      // Handle errors
      hls.on(Hls.Events.ERROR, (_event, data) => {
        console.error("HLS error:", {
          type: data.type,
          details: data.details,
          fatal: data.fatal,
          url: data.url,
          response: data.response,
        });
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log("Network error, attempting to recover...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("Media error, attempting to recover...");
              hls.recoverMediaError();
              break;
            default:
              console.error("Fatal error, cannot recover");
              setError("Failed to load video");
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (Safari)
      console.log("Using native HLS support");
      video.src = src;
    } else {
      console.error("HLS is not supported in this browser");
      setError("HLS is not supported in this browser");
    }

    // Cleanup
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  const toggleFullscreen = () => {
    WindowFullscreen();
  };

  const openInBrowser = () => {
    BrowserOpenURL(src);
  };

  return (
    <div className={`relative w-full ${className}`}>
      {error ? (
        <div className="w-full h-full rounded-lg bg-black flex flex-col items-center justify-center text-red-500 gap-4">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={openInBrowser}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Open in Browser
          </Button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            controls
            poster={poster}
            className="w-full aspect-video rounded-lg bg-black"
            playsInline
            style={{ minHeight: "400px" }}
          >
            Your browser does not support the video tag.
          </video>

          <div className="absolute top-4 right-4 z-50 flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="opacity-70 hover:opacity-100 transition-opacity pointer-events-auto"
              onClick={openInBrowser}
              title="Open in browser"
            >
              <ExternalLink className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="opacity-70 hover:opacity-100 transition-opacity pointer-events-auto"
              onClick={toggleFullscreen}
              title="Fullscreen"
            >
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
