import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Send, Code, Sparkles } from 'lucide-react';

export default function App() {
  // state for Fronted Inputs
  const [language, setLanguage] = useState('cpp');
  const [code,setCode] = useState('// paste your broken code here\n#include <iostream>\nusing namespace std;\n\nint main() {\n int arr[5] = {1, 2, 3, 4, 5};\n   for(int i=0; i <=5; i++) {\n       cout << arr[i] <<" ";\n   }\n  }\n   return 0;\n}');
  const [problemStatment, setProblemStatment] = useState('My array is printing weird numbers atthe end or crashing.');
  const [compileError, setCompileError] = useState('Segmentation fault or garbage value printed at the end.');

  // stste for chat System
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {role: 'assistant', content: "Hi! I'm sage, your coding tutor. Paste your problem content on the left , then send me a message here to start working through it together!" } 
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    const handleSendMessage = async (e) => {
      e.preventDefault();
      if (!inputMessage.trim() || isLoading) return;

      const userNewmessage = inputMessage.trim();
      setInputMessage('');

      setMessages(prev => [...prev, { role : 'user', content: userNewMessage }]);
      setIsLoading(true);

      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `I see you are working with ${language.toUpperCase()} and hitting a boundary issue. Before looking at the values, let's inspect your loop definition: "for(int i =0; i<=5; i++)".If an array has a size of 5, what are its valid index positions? Let's count them out.`
         }]);
         setIsLoading(false);
        }, 1000);
      };


      return (
        <div className="flex h-screen w-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
          
          {/* LEFT PANEL: Workspace Layout */}
          <div className="w-1/2 h-full flex flex-col border-r border-slate-800 p-4 space-y-4 bg-slate-900/40">
            <div className="flex items-centerjustify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-semibold text-slate-200">Integrated Sandbox</h2>
              </div>
            </div>

            
          </div>
        </div>
      )