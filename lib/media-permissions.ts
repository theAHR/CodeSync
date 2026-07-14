export function isMicrophoneSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    window.isSecureContext &&
    typeof navigator.mediaDevices?.getUserMedia === "function"
  );
}

export function getMicrophoneBlockedReason(): string | null {
  if (typeof window === "undefined") return "Voice chat is not available.";
  if (!window.isSecureContext) {
    return "Microphone requires HTTPS or localhost. Open the app via http://localhost:3000 instead of a network IP.";
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    return "Your browser does not support microphone access.";
  }
  return null;
}

export function getMicrophoneErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    switch (error.name) {
      case "NotAllowedError":
      case "PermissionDeniedError":
        return "Microphone blocked. Click the lock icon in your browser address bar and allow microphone access, then try again.";
      case "NotFoundError":
      case "DevicesNotFoundError":
        return "No microphone found. Plug in a mic or check Windows Settings → Privacy → Microphone.";
      case "NotReadableError":
      case "TrackStartError":
        return "Microphone is in use by another app. Close other apps using the mic and try again.";
      case "SecurityError":
        return "Microphone blocked on insecure pages. Use https:// or http://localhost.";
      case "AbortError":
        return "Microphone request was cancelled.";
      default:
        return `Microphone error: ${error.message || error.name}`;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Could not access microphone.";
}

export async function requestMicrophoneStream(): Promise<MediaStream> {
  const blocked = getMicrophoneBlockedReason();
  if (blocked) {
    throw new Error(blocked);
  }

  return navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
    video: false,
  });
}
