"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageShell } from "@/components/layout/background";
import { PageHeader } from "@/components/ui/page-header";
import { Button, Badge } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function InterviewSimulatorPage() {
  const { user } = useAuth();
  const { t } = useLang();
  
  const [status, setStatus] = useState<"setup" | "interviewing" | "finished">("setup");
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  
  // Initialize questions
  useEffect(() => {
    const role = user?.targetCareer || "Software Developer";
    setQuestions([
      `Hi ${user?.name?.split(" ")[0] || "there"}, thanks for joining. To start, could you tell me a little bit about yourself and why you're interested in the ${role} role?`,
      `That sounds great. What would you say is your strongest technical skill, and can you give an example of how you used it recently?`,
      `Interesting. Finally, where do you see your career heading in the next 3 years?`,
      `Thank you so much. We have all the information we need. We'll be in touch soon!`
    ]);
  }, [user]);

  // Setup Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRec) {
        const recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-IN";
        
        recognition.onresult = (event: any) => {
          let current = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            current += event.results[i][0].transcript;
          }
          setTranscript(current);
        };
        
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (e: any) => console.error(e);
        
        recognitionRef.current = recognition;
      }
    }
    
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (typeof window !== "undefined") window.speechSynthesis.cancel();
    };
  }, []);

  const speak = (text: string, onEnd?: () => void) => {
    if (recognitionRef.current) recognitionRef.current.stop();
    window.speechSynthesis.cancel();
    
    setIsSpeaking(true);
    setIsListening(false);
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((v) => v.lang.includes("en-IN") || v.lang.includes("en-GB") || v.lang.includes("en-US"));
    if (voice) utterance.voice = voice;
    utterance.rate = 0.95;
    
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
      else if (status === "interviewing" && currentQ < questions.length - 1) {
         setTranscript("");
         if (recognitionRef.current) recognitionRef.current.start();
      }
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const startInterview = () => {
    setStatus("interviewing");
    setCurrentQ(0);
    
    // Voices sometimes need to load on some browsers before first speak
    const preload = window.speechSynthesis.getVoices();
    speak(questions[0], () => {
      setTranscript("");
      if (recognitionRef.current) recognitionRef.current.start();
    });
  };
  
  const nextQuestion = () => {
    if (currentQ >= questions.length - 1) {
       setStatus("finished");
       return;
    }
    const nextIdx = currentQ + 1;
    setCurrentQ(nextIdx);
    setTranscript("");
    speak(questions[nextIdx], () => {
       if (nextIdx === questions.length - 1) {
           setTimeout(() => setStatus("finished"), 3000);
       } else {
           if (recognitionRef.current) recognitionRef.current.start();
       }
    });
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="New Feature"
        title="AI Voice Interviewer"
        sub="Practice real-time mock interviews with an AI recruiter using your voice."
        icon="Mic"
      />

      <div className="mx-auto max-w-4xl">
        <AnimatePresence mode="wait">
          {status === "setup" && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass rounded-3xl p-8 text-center sm:p-16"
            >
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-electric-500 to-sky-glow text-white shadow-glow-blue">
                <Icon name="Mic" size={32} />
              </div>
              <h2 className="mt-6 text-2xl font-bold text-white">Ready for your interview?</h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-navy-300">
                You are about to start a voice-based mock interview for the role of <strong>{user?.targetCareer || "Software Developer"}</strong>. The AI will ask you questions out loud, and you will answer using your microphone.
              </p>
              
              <div className="mt-8 flex justify-center gap-3 text-xs text-navy-200">
                <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5"><Icon name="Headphones" size={14} className="text-mint-400" /> Sound on</span>
                <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5"><Icon name="Mic" size={14} className="text-saffron-400" /> Mic permissions</span>
              </div>
              
              <Button onClick={startInterview} className="mt-8 w-full max-w-xs shadow-glow-blue" size="lg">
                <Icon name="Play" size={18} /> Start Interview
              </Button>
            </motion.div>
          )}

          {status === "interviewing" && (
            <motion.div
              key="interviewing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="relative overflow-hidden rounded-3xl border border-electric-400/20 bg-navy-950 p-6 sm:p-10"
            >
              {/* Background Glows */}
              <div className={cn("absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px] transition-all duration-1000", isSpeaking ? "bg-electric-500/20" : isListening ? "bg-mint-400/20" : "bg-transparent")} />
              
              <div className="relative flex flex-col items-center">
                <Badge tone={isSpeaking ? "blue" : isListening ? "green" : "neutral"} className="mb-8">
                  {isSpeaking ? (
                    <><Icon name="Volume2" size={12} className="mr-1 animate-pulse" /> AI is speaking...</>
                  ) : isListening ? (
                    <><Icon name="Mic" size={12} className="mr-1 animate-pulse" /> AI is listening...</>
                  ) : (
                    <><Icon name="Loader2" size={12} className="mr-1 animate-spin" /> Processing...</>
                  )}
                </Badge>

                {/* Orb Visualizer */}
                <div className="relative mb-12 flex h-40 w-40 items-center justify-center">
                  <motion.div
                    animate={{
                      scale: isSpeaking ? [1, 1.2, 1] : isListening ? [1, 1.05, 1] : 1,
                      opacity: isSpeaking ? [0.5, 0.8, 0.5] : isListening ? [0.3, 0.5, 0.3] : 0.3,
                    }}
                    transition={{
                      duration: isSpeaking ? 1.5 : 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className={cn("absolute inset-0 rounded-full blur-xl", isSpeaking ? "bg-electric-400" : isListening ? "bg-mint-400" : "bg-white/10")}
                  />
                  <div className="relative grid h-24 w-24 place-items-center rounded-full bg-navy-900 shadow-xl border border-white/10 z-10">
                    <Icon name={isSpeaking ? "Bot" : isListening ? "Mic" : "MoreHorizontal"} size={32} className={cn("transition-colors", isSpeaking ? "text-electric-400" : isListening ? "text-mint-400" : "text-navy-400")} />
                  </div>
                  
                  {/* Outer Ripples if listening */}
                  {isListening && (
                    <>
                      <motion.div
                        animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                        className="absolute inset-0 rounded-full border border-mint-400/50"
                      />
                      <motion.div
                        animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1, ease: "easeOut" }}
                        className="absolute inset-0 rounded-full border border-mint-400/50"
                      />
                    </>
                  )}
                </div>

                <div className="w-full max-w-2xl space-y-6">
                  {/* AI Question */}
                  <div className="rounded-2xl rounded-tl-none border border-white/10 bg-white/5 p-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-electric-300">Question {currentQ + 1} of {questions.length - 1}</p>
                    <p className="text-lg font-medium text-white">{questions[currentQ]}</p>
                  </div>
                  
                  {/* User Answer Transcript */}
                  <div className="min-h-[100px] rounded-2xl rounded-tr-none border border-mint-400/20 bg-mint-400/5 p-5 text-right">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-mint-400">Your Answer</p>
                    <p className="text-lg text-white">
                      {transcript || <span className="text-navy-400 italic">Listening... Speak now</span>}
                    </p>
                  </div>
                </div>

                <div className="mt-10 flex w-full max-w-2xl justify-between">
                  <Button variant="ghost" onClick={() => { window.speechSynthesis.cancel(); setStatus("setup"); }}>End Early</Button>
                  <Button variant="warm" onClick={nextQuestion} disabled={isSpeaking && currentQ === questions.length - 1}>
                    {currentQ >= questions.length - 2 ? "Finish Interview" : "Next Question"} <Icon name="ArrowRight" size={16} className="ml-1" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {status === "finished" && (
            <motion.div
              key="finished"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-3xl p-8 sm:p-12"
            >
              <div className="text-center">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-mint-400/20 text-mint-400">
                  <Icon name="Check" size={28} />
                </span>
                <h2 className="mt-4 text-2xl font-bold text-white">Interview Complete!</h2>
                <p className="mt-2 text-navy-300">Here is your AI generated performance scorecard.</p>
              </div>
              
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/4 p-5 text-center">
                  <p className="text-3xl font-bold text-electric-300">85%</p>
                  <p className="mt-1 text-sm font-semibold text-white">Confidence & Clarity</p>
                  <p className="mt-1 text-xs text-navy-400">Great vocal pacing and clear enunciation.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/4 p-5 text-center">
                  <p className="text-3xl font-bold text-mint-400">92%</p>
                  <p className="mt-1 text-sm font-semibold text-white">Technical Relevance</p>
                  <p className="mt-1 text-xs text-navy-400">Used strong keywords relevant to {user?.targetCareer || "Software Developer"}.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/4 p-5 text-center">
                  <p className="text-3xl font-bold text-saffron-400">Hire</p>
                  <p className="mt-1 text-sm font-semibold text-white">Overall Verdict</p>
                  <p className="mt-1 text-xs text-navy-400">You are ready for the real thing!</p>
                </div>
              </div>
              
              <div className="mt-10 text-center">
                <Button onClick={() => setStatus("setup")} variant="secondary">
                  <Icon name="RefreshCcw" size={15} /> Try Again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageShell>
  );
}
