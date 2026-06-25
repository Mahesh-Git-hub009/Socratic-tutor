import React, { usestate } from 'react';
import { Terminal, Send, Code, Sparkles } from 'lucide-react';

export default function App() {
  // state for Fronted Inputs
  const [language, setLanguage] = useState('cpp');
  const [code,setCode] = usestate('// paste your broken code here\n#include <iostream>\nusing namespace std;\n\nint main() {\n int arr[5] = {1, 2, 3, 4, 5};\n   for(int i=0; i <=5; i++) {\n       cout << arr[i] <<" ";\n   }\n  }\n   return 0;\n}');
  const [problemStatment, setProblemStatment] = useState('My array is printing weird numbers atthe end or crashing.');
  const [compileError, setCompileError] = useState('Segmentation fault or garbage value printed at the end.');

  // stste for chat System
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {role: 'assistant', content: 'Hi! I'm socratic tutor, your coding assistant.Paste your problem on the left, then send me a message here to start working through it together!" }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setmessages] = useState([
      {role : 'assistant , content : ``Hi!