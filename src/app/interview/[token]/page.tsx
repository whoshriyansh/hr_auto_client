"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Send,
  Clock,
  Briefcase,
  ArrowLeft,
  Bot,
  User,
  Play,
  PhoneOff,
  Timer,
  MessageSquare,
  Building2,
  FileText,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Keyboard,
  Radio,
} from "lucide-react";
import Link from "next/link";
import { interviewServices } from "@/lib/services/Interview.services";
import { toast } from "sonner";

// Extend window type for cross-browser Speech Recognition
// SpeechRecognition is not in all TS DOM lib builds, so we declare it manually
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}
declare class SpeechRecognitionClass extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognitionClass;
    webkitSpeechRecognition: typeof SpeechRecognitionClass;
  }
}

type ApiError = {
  response?: { status?: number; data?: { message?: string } };
};

interface InterviewDetails {
  interview: {
    id: string;
    token: string;
    candidateName: string;
    jobTitle: string;
    companyName: string;
    status: string;
    state: string;
    hasStarted: boolean;
    isCompleted: boolean;
    isAnalyzed: boolean;
    questionsAsked: number;
    startedAt: string | null;
    completedAt: string | null;
    createdAt: string;
  };
  settings: {
    maxQuestions: number;
    timeLimitMinutes: number;
    difficulty: string;
    behaviour: string;
    followUpEnabled: boolean;
    maxFollowUps: number;
    usingDefaults: boolean;
  };
  progress: {
    elapsedMinutes: number;
    remainingTimeMinutes: number;
  };
  askedQuestions: unknown[];
  messages: ChatMessage[];
}

interface ChatMessage {
  role: "ai" | "candidate";
  content: string;
  type?: string;
  _id?: string;
  timestamp?: string;
  evaluation?: {
    relevance: number;
    depth: number;
    clarity: number;
    overall: number;
  };
  decision?: {
    action: string;
    reasoning: string;
  };
}

interface EndData {
  interviewComplete: boolean;
  questionsAsked: number;
  timeTaken: number;
}

type ScreenState =
  | "loading"
  | "details"
  | "interview"
  | "completed"
  | "error"
  | "already-completed";

// Represents the current turn in the voice conversation
type VoiceState =
  | "idle" // interview not started yet
  | "ai-speaking" // AI TTS audio is playing
  | "listening" // mic is on, STT is running
  | "processing" // waiting for backend LLM + TTS
  | "text-mode"; // fallback: browser doesn't support SpeechRecognition

