"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createId } from "@/lib/create-id";
import { useRoom } from "@/lib/room-context";
import { useAppStore } from "@/lib/store";
import {
  getMicrophoneBlockedReason,
  getMicrophoneErrorMessage,
  isMicrophoneSupported,
  requestMicrophoneStream,
} from "@/lib/media-permissions";
import type { VoiceSignal } from "@/lib/types";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
];

export function useVoiceChat() {
  const { voiceSignals } = useRoom();
  const localClientId = useAppStore((state) => state.localClientId);
  const voiceActive = useAppStore((state) => state.voiceActive);
  const setVoiceActive = useAppStore((state) => state.setVoiceActive);
  const onlineUsers = useAppStore((state) => state.onlineUsers);

  const peersRef = useRef<Map<number, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const processedSignalsRef = useRef<Set<string>>(new Set());
  const [remoteStreams, setRemoteStreams] = useState<Map<number, MediaStream>>(
    new Map(),
  );
  const [error, setError] = useState<string | null>(null);
  const [micMuted, setMicMuted] = useState(false);
  const [joining, setJoining] = useState(false);

  const getVoicePeers = () =>
    onlineUsers.filter(
      (u) => u.voiceActive && u.clientId !== localClientId,
    );

  const publishSignal = (
    to: number,
    type: VoiceSignal["type"],
    payload: VoiceSignal["payload"],
  ) => {
    if (localClientId === null) return;

    const signal: VoiceSignal = {
      id: createId(),
      from: localClientId,
      to,
      type,
      payload,
    };

    voiceSignals.push([signal]);
  };

  const createPeerConnection = async (remoteId: number, initiator: boolean) => {
    if (peersRef.current.has(remoteId)) return;

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    localStreamRef.current?.getTracks().forEach((track) => {
      pc.addTrack(track, localStreamRef.current!);
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        publishSignal(remoteId, "ice", event.candidate.toJSON());
      }
    };

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      if (stream) {
        setRemoteStreams((prev) => new Map(prev).set(remoteId, stream));
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        pc.close();
        peersRef.current.delete(remoteId);
        setRemoteStreams((prev) => {
          const next = new Map(prev);
          next.delete(remoteId);
          return next;
        });
      }
    };

    peersRef.current.set(remoteId, pc);

    if (initiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      publishSignal(remoteId, "offer", offer);
    }
  };

  const handleSignal = async (signal: VoiceSignal) => {
    if (localClientId === null || signal.to !== localClientId) return;
    if (processedSignalsRef.current.has(signal.id)) return;
    processedSignalsRef.current.add(signal.id);

    if (!peersRef.current.has(signal.from)) {
      await createPeerConnection(signal.from, false);
    }

    const pc = peersRef.current.get(signal.from);
    if (!pc) return;

    try {
      if (signal.type === "offer") {
        await pc.setRemoteDescription(
          signal.payload as RTCSessionDescriptionInit,
        );
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        publishSignal(signal.from, "answer", answer);
      } else if (signal.type === "answer") {
        await pc.setRemoteDescription(
          signal.payload as RTCSessionDescriptionInit,
        );
      } else if (signal.type === "ice") {
        await pc.addIceCandidate(signal.payload as RTCIceCandidateInit);
      }
    } catch (err) {
      console.error("Voice signal handling failed:", err);
    }
  };

  const stopLocalStream = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
  }, []);

  const leaveVoice = useCallback(() => {
    peersRef.current.forEach((pc) => pc.close());
    peersRef.current.clear();
    stopLocalStream();
    setRemoteStreams(new Map());
    processedSignalsRef.current.clear();
    setMicMuted(false);
    setVoiceActive(false);
  }, [setVoiceActive, stopLocalStream]);

  const joinVoice = async () => {
    const blocked = getMicrophoneBlockedReason();
    if (blocked) {
      setError(blocked);
      return;
    }

    setJoining(true);
    setError(null);

    try {
      const stream = await requestMicrophoneStream();
      localStreamRef.current = stream;
      setMicMuted(false);
      setVoiceActive(true);

      for (const peer of getVoicePeers()) {
        if (localClientId !== null && peer.clientId > localClientId) {
          await createPeerConnection(peer.clientId, true);
        }
      }
    } catch (err) {
      stopLocalStream();
      setVoiceActive(false);
      setError(getMicrophoneErrorMessage(err));
    } finally {
      setJoining(false);
    }
  };

  const toggleMicMute = useCallback(() => {
    const tracks = localStreamRef.current?.getAudioTracks() ?? [];
    const nextMuted = !micMuted;
    tracks.forEach((track) => {
      track.enabled = !nextMuted;
    });
    setMicMuted(nextMuted);
  }, [micMuted]);

  useEffect(() => {
    const handleSignals = () => {
      const signals = voiceSignals.toArray() as VoiceSignal[];
      signals.slice(-50).forEach((signal) => {
        void handleSignal(signal);
      });
    };

    voiceSignals.observe(handleSignals);
    return () => voiceSignals.unobserve(handleSignals);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceSignals, localClientId]);

  useEffect(() => {
    if (!voiceActive || localClientId === null) return;

    for (const peer of getVoicePeers()) {
      if (!peersRef.current.has(peer.clientId)) {
        const initiator = localClientId > peer.clientId;
        void createPeerConnection(peer.clientId, initiator);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceActive, onlineUsers, localClientId]);

  useEffect(() => {
    return () => {
      peersRef.current.forEach((pc) => pc.close());
      peersRef.current.clear();
      stopLocalStream();
    };
  }, [stopLocalStream]);

  return {
    voiceActive,
    joining,
    joinVoice,
    leaveVoice,
    remoteStreams,
    error,
    micMuted,
    toggleMicMute,
    micSupported: isMicrophoneSupported(),
    voicePeerCount: getVoicePeers().length,
  };
}
