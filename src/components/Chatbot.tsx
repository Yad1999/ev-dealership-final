import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { GoogleGenerativeAI, ChatSession } from '@google/generative-ai';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      text: "Hi there! I'm your 24/7 VoltMarket assistant. How can I help you today?",
      sender: 'assistant',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Persist the Gemini ChatSession
  const chatSessionRef = useRef<ChatSession | null>(null);

  // Initialize Chat Session on mount
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("No VITE_GEMINI_API_KEY found.");
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-3.5-flash-lite",
        systemInstruction: "You are the official VoltMarket Virtual Assistant. You help customers find electric vehicles, understand charging options (like CCS, NACS), and locate deals. Keep your answers relatively concise, friendly, and helpful. You are a 24/7 AI."
      });
      chatSessionRef.current = model.startChat({
        history: [],
      });
    } catch (e) {
      console.error("Failed to initialize Gemini:", e);
    }
  }, []);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      if (!chatSessionRef.current) {
        throw new Error("Chat session not initialized");
      }
      
      const result = await chatSessionRef.current.sendMessage(userText);
      const responseText = result.response.text();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error("Error communicating with Gemini:", err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Error connecting to AI: ${err.message || 'Unknown error'}. Please check your API key and ensure you restarted your dev server.`,
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 z-[999] w-14 h-14 rounded-full bg-[#68E371] hover:bg-[#52c95b] text-[#050C13] flex items-center justify-center shadow-[0_0_20px_rgba(104,227,113,0.3)] transition-all duration-300 transform hover:scale-105 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 z-[999] w-[350px] max-w-[calc(100vw-3rem)] bg-[#0A121A] border border-[#1a2634] rounded-2xl shadow-[0_0_40px_rgba(104,227,113,0.15)] flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}
        style={{ height: '500px', maxHeight: 'calc(100vh - 6rem)' }}
      >
        {/* Header */}
        <div className="bg-[#040A11] border-b border-[#1a2634] p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#68E371] to-[#00C2CE] flex items-center justify-center">
              <Bot className="w-4 h-4 text-[#050C13] fill-[#050C13]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#F6F9FC] font-['Space_Grotesk']">VoltMarket Assistant</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#68E371] animate-pulse"></span>
                <span className="text-xs text-[#8D9CAE]">Powered by Gemini</span>
              </div>
            </div>
          </div>
          <button 
            onClick={toggleChat}
            className="text-[#8D9CAE] hover:text-[#F6F9FC] transition-colors p-1"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message History Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0A121A]">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center ${msg.sender === 'user' ? 'bg-[#14202D]' : 'bg-[#1a2634]'}`}>
                  {msg.sender === 'user' ? (
                    <User className="w-4 h-4 text-[#8D9CAE]" />
                  ) : (
                    <Bot className="w-4 h-4 text-[#68E371]" />
                  )}
                </div>
                
                {/* Bubble */}
                <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-[#68E371] text-[#050C13] rounded-tr-sm' 
                    : 'bg-[#14202D] text-[#F6F9FC] border border-[#1a2634] rounded-tl-sm'
                }`}>
                  {msg.text}
                  <div className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-[#050C13]/70' : 'text-[#5A6E85]'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[85%] flex-row">
                <div className="w-8 h-8 flex-shrink-0 rounded-full bg-[#1a2634] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-[#68E371]" />
                </div>
                <div className="p-4 rounded-2xl rounded-tl-sm bg-[#14202D] border border-[#1a2634] flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8D9CAE] animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8D9CAE] animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8D9CAE] animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-[#040A11] border-t border-[#1a2634]">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isTyping}
              className="flex-1 bg-[#14202D] border border-[#1a2634] text-sm text-[#F6F9FC] placeholder-[#5A6E85] rounded-xl px-4 py-3 focus:outline-none focus:border-[#68E371] transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="bg-[#68E371] hover:bg-[#52c95b] disabled:bg-[#1a2634] disabled:text-[#5A6E85] text-[#050C13] p-3 rounded-xl transition-colors flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
