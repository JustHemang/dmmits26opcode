"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PageShell } from "@/components/layout/background";
import { Icon } from "@/components/ui/icon";
import { submitAiInterview, listJobApplications, findPostedJob } from "@/lib/db";
import { useStore } from "@/lib/store";

function InterviewRoomContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useStore();
  const appId = searchParams.get("appId");

  const [application, setApplication] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const [messages, setMessages] = useState<{ role: "ai" | "user"; text: string }[]>([]);
  
  const recognitionRef = useRef<any>(null);

  // Load application context
  useEffect(() => {
    if (!appId) {
      toast("No Application ID provided.", { kind: "error" });
      router.push("/applications");
      return;
    }
    const app = listJobApplications().find((a) => a.id === appId);
    if (!app) {
      toast("Application not found.", { kind: "error" });
      router.push("/applications");
      return;
    }
    setApplication(app);
    const j = findPostedJob(app.jobId);
    if (j) setJob(j);
  }, [appId, router, toast]);

  // Setup Web Speech API
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-IN";

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        handleUserResponse(text);
      };
      recognitionRef.current = recognition;
    } else {
      toast("Your browser doesn't support Voice APIs.", { kind: "error" });
    }
  }, []);

  const speak = (text: string, onEnd?: () => void) => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a good voice
    const voices = window.speechSynthesis.getVoices();
    const ukVoice = voices.find(v => v.lang.includes('en-GB') || v.name.includes('UK'));
    if (ukVoice) utterance.voice = ukVoice;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };
    window.speechSynthesis.speak(utterance);
  };

  const startInterview = () => {
    setStarted(true);
    const greeting = `Hello ${application?.seekerName.split(" ")[0] || "there"}. Welcome to your AI Interview for the ${job?.title || "Role"} position at ${job?.company || "our company"}. I am going to ask you a couple of questions. Let's start. Can you tell me about your experience with ${job?.skills[0] || "your main skills"}?`;
    setMessages([{ role: "ai", text: greeting }]);
    speak(greeting, () => {
      // Auto-start listening after AI finishes speaking
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch (e) {}
      }
    });
  };

  const handleUserResponse = (text: string) => {
    setMessages(prev => [...prev, { role: "user", text }]);
    
    setTimeout(() => {
      if (messages.length < 2) {
        // Ask second question
        const nextQ = `Great answer. How would you handle a difficult technical challenge involving ${job?.skills[1] || "system design"}?`;
        setMessages(prev => [...prev, { role: "ai", text: nextQ }]);
        speak(nextQ, () => {
          if (recognitionRef.current) {
            try { recognitionRef.current.start(); } catch (e) {}
          }
        });
      } else {
        // Conclude interview
        const ending = "Thank you for your responses. I have everything I need. Your results will be sent to the employer.";
        setMessages(prev => [...prev, { role: "ai", text: ending }]);
        speak(ending, () => {
          finishInterview();
        });
      }
    }, 1000);
  };

  const finishInterview = () => {
    setFinished(true);
    
    // Generate AI scorecard based on length of response
    const combinedTranscript = messages.filter(m => m.role === 'user').map(m => m.text).join(" ");
    const score = Math.min(100, 70 + combinedTranscript.length / 5);
    const technicalScore = Math.min(100, 65 + combinedTranscript.length / 4);
    const verdict = score > 85 ? "Highly Recommended" : "Recommended";
    
    submitAiInterview(appId!, {
      transcript: combinedTranscript || "Candidate did not provide verbal responses.",
      score: Math.round(score),
      technicalScore: Math.round(technicalScore),
      verdict
    });
  };

  if (!application || !job) {
    return <PageShell><div className="text-white">Loading application...</div></PageShell>;
  }

  return (
    <PageShell className="max-w-5xl pt-24 pb-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute left-1/2 top-1/3 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-electric-500/5 blur-[150px]" />
      </div>

      <div className="relative mb-6 text-center">
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Live AI Interview</h1>
        <p className="mt-2 text-navy-300">
          Role: <span className="font-semibold text-electric-300">{job.title}</span> at <span className="font-semibold text-white">{job.company}</span>
        </p>
      </div>

      <div className="relative mx-auto flex w-full max-w-3xl flex-col overflow-hidden rounded-[2.5rem] border border-white/10 bg-navy-950/50 shadow-2xl backdrop-blur-xl min-h-[600px]">
        {/* Top HUD Bar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${started && !finished ? 'bg-mint-400' : 'bg-navy-400'}`} />
              <span className={`relative inline-flex h-3 w-3 rounded-full ${started && !finished ? 'bg-mint-400' : 'bg-navy-400'}`} />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-navy-300">
              {finished ? "Session Ended" : started ? "Recording Active" : "Standby"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-navy-400">
            <Icon name="ShieldCheck" size={14} className="text-electric-300" /> Proctored AI
          </div>
        </div>

        {!started ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="mb-8 relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-electric-500/20" />
              <div className="relative grid h-28 w-28 place-items-center rounded-full bg-electric-500/20 text-electric-300 shadow-glow-blue border border-electric-400/30">
                <Icon name="Mic" size={48} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white">System Ready</h2>
            <p className="mt-3 max-w-sm text-navy-300">
              Ensure your microphone is connected and you are in a quiet environment before proceeding.
            </p>
            <button
              onClick={startInterview}
              className="mt-10 rounded-full bg-gradient-to-r from-electric-500 to-sky-glow px-10 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-glow-blue transition-all hover:scale-105 hover:brightness-110"
            >
              Initialize Interview
            </button>
          </div>
        ) : finished ? (
           <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="mb-8 relative">
              <div className="relative grid h-28 w-28 place-items-center rounded-full bg-mint-500/20 text-mint-400 border border-mint-400/30">
                <Icon name="CheckCircle2" size={48} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white">Interview Complete</h2>
            <p className="mt-3 max-w-md text-navy-300">
              Your responses have been successfully analyzed and transmitted to the employer. You may now exit the room.
            </p>
            <button
              onClick={() => router.push("/applications")}
              className="mt-10 rounded-full border border-white/10 bg-white/5 px-10 py-4 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-white/10 hover:scale-105"
            >
              Return to Tracker
            </button>
          </div>
        ) : (
          <div className="flex flex-1 flex-col relative">
            {/* Visualizer Area */}
            <div className="flex flex-1 flex-col items-center justify-center relative p-8">
              <div className="relative flex items-center justify-center h-64 w-64">
                {/* Concentric rings that pulse when speaking/listening */}
                <motion.div 
                  animate={{ scale: isSpeaking ? [1, 1.3, 1] : isListening ? [1, 1.1, 1] : 1, opacity: (isSpeaking || isListening) ? [0.3, 0.6, 0.3] : 0.1 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className={`absolute inset-0 rounded-full border-2 ${isSpeaking ? 'border-electric-400' : isListening ? 'border-rose-400' : 'border-navy-500'}`}
                />
                <motion.div 
                  animate={{ scale: isSpeaking ? [1, 1.6, 1] : isListening ? [1, 1.25, 1] : 1, opacity: (isSpeaking || isListening) ? [0.1, 0.3, 0.1] : 0.05 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                  className={`absolute -inset-10 rounded-full border ${isSpeaking ? 'border-electric-400' : isListening ? 'border-rose-400' : 'border-navy-500'}`}
                />
                <motion.div 
                  animate={{ scale: isSpeaking ? [1, 1.9, 1] : isListening ? [1, 1.4, 1] : 1, opacity: (isSpeaking || isListening) ? [0.05, 0.15, 0.05] : 0.02 }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                  className={`absolute -inset-20 rounded-full border ${isSpeaking ? 'border-electric-400' : isListening ? 'border-rose-400' : 'border-navy-500'}`}
                />
                
                {/* Core Orb */}
                <div className={`relative z-10 grid h-32 w-32 place-items-center rounded-full bg-gradient-to-br shadow-2xl transition-colors duration-500 ${isSpeaking ? 'from-electric-500 to-sky-400 shadow-electric-500/50' : isListening ? 'from-rose-500 to-pink-500 shadow-rose-500/50' : 'from-navy-700 to-navy-800'}`}>
                   {isSpeaking ? (
                     <Icon name="BrainCircuit" size={48} className="text-white animate-pulse" />
                   ) : isListening ? (
                     <Icon name="Mic" size={48} className="text-white animate-pulse" />
                   ) : (
                     <Icon name="Minus" size={48} className="text-navy-400" />
                   )}
                </div>
              </div>

              {/* Status Text below orb */}
              <div className="mt-12 text-center h-12">
                <AnimatePresence mode="wait">
                  {isSpeaking && (
                    <motion.p key="speaking" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-sm font-bold uppercase tracking-widest text-electric-400">
                      AI is formulating response...
                    </motion.p>
                  )}
                  {isListening && (
                    <motion.p key="listening" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-sm font-bold uppercase tracking-widest text-rose-400">
                      Listening to candidate...
                    </motion.p>
                  )}
                  {!isSpeaking && !isListening && (
                    <motion.p key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-bold uppercase tracking-widest text-navy-500">
                      Awaiting Input
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Transcript Overlay (Shows only the latest message) */}
            <div className="absolute bottom-[90px] left-0 right-0 px-8 pointer-events-none">
              <div className="mx-auto max-w-xl text-center">
                {messages.length > 0 && (
                  <motion.div
                    key={messages.length}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl backdrop-blur-md p-4 inline-block ${
                      messages[messages.length - 1].role === "ai"
                        ? "bg-electric-500/10 border border-electric-500/20 text-white"
                        : "bg-white/5 border border-white/10 text-navy-200"
                    }`}
                  >
                    <p className="text-xs font-bold uppercase tracking-wider opacity-50 mb-1">
                      {messages[messages.length - 1].role === "ai" ? "AI Recruiter" : "You"}
                    </p>
                    <p className="text-lg leading-relaxed font-medium">
                      "{messages[messages.length - 1].text}"
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Bottom Control Bar */}
            <div className="border-t border-white/10 bg-navy-950/80 p-6 flex justify-center backdrop-blur-xl z-20">
              <button
                onClick={() => {
                  if (!isListening && recognitionRef.current) {
                    try { recognitionRef.current.start(); } catch (e) {}
                  }
                }}
                disabled={isSpeaking || isListening}
                className={`group flex items-center justify-center gap-3 rounded-full px-8 py-3.5 text-sm font-bold uppercase tracking-widest transition-all ${
                  isListening 
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                    : isSpeaking
                      ? 'bg-white/5 text-navy-500 cursor-not-allowed'
                      : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105 border border-white/10'
                }`}
              >
                <Icon name={isListening ? "Radio" : "Mic"} size={18} className={isListening ? "animate-pulse" : ""} />
                {isListening ? "Listening..." : "Tap to Speak"}
              </button>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}

export default function InterviewRoomPage() {
  return (
    <Suspense fallback={<PageShell><div className="text-white">Loading...</div></PageShell>}>
      <InterviewRoomContent />
    </Suspense>
  );
}
