import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Send, Code, Sparkles, Trash2, Play, Pause, RotateCcw, Trophy } from 'lucide-react';

export default function App() {
  // State for Frontend Inputs
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState("");
  const [problemStatment, setProblemStatment] = useState('My array is printing weird numbers atthe end or crashing.');
  const [compileError, setCompileError] = useState('');

  // State for Gamified Study Points
  const [studyPoints, setStudyPoints] = useState(() => {
    const savedPoints = localStorage.getItem('scholar_study_points');
    return savedPoints ? parseInt(savedPoints, 10) : 0;
  });

  // State for Pomodoro Timer (25 minutes = 1500 seconds)
  const [timeLeft, setTimeLeft] = useState(1500);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState('Focus'); // Focus or Break

  // State for Chat System
  const [messages, setMessages] = useState(() => {
    const savedSession = localStorage.getItem('socratic_sage_history');
    return savedSession ? JSON.parse(savedSession) : [
      { role: 'assistant', content: "Hi! I'm Sage, your coding tutor. Paste your problem content on the left, then send me a message here to start working through it together!" } 
    ];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Synchronize Gamified Study Points to localStorage
  useEffect(() => {
    localStorage.setItem('scholar_study_points', studyPoints.toString());
  }, [studyPoints]);

  // Synchronize Chat History to localStorage
  useEffect(() => {
    localStorage.setItem('socratic_Sage_history', JSON.stringify(messages));
  }, [messages]);

  // Handle smooth alignment scrolling
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Pomodoro Timer Logic Countdown Loop
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(interval);
      setIsTimerRunning(false);
      
      // Reward System Triggers
      if (timerMode === 'Focus') {
        setStudyPoints((prev) => prev + 100); // Grant 100 Points!
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: "🎉 Outstanding focus session completed! I've credited +100 Study Points to your Scholar profile. Take a short 5-minute break now!" }
        ]);
        setTimerMode('Break');
        setTimeLeft(300); // 5 minute break
      } else {
        setTimerMode('Focus');
        setTimeLeft(1500); // Back to 25 mins
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, timerMode]);

  // Format seconds to MM:SS display format
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear your current conversation history?")) {
      localStorage.removeItem('socratic_sage_history');
      setMessages([
        { role: 'assistant', content: "Session reset! Ready for a new coding challenge. Drop your code context on the left!" }
      ]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userNewMessage = inputMessage.trim();
    const updatedHistory = [...messages, { role: 'user', content: userNewMessage }];
    
    setInputMessage('');
    setMessages(updatedHistory);
    setIsLoading(true);

    try {
      const BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL || 'https://socratic-tutor-backend.onrender.com';
      
      const response = await fetch(`${BACKEND_API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language,
          code,
          problemStatement: problemStatment,
          compileError,
          messageHistory: updatedHistory,
        }),
      });

      const data = await response.json();

      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.reply },
        ]);
      } else {
        throw new Error(data.error || 'Invalid API payload response layout.');
      }
    } catch (error) {
      console.error('🚨 Frontend API Link Failure:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I am having trouble connecting to my server engine. Please check that your backend terminal on port 5000 is still active!',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      
      {/* LEFT PANEL: Workspace Layout */}
      <div className="w-[35%] h-full flex flex-col border-r border-slate-800 p-4 space-y-4 bg-slate-900/40">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <Code className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-slate-200">Integrated Sandbox</h2>
          </div>
        </div>
        
        <div className="flex flex-col flex-1 space-y-1">
          <label className="text-xs font-semibold uppercase text-slate-400">Source Code</label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-sm text-emerald-400 resize-none outline-none"
            placeholder="// paste your code here...."
          />
        </div>
        
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-semibold uppercase text-rose-400">Console Error</label>
          <textarea
            value={compileError}
            onChange={(e) => setCompileError(e.target.value)}
            className="w-full bg-slate-950 border border-rose-950/40 text-rose-400 font-mono rounded-lg p-2.5 text-xs h-20 resize-none"
            placeholder="Paste Compilation leaks here..."
          />
        </div>
      </div>

      {/* CENTER PANEL: Gamified Pomodoro Battle Center */}
      <div className="w-[30%] h-full flex flex-col border-r border-slate-800 p-6 bg-slate-900/10 items-center justify-center space-y-8">
        
        {/* Scholar Rank Score Card */}
        <div className="w-full bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-4 flex items-center justify-between shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
              <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Scholar Score</p>
              <h4 className="text-xl font-bold text-white tracking-wide">{studyPoints} <span className="text-xs text-indigo-400">pts</span></h4>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold">
              LVL {Math.floor(studyPoints / 500) + 1}
            </span>
          </div>
        </div>

        {/* Pomodoro Visual Widget */}
        <div className="w-full bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col items-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
          
          <div className="text-center">
            <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-widest ${
              timerMode === 'Focus' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              {timerMode} Session
            </span>
          </div>

          <h1 className="text-5xl font-mono font-bold tracking-tight text-slate-100 drop-shadow-md">
            {formatTime(timeLeft)}
          </h1>

          {/* Action Control Trigger Set */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`p-3 rounded-xl font-medium transition-all shadow-md flex items-center justify-center ${
                isTimerRunning 
                  ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => { setIsTimerRunning(false); setTimeLeft(timerMode === 'Focus' ? 1500 : 300); }}
              className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 transition-colors"
              title="Reset Clock"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Chat Stream Interface */}
      <div className="w-[35%] h-full flex flex-col bg-slate-950">
        <div className="p-4 bg-slate-900/30 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-1">
            Pudding <Sparkles className="w-3 h-3 text-indigo-400" />
          </h3>
          <button 
            onClick={handleClearChat}
            className="text-slate-400 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-900 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Conversation Message Stream*/}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${
                msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-300'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-900 border border-slate-800 text-slate-400 rounded-2xl px-4 py-2.5 text-sm italic animate-pulse">
                Pudding is analyzing your workspace...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Form Box */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-900/20 flex items-center space-x-2">
          <input 
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none"
          />
          <button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl disabled:opacity-50 dynamic-transition">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}