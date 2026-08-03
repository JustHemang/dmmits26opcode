"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
    <PageShell className="max-w-4xl pt-32">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Live AI Interview</h1>
        <p className="mt-2 text-navy-300">
          Interviewing for <span className="font-semibold text-white">{job.title}</span> at <span className="font-semibold text-electric-300">{job.company}</span>
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        {/* Main Room area */}
        <div className="glass flex min-h-[500px] flex-col overflow-hidden rounded-2xl">
          {!started ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <div className="mb-6 grid h-24 w-24 place-items-center rounded-full bg-electric-500/20 text-electric-300 shadow-glow-blue">
                <Icon name="Mic" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-white">Ready when you are.</h2>
              <p className="mt-2 max-w-sm text-navy-300">
                Ensure your microphone is connected and you are in a quiet environment.
              </p>
              <button
                onClick={startInterview}
                className="mt-8 rounded-xl bg-gradient-to-r from-electric-500 to-sky-glow px-8 py-3 font-semibold text-white shadow-glow-blue hover:brightness-110"
              >
                Start Interview
              </button>
            </div>
          ) : finished ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <div className="mb-6 grid h-24 w-24 place-items-center rounded-full bg-mint-500/20 text-mint-400">
                <Icon name="CheckCircle2" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-white">Interview Completed</h2>
              <p className="mt-2 max-w-sm text-navy-300">
                Your AI Interview is complete. The transcript and scores have been submitted directly to the employer.
              </p>
              <button
                onClick={() => router.push("/applications")}
                className="mt-8 rounded-xl bg-white/10 px-8 py-3 font-semibold text-white hover:bg-white/20"
              >
                Return to Applications
              </button>
            </div>
          ) : (
            <>
              {/* Interview Feed */}
              <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
                <div className="flex flex-col gap-4">
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                        m.role === "ai"
                          ? "bg-white/5 text-white self-start"
                          : "bg-electric-500/20 text-electric-100 self-end"
                      }`}
                    >
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider opacity-50">
                        {m.role === "ai" ? "AI Recruiter" : "You"}
                      </p>
                      <p className="text-sm leading-relaxed">{m.text}</p>
                    </div>
                  ))}
                  
                  {isListening && (
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="self-end rounded-2xl bg-white/5 px-5 py-3"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-electric-400" style={{ animationDelay: "0ms" }} />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-electric-400" style={{ animationDelay: "150ms" }} />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-electric-400" style={{ animationDelay: "300ms" }} />
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
              
              {/* Controls */}
              <div className="border-t border-white/10 bg-white/2 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isSpeaking ? (
                      <div className="flex items-center gap-2 rounded-full bg-electric-500/20 px-3 py-1.5 text-xs font-medium text-electric-300">
                        <Icon name="Volume2" size={14} className="animate-pulse" />
                        AI is speaking
                      </div>
                    ) : isListening ? (
                      <div className="flex items-center gap-2 rounded-full bg-rose-500/20 px-3 py-1.5 text-xs font-medium text-rose-300">
                        <Icon name="Mic" size={14} className="animate-pulse" />
                        Listening...
                      </div>
                    ) : (
                      <div className="text-xs text-navy-400">Waiting...</div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => {
                      if (!isListening && recognitionRef.current) {
                        try { recognitionRef.current.start(); } catch (e) {}
                      }
                    }}
                    disabled={isSpeaking || isListening}
                    className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-50"
                  >
                    <Icon name="Mic" size={16} /> Hold to Speak
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="hidden flex-col gap-4 md:flex">
          <div className="glass rounded-2xl p-5">
            <h3 className="mb-4 text-sm font-bold text-white flex items-center gap-2">
              <Icon name="Info" size={16} className="text-electric-300" /> Interview Info
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-navy-400 text-xs uppercase tracking-wider mb-1">Company</p>
                <p className="text-white font-medium">{job.company}</p>
              </div>
              <div>
                <p className="text-navy-400 text-xs uppercase tracking-wider mb-1">Role</p>
                <p className="text-white font-medium">{job.title}</p>
              </div>
              <div>
                <p className="text-navy-400 text-xs uppercase tracking-wider mb-1">Status</p>
                <p className="text-saffron-300 font-medium">In Progress</p>
              </div>
            </div>
          </div>
          
          <div className="glass rounded-2xl p-5">
            <h3 className="mb-3 text-sm font-bold text-white flex items-center gap-2">
              <Icon name="ShieldCheck" size={16} className="text-mint-400" /> Proctored Session
            </h3>
            <p className="text-xs text-navy-300 leading-relaxed">
              This session is monitored by AI. Your audio responses are being recorded and transcribed in real-time for the employer.
            </p>
          </div>
        </div>
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