export default function InterviewPage() {
  const params = useParams();
  const token = params.token as string;

  // ─── Core interview state ─────────────────────────────────────────
  const [screen, setScreen] = useState<ScreenState>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [details, setDetails] = useState<InterviewDetails | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(false);
  const [endData, setEndData] = useState<EndData | null>(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalPlanned, setTotalPlanned] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [currentTranscript, setCurrentTranscript] = useState(""); // real-time STT transcript
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [ttsAvailable, setTtsAvailable] = useState(true); // false if Murf.ai fails
  const [isMuted, setIsMuted] = useState(false); // mute AI audio
  const [showTextInput, setShowTextInput] = useState(false); // toggle text fallback

  // ─── Refs ─────────────────────────────────────────────────────────
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionClass | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const interruptCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentTranscriptRef = useRef(""); // sync ref for use inside async callbacks
  const voiceStateRef = useRef<VoiceState>("idle"); // sync ref so callbacks don't read stale state
  const ttsObjectUrlRef = useRef<string | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const SILENCE_TIMEOUT_MS = 2500; // wait 2.5s of silence before auto-sending

  // Keep refs in sync with state
  useEffect(() => {
    currentTranscriptRef.current = currentTranscript;
  }, [currentTranscript]);
  useEffect(() => {
    voiceStateRef.current = voiceState;
  }, [voiceState]);

  // ─── Auto-scroll chat ────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentTranscript, voiceState]);

  // ─── Timer countdown ─────────────────────────────────────────────
  useEffect(() => {
    if (
      screen === "interview" &&
      startedAt &&
      details?.settings.timeLimitMinutes
    ) {
      const updateTimer = () => {
        const elapsed =
          (Date.now() - new Date(startedAt).getTime()) / 1000 / 60;
        const remaining = Math.max(
          0,
          details.settings.timeLimitMinutes - elapsed,
        );
        setTimeRemaining(Math.ceil(remaining));
        if (remaining <= 0) handleEndInterview();
      };
      updateTimer();
      timerRef.current = setInterval(updateTimer, 30000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, startedAt, details?.settings.timeLimitMinutes]);

  // ─── Cleanup on unmount ───────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopInterruptDetection();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          /* ignore */
        }
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (ttsObjectUrlRef.current) URL.revokeObjectURL(ttsObjectUrlRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      if (micStreamRef.current)
        micStreamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // ─── Fetch interview details ──────────────────────────────────────
  const fetchDetails = useCallback(async () => {
    try {
      setScreen("loading");
      const res = await interviewServices.getDetails(token);
      const data = res.data;
      setDetails(data);

      if (data.interview.isCompleted) {
        setScreen("already-completed");
        return;
      }

      if (
        data.interview.hasStarted &&
        data.interview.status === "in_progress"
      ) {
        setMessages(data.messages || []);
        setTimeRemaining(data.progress.remainingTimeMinutes);
        setStartedAt(data.interview.startedAt);
        setTotalPlanned(data.settings.maxQuestions);
        setQuestionNumber(data.interview.questionsAsked);
        setScreen("interview");
        // Resume: go straight to listening (no TTS for mid-interview resume)
        setVoiceState("text-mode");
        return;
      }

      setScreen("details");
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const status = apiErr.response?.status;
      const msg = apiErr.response?.data?.message || "Failed to load interview";
      if (status === 410) setScreen("already-completed");
      else if (status === 404) {
        setErrorMsg("Interview link is invalid or has expired.");
        setScreen("error");
      } else {
        setErrorMsg(msg);
        setScreen("error");
      }
    }
  }, [token]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // ═══════════════════════════════════════════════════════════════════
  // VOICE ENGINE
  // ═══════════════════════════════════════════════════════════════════

  // Request mic permission and set up AudioContext for interrupt detection
  const initMicAccess = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      micStreamRef.current = stream;

      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser); // analyse mic level WITHOUT routing to speakers

      setHasMicPermission(true);
      return true;
    } catch {
      setHasMicPermission(false);
      return false;
    }
  }, []);

  // Monitor mic RMS; if user speaks while AI is playing → interrupt
  const startInterruptDetection = useCallback(() => {
    if (!analyserRef.current) return;
    const dataArray = new Float32Array(analyserRef.current.fftSize);
    let consecutiveHits = 0;

    interruptCheckRef.current = setInterval(() => {
      if (!analyserRef.current) return;
      analyserRef.current.getFloatTimeDomainData(dataArray);
      const rms = Math.sqrt(
        dataArray.reduce((s, v) => s + v * v, 0) / dataArray.length,
      );

      if (rms > 0.025) {
        consecutiveHits++;
        if (consecutiveHits >= 4) {
          // ~200 ms of continuous speech → interrupt AI
          stopInterruptDetection();
          handleInterrupt();
        }
      } else {
        consecutiveHits = 0;
      }
    }, 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopInterruptDetection = () => {
    if (interruptCheckRef.current) {
      clearInterval(interruptCheckRef.current);
      interruptCheckRef.current = null;
    }
  };

  // Interrupt: stop AI audio, start listening
  const handleInterrupt = useCallback(() => {
    stopInterruptDetection();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    updateVoiceState("listening");
    startListening();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateVoiceState = (s: VoiceState) => {
    voiceStateRef.current = s;
    setVoiceState(s);
  };

  // Play a pre-fetched TTS blob (or fetch + play if only text is given)
  const playTTSBlob = useCallback(
    (blob: Blob) => {
      // Revoke previous object URL to free memory
      if (ttsObjectUrlRef.current) {
        URL.revokeObjectURL(ttsObjectUrlRef.current);
        ttsObjectUrlRef.current = null;
      }

      const url = URL.createObjectURL(blob);
      ttsObjectUrlRef.current = url;

      if (!audioRef.current) audioRef.current = new Audio();
      const audio = audioRef.current;
      audio.src = url;
      audio.muted = isMuted;

      audio.onended = () => {
        stopInterruptDetection();
        updateVoiceState("listening");
        startListening();
      };
      audio.onerror = () => {
        stopInterruptDetection();
        updateVoiceState("listening");
        startListening();
      };

      updateVoiceState("ai-speaking");
      audio
        .play()
        .then(() => {
          if (hasMicPermission) startInterruptDetection();
        })
        .catch(() => {
          updateVoiceState("listening");
          startListening();
        });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isMuted, hasMicPermission, startInterruptDetection],
  );

  // Fetch TTS from backend and play it (used only for the initial greeting)
  const playAIResponse = useCallback(
    async (text: string) => {
      updateVoiceState("ai-speaking");

      if (!ttsAvailable) {
        // TTS previously failed — skip audio, pause before listening
        setTimeout(() => {
          updateVoiceState("listening");
          startListening();
        }, 2500);
        return;
      }

      try {
        const blob = await interviewServices.getTTS(token, text);
        playTTSBlob(blob);
      } catch (err: unknown) {
        setTtsAvailable(false);
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "AI voice temporarily unavailable";
        toast.info(msg);
        updateVoiceState("listening");
        startListening();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [token, ttsAvailable, playTTSBlob],
  );

  // Reset the silence auto-send timer (called each time new speech is detected)
  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      // Silence exceeded threshold — stop recognition and send what we have
      const final = currentTranscriptRef.current.trim();
      if (final && voiceStateRef.current === "listening") {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch {
            /* ignore */
          }
        }
        handleSendVoiceMessage(final);
      }
    }, SILENCE_TIMEOUT_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start Web Speech API recognition for the candidate's turn
  const startListening = useCallback(() => {
    const SpeechRecognitionAPI =
      (typeof window !== "undefined" &&
        (window.SpeechRecognition || window.webkitSpeechRecognition)) ||
      null;

    if (!SpeechRecognitionAPI) {
      updateVoiceState("text-mode");
      setShowTextInput(true);
      return;
    }

    // Abort previous session cleanly
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
    }
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    setCurrentTranscript("");
    currentTranscriptRef.current = "";
    updateVoiceState("listening");

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true; // keep listening — we handle silence ourselves
    recognition.interimResults = true; // gives live partial results
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      setCurrentTranscript(transcript);
      currentTranscriptRef.current = transcript;
      // Every time we get new speech, reset the silence timer
      resetSilenceTimer();
    };

    recognition.onend = () => {
      // continuous mode may still fire onend (e.g. browser limit, network issue)
      if (voiceStateRef.current === "listening") {
        const final = currentTranscriptRef.current.trim();
        if (final) {
          // We have a transcript — send it
          handleSendVoiceMessage(final);
        } else {
          // No speech captured — restart recognition after a brief pause
          setTimeout(() => {
            if (voiceStateRef.current === "listening") startListening();
          }, 500);
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (
        event.error === "no-speech" &&
        voiceStateRef.current === "listening"
      ) {
        // No speech detected — restart after brief pause
        setTimeout(() => {
          if (voiceStateRef.current === "listening") startListening();
        }, 500);
      } else if (event.error === "not-allowed") {
        setHasMicPermission(false);
        updateVoiceState("text-mode");
        setShowTextInput(true);
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── End interview ────────────────────────────────────────────────
  const handleEndInterview = useCallback(async () => {
    stopInterruptDetection();
    if (timerRef.current) clearInterval(timerRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        /* ignore */
      }
    }
    updateVoiceState("idle");
    try {
      const res = await interviewServices.endInterview(token);
      setEndData(res.data);
      setScreen("completed");
    } catch (err: unknown) {
      const msg =
        (err as ApiError).response?.data?.message || "Failed to end interview";
      toast.error(msg);
    }
  }, [token]);

  // Send candidate voice message → backend LLM + TTS in parallel → play together
  const handleSendVoiceMessage = useCallback(
    async (transcript: string) => {
      if (!transcript.trim()) return;
      if (voiceStateRef.current === "processing") return;

      // Stop any ongoing recognition and silence timer
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          /* ignore */
        }
        recognitionRef.current = null;
      }

      setCurrentTranscript("");
      currentTranscriptRef.current = "";

      const candidateMsg: ChatMessage = {
        role: "candidate",
        content: transcript,
        type: "answer",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, candidateMsg]);
      updateVoiceState("processing");
      setSending(true);

      try {
        // Step 1: Get the AI response (LLM)
        const res = await interviewServices.sendMessage(token, transcript);
        const data = res.data;

        if (data.interviewComplete) {
          if (data.aiMessage) {
            setMessages((prev) => [
              ...prev,
              {
                role: "ai",
                content: data.aiMessage,
                type: "question",
                timestamp: new Date().toISOString(),
              },
            ]);
          }
          setTimeout(() => handleEndInterview(), 2000);
          return;
        }

        if (data.aiMessage) {
          // Step 2: Fetch TTS audio BEFORE showing the message
          // This way the text + audio appear simultaneously
          if (ttsAvailable) {
            try {
              const ttsBlob = await interviewServices.getTTS(
                token,
                data.aiMessage,
              );
              // Now show the message and play audio at the same time
              setMessages((prev) => [
                ...prev,
                {
                  role: "ai",
                  content: data.aiMessage,
                  type: data.action === "followup" ? "followup" : "question",
                  timestamp: new Date().toISOString(),
                  evaluation: data.evaluation,
                },
              ]);
              if (data.questionNumber) setQuestionNumber(data.questionNumber);
              playTTSBlob(ttsBlob);
            } catch (ttsErr: unknown) {
              // TTS failed — show message and fall back to text-only
              setTtsAvailable(false);
              setMessages((prev) => [
                ...prev,
                {
                  role: "ai",
                  content: data.aiMessage,
                  type: data.action === "followup" ? "followup" : "question",
                  timestamp: new Date().toISOString(),
                  evaluation: data.evaluation,
                },
              ]);
              if (data.questionNumber) setQuestionNumber(data.questionNumber);
              const ttsMsg =
                (ttsErr as { response?: { data?: { message?: string } } })
                  ?.response?.data?.message ||
                "AI voice temporarily unavailable";
              toast.info(ttsMsg);
              updateVoiceState("listening");
              startListening();
            }
          } else {
            // No TTS — just show text and start listening after a natural pause
            setMessages((prev) => [
              ...prev,
              {
                role: "ai",
                content: data.aiMessage,
                type: data.action === "followup" ? "followup" : "question",
                timestamp: new Date().toISOString(),
                evaluation: data.evaluation,
              },
            ]);
            if (data.questionNumber) setQuestionNumber(data.questionNumber);
            setTimeout(() => {
              updateVoiceState("listening");
              startListening();
            }, 2500);
          }
        }
      } catch (err: unknown) {
        const msg =
          (err as ApiError).response?.data?.message ||
          "Failed to send response";
        toast.error(msg);
        setMessages((prev) => prev.slice(0, -1)); // remove optimistic message
        updateVoiceState("listening");
        startListening();
      } finally {
        setSending(false);
      }
    },
    [token, ttsAvailable, playTTSBlob, startListening, handleEndInterview],
  );

  // ─── Start interview ──────────────────────────────────────────────
  const handleStartInterview = async () => {
    try {
      setStarting(true);

      // Kick off mic init in parallel with the API call
      const [, res] = await Promise.all([
        initMicAccess(),
        interviewServices.startConversation(token),
      ]);

      const data = res.data;
      setMessages(data.messages || []);
      setQuestionNumber(data.questionNumber || 1);
      setTotalPlanned(data.totalPlanned || details?.settings.maxQuestions || 5);
      setStartedAt(data.startedAt);
      setTimeRemaining(
        data.timeLimitMinutes || details?.settings.timeLimitMinutes || 30,
      );
      setScreen("interview");

      // Play greeting audio: prefer pre-generated base64 audio from server
      if (data.aiMessage) {
        setTimeout(() => {
          if (data.audio) {
            // Server sent base64 WAV audio with the greeting
            try {
              const byteString = atob(data.audio);
              const bytes = new Uint8Array(byteString.length);
              for (let i = 0; i < byteString.length; i++) {
                bytes[i] = byteString.charCodeAt(i);
              }
              const blob = new Blob([bytes], { type: "audio/wav" });
              playTTSBlob(blob);
            } catch {
              playAIResponse(data.aiMessage);
            }
          } else {
            playAIResponse(data.aiMessage);
          }
        }, 400);
      }
    } catch (err: unknown) {
      const msg =
        (err as ApiError).response?.data?.message ||
        "Failed to start interview";
      toast.error(msg);
    } finally {
      setStarting(false);
    }
  };

  // ─── Text-mode send (fallback) ────────────────────────────────────
  const handleSendTextMessage = async () => {
    if (!inputMessage.trim() || sending) return;
    const text = inputMessage.trim();
    setInputMessage("");
    await handleSendVoiceMessage(text); // same pipeline
  };

  // ─── Mic button handler ───────────────────────────────────────────
  const handleMicClick = () => {
    if (voiceState === "ai-speaking") {
      handleInterrupt();
    } else if (voiceState === "listening") {
      // Manually stop silence timer and recognition, then send
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          /* ignore */
        }
      }
      const captured = currentTranscriptRef.current.trim();
      if (captured) handleSendVoiceMessage(captured);
    } else if (voiceState === "text-mode" || voiceState === "idle") {
      startListening();
    }
  };

  // Toggle mute on AI audio
  const handleToggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (audioRef.current) audioRef.current.muted = newMuted;
  };

  // ─── Text input keydown ───────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendTextMessage();
    }
  };

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  // ═══════════════════════════════════════════════════════════════════
  // SCREENS
  // ═══════════════════════════════════════════════════════════════════

  if (screen === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading your interview...</p>
        </div>
      </div>
    );
  }

  if (screen === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold">Interview Unavailable</h2>
            <p className="text-muted-foreground">{errorMsg}</p>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (screen === "already-completed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
            <h2 className="text-xl font-semibold">
              Interview Already Completed
            </h2>
            <p className="text-muted-foreground">
              This interview has already been completed and submitted for
              review. You&apos;ll receive feedback soon.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (screen === "completed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-lg w-full mx-4">
          <CardContent className="pt-8 text-center space-y-6">
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
              <div className="relative flex items-center justify-center w-20 h-20 bg-green-500/10 rounded-full">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Congratulations!</h2>
              <p className="text-muted-foreground">
                You&apos;ve successfully completed your interview
                {details?.interview.jobTitle && (
                  <>
                    {" "}
                    for{" "}
                    <span className="font-medium text-foreground">
                      {details.interview.jobTitle}
                    </span>
                  </>
                )}
                {details?.interview.companyName && (
                  <>
                    {" "}
                    at{" "}
                    <span className="font-medium text-foreground">
                      {details.interview.companyName}
                    </span>
                  </>
                )}
                .
              </p>
            </div>
            {endData && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-primary">
                    {endData.questionsAsked}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Questions Answered
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-primary">
                    {endData.timeTaken}m
                  </p>
                  <p className="text-xs text-muted-foreground">Time Taken</p>
                </div>
              </div>
            )}
            <Separator />
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground text-left">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="font-medium text-foreground">
                  What happens next?
                </p>
              </div>
              <ul className="list-disc list-inside space-y-1">
                <li>Our AI is analyzing your responses</li>
                <li>The hiring team will review your results</li>
                <li>You&apos;ll be notified about the next steps</li>
              </ul>
            </div>
            <Link href="/">
              <Button variant="outline" className="mt-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (screen === "details" && details) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  P
                </span>
              </div>
              <p className="font-semibold text-sm">HR Auto AI Interview</p>
            </div>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {details.settings.timeLimitMinutes} min
            </Badge>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">
                Welcome, {details.interview.candidateName}!
              </CardTitle>
              <CardDescription className="text-base">
                You&apos;re about to start your AI-powered interview
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    icon: Briefcase,
                    label: "Position",
                    value: details.interview.jobTitle,
                  },
                  {
                    icon: Building2,
                    label: "Company",
                    value: details.interview.companyName,
                  },
                  {
                    icon: FileText,
                    label: "Questions",
                    value: `${details.settings.maxQuestions} questions`,
                  },
                  {
                    icon: Timer,
                    label: "Time Limit",
                    value: `${details.settings.timeLimitMinutes} minutes`,
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 bg-muted/50 rounded-lg p-3"
                  >
                    <Icon className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold mb-3">Before you begin</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    The AI interviewer will speak to you — ensure your speakers
                    are on
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    Answer verbally using your microphone — or type as a
                    fallback
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    Difficulty:{" "}
                    <span className="font-medium text-foreground ml-1">
                      {details.settings.difficulty}
                    </span>
                  </li>
                  {details.settings.followUpEnabled && (
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      The AI may ask follow-up questions based on your answers
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    You can interrupt the AI at any time by speaking
                  </li>
                </ul>
              </div>
              <Button
                onClick={handleStartInterview}
                disabled={starting}
                size="lg"
                className="w-full"
              >
                {starting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Starting Interview...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Interview
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // ─── MAIN INTERVIEW SCREEN ─────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════
  const progress = totalPlanned > 0 ? (questionNumber / totalPlanned) * 100 : 0;
  const lastAiMessage =
    [...messages].reverse().find((m) => m.role === "ai")?.content ?? "";

  // Labels and colours driven by voiceState
  const aiStateLabel: Record<VoiceState, string> = {
    idle: "Ready",
    "ai-speaking": "Speaking…",
    listening: "Listening…",
    processing: "Thinking…",
    "text-mode": "Active",
  };

  const candidateStateLabel: Record<VoiceState, string> = {
    idle: "Waiting to start",
    "ai-speaking": "AI is speaking — tap mic to interrupt",
    listening: "Your turn — speak your answer",
    processing: "Sending your answer…",
    "text-mode": "Type your answer below",
  };

  return (
    <>
      {/* ── Keyframe styles for waveform + pulse rings ── */}
      <style>{`
        @keyframes waveBar {
          0%, 100% { transform: scaleY(0.25); }
          50%       { transform: scaleY(1); }
        }
        .wave-bar {
          animation: waveBar 0.9s ease-in-out infinite;
          transform-origin: bottom;
        }
        @keyframes ringPulse {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        .ring-pulse {
          animation: ringPulse 1.6s ease-out infinite;
        }
        .ring-pulse-delay {
          animation: ringPulse 1.6s ease-out infinite 0.5s;
        }
        @keyframes micPulse {
          0%   { transform: scale(1);   opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .mic-pulse  { animation: micPulse 1s ease-out infinite; }
        .mic-pulse2 { animation: micPulse 1s ease-out infinite 0.35s; }
      `}</style>

      <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden">
        {/* ── Top bar ── */}
        <header className="shrink-0 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-4 py-2 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">
                P
              </span>
            </div>
            <div>
              <p className="font-semibold text-sm text-white">AI Interview</p>
              <p className="text-xs text-slate-400">
                {details?.interview.jobTitle} · {details?.interview.companyName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="gap-1 border-slate-700 text-slate-300 text-xs"
            >
              <MessageSquare className="h-3 w-3" />Q {questionNumber}/
              {totalPlanned}
            </Badge>
            <Badge
              variant={timeRemaining <= 5 ? "destructive" : "outline"}
              className="gap-1 border-slate-700 text-slate-300 text-xs"
            >
              <Clock className="h-3 w-3" />
              {formatTime(timeRemaining)}
            </Badge>

            {/* Mute toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-white"
              onClick={handleToggleMute}
              title={isMuted ? "Unmute AI" : "Mute AI"}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>

            {/* Text / voice toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-white"
              onClick={() => setShowTextInput((v) => !v)}
              title="Toggle text input"
            >
              <Keyboard className="h-4 w-4" />
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleEndInterview}
              className="gap-1 h-8"
            >
              <PhoneOff className="h-3.5 w-3.5" />
              End
            </Button>
          </div>
        </header>

        {/* ── Progress bar ── */}
        <Progress
          value={progress}
          className="h-0.5 rounded-none shrink-0 bg-slate-800 [&>div]:bg-primary"
        />

        {/* ── Main content ── */}
        <div className="flex-1 flex overflow-hidden">
          {/* ━━━ LEFT: AI avatar + candidate controls ━━━ */}
          <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6 relative">
            {/* AI avatar */}
            <div className="relative flex items-center justify-center">
              {/* Pulse rings when AI is speaking */}
              {voiceState === "ai-speaking" && (
                <>
                  <span className="ring-pulse absolute inset-0 rounded-full bg-primary/30" />
                  <span className="ring-pulse-delay absolute inset-0 rounded-full bg-primary/20" />
                </>
              )}
              <div
                className={`relative h-32 w-32 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${
                  voiceState === "ai-speaking"
                    ? "bg-primary/20 border-primary shadow-lg shadow-primary/30"
                    : voiceState === "processing"
                      ? "bg-amber-500/10 border-amber-500/40"
                      : "bg-slate-800 border-slate-700"
                }`}
              >
                {voiceState === "processing" ? (
                  <Loader2 className="h-14 w-14 text-amber-400 animate-spin" />
                ) : (
                  <Bot
                    className={`h-14 w-14 transition-colors duration-300 ${
                      voiceState === "ai-speaking"
                        ? "text-primary"
                        : "text-slate-400"
                    }`}
                  />
                )}
              </div>
            </div>

            {/* AI label + status */}
            <div className="text-center space-y-1">
              <p className="font-semibold text-lg text-white">AI Interviewer</p>
              <p className="text-sm text-slate-400">
                {details?.interview.companyName}
              </p>
              <Badge
                className={`mt-1 text-xs ${
                  voiceState === "ai-speaking"
                    ? "bg-primary/20 text-primary border-primary/40"
                    : voiceState === "processing"
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                      : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
                variant="outline"
              >
                {aiStateLabel[voiceState]}
              </Badge>
            </div>

            {/* Waveform when AI is speaking */}
            {voiceState === "ai-speaking" && (
              <div className="flex items-end gap-1 h-10" aria-hidden>
                {[0.35, 0.65, 1, 0.75, 0.5, 0.85, 0.6, 0.4, 0.7, 0.45].map(
                  (maxH, i) => (
                    <div
                      key={i}
                      className="wave-bar rounded-full bg-primary"
                      style={{
                        width: "4px",
                        height: `${maxH * 40}px`,
                        animationDelay: `${i * 0.09}s`,
                      }}
                    />
                  ),
                )}
              </div>
            )}

            {/* Last AI question (shown when not speaking) */}
            {voiceState !== "ai-speaking" && lastAiMessage && (
              <div className="max-w-sm w-full bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-sm text-slate-300 leading-relaxed text-center line-clamp-4">
                {lastAiMessage}
              </div>
            )}

            <Separator className="bg-slate-800 w-64" />

            {/* ── Candidate controls ── */}
            <div className="flex flex-col items-center gap-3">
              <p className="text-xs text-slate-500 text-center max-w-xs">
                {candidateStateLabel[voiceState]}
              </p>

              {/* Mic / interrupt button */}
              <div className="relative">
                {voiceState === "listening" && (
                  <>
                    <span className="mic-pulse  absolute inset-0 rounded-full bg-rose-500/40" />
                    <span className="mic-pulse2 absolute inset-0 rounded-full bg-rose-500/20" />
                  </>
                )}
                <button
                  onClick={handleMicClick}
                  disabled={voiceState === "processing"}
                  aria-label={
                    voiceState === "ai-speaking"
                      ? "Interrupt AI"
                      : voiceState === "listening"
                        ? "Stop recording"
                        : "Start speaking"
                  }
                  className={`relative h-16 w-16 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40 disabled:cursor-not-allowed ${
                    voiceState === "listening"
                      ? "bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/40"
                      : voiceState === "ai-speaking"
                        ? "bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/30"
                        : voiceState === "processing"
                          ? "bg-slate-700"
                          : "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"
                  }`}
                >
                  {voiceState === "listening" ? (
                    <MicOff className="h-7 w-7 text-white" />
                  ) : voiceState === "ai-speaking" ? (
                    <Radio className="h-7 w-7 text-white" />
                  ) : voiceState === "processing" ? (
                    <Loader2 className="h-7 w-7 text-slate-400 animate-spin" />
                  ) : (
                    <Mic className="h-7 w-7 text-white" />
                  )}
                </button>
              </div>

              {/* Live transcript (shown while listening) */}
              {voiceState === "listening" && (
                <div className="min-h-10 max-w-sm w-full bg-slate-800/80 border border-rose-500/30 rounded-xl px-4 py-2 text-sm text-slate-200 text-center">
                  {currentTranscript ? (
                    <span>
                      {currentTranscript}
                      <span className="inline-block w-0.5 h-4 bg-rose-400 ml-1 animate-pulse align-middle" />
                    </span>
                  ) : (
                    <span className="text-slate-500 italic">
                      Listening… speak now
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ━━━ RIGHT: Chat transcript ━━━ */}
          <div className="w-80 border-l border-slate-800 flex flex-col bg-slate-900">
            <div className="shrink-0 px-4 py-3 border-b border-slate-800">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Transcript
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${msg.role === "candidate" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`shrink-0 h-7 w-7 rounded-full flex items-center justify-center ${
                      msg.role === "ai" ? "bg-primary/20" : "bg-slate-700"
                    }`}
                  >
                    {msg.role === "ai" ? (
                      <Bot className="h-4 w-4 text-primary" />
                    ) : (
                      <User className="h-4 w-4 text-slate-300" />
                    )}
                  </div>
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                      msg.role === "ai"
                        ? "bg-slate-800 text-slate-200"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.timestamp && (
                      <p
                        className={`text-[10px] mt-1 ${msg.role === "ai" ? "text-slate-500" : "text-primary-foreground/60"}`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {/* Live transcript bubble in chat while user is speaking */}
              {voiceState === "listening" && currentTranscript && (
                <div className="flex gap-2 flex-row-reverse">
                  <div className="shrink-0 h-7 w-7 rounded-full bg-slate-700 flex items-center justify-center">
                    <User className="h-4 w-4 text-slate-300" />
                  </div>
                  <div className="max-w-[85%] rounded-xl px-3 py-2 text-sm bg-primary/30 text-slate-100 border border-primary/40 italic">
                    {currentTranscript}
                    <span className="inline-block w-0.5 h-3 bg-primary ml-1 animate-pulse align-middle" />
                  </div>
                </div>
              )}

              {/* AI thinking indicator */}
              {voiceState === "processing" && (
                <div className="flex gap-2">
                  <div className="shrink-0 h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-slate-800 rounded-xl px-3 py-2.5">
                    <div className="flex gap-1">
                      {[0, 150, 300].map((d) => (
                        <div
                          key={d}
                          className="h-2 w-2 rounded-full bg-slate-500 animate-bounce"
                          style={{ animationDelay: `${d}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Text input (shown in text-mode or when keyboard toggle is on) */}
            {(showTextInput || voiceState === "text-mode") && (
              <div className="shrink-0 border-t border-slate-800 p-3 space-y-2">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={voiceState === "processing"}
                  placeholder="Type your answer… (Enter to send)"
                  rows={2}
                  className="w-full resize-none rounded-lg bg-slate-800 border border-slate-700 text-slate-200 placeholder:text-slate-600 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                />
                <Button
                  onClick={handleSendTextMessage}
                  disabled={!inputMessage.trim() || voiceState === "processing"}
                  size="sm"
                  className="w-full gap-2"
                >
                  {voiceState === "processing" ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Send Answer
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
