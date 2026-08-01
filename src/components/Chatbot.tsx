import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { GoogleGenerativeAI, ChatSession, SchemaType, type FunctionDeclaration } from '@google/generative-ai';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

// Function declaration for Open Charge Map charger finder
const findChargersDeclaration: FunctionDeclaration = {
  name: "findChargersNearLocation",
  description: "Find real electric vehicle (EV) charging stations near a given city, province/state, address, or postal code using the website's Open Charge Map integration.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      location: {
        type: SchemaType.STRING,
        description: "The city name, state/province, postal/zip code, or address to find EV chargers for (e.g. 'Toronto', 'New York', 'Montreal', 'San Francisco', 'M5J 3A5', '94105').",
      },
      radiusKm: {
        type: SchemaType.NUMBER,
        description: "Optional search radius in kilometers (default: 30km).",
      },
    },
    required: ["location"],
  },
};

// Helper to geocode and fetch live Open Charge Map stations
async function searchChargersHelper(location: string, radiusKm: number = 30) {
  const apiKey = import.meta.env.VITE_OPENCHARGEMAP_API_KEY;
  try {
    // 1. Geocode location with OpenStreetMap Nominatim
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location.trim())}`
    );
    const geoData = await geoRes.json();

    if (!geoData || geoData.length === 0) {
      return {
        success: false,
        location,
        message: `Could not determine geographic coordinates for "${location}". Please provide a recognized city, postal code, or address.`
      };
    }

    const lat = parseFloat(geoData[0].lat);
    const lng = parseFloat(geoData[0].lon);
    const resolvedName = geoData[0].display_name.split(',').slice(0, 2).join(', ');

    // 2. Query Open Charge Map API
    const ocmUrl = apiKey
      ? `https://api.openchargemap.io/v3/poi/?output=json&latitude=${lat}&longitude=${lng}&distance=${radiusKm}&distanceunit=KM&maxresults=5&key=${apiKey}`
      : `https://api.openchargemap.io/v3/poi/?output=json&latitude=${lat}&longitude=${lng}&distance=${radiusKm}&distanceunit=KM&maxresults=5`;

    const ocmRes = await fetch(ocmUrl);
    if (!ocmRes.ok) {
      throw new Error(`Open Charge Map API returned status ${ocmRes.status}`);
    }

    const data = await ocmRes.json();
    if (!data || !Array.isArray(data) || data.length === 0) {
      return {
        success: true,
        location: resolvedName,
        chargersCount: 0,
        message: `No public EV chargers found within ${radiusKm}km of ${resolvedName}.`
      };
    }

    const stations = data.slice(0, 4).map((item: any) => ({
      name: item.AddressInfo?.Title || 'EV Charging Station',
      address: item.AddressInfo?.AddressLine1 || 'Address not listed',
      town: item.AddressInfo?.Town || '',
      stateOrProvince: item.AddressInfo?.StateOrProvince || '',
      distanceKm: item.AddressInfo?.Distance ? parseFloat(item.AddressInfo.Distance.toFixed(1)) : undefined,
      connectors: (item.Connections || []).map((conn: any) => ({
        type: conn.ConnectionType?.Title || 'Standard Connector',
        powerKW: conn.PowerKW ? `${conn.PowerKW} kW` : 'Standard Speed',
        level: conn.Level?.Title || ''
      }))
    }));

    return {
      success: true,
      location: resolvedName,
      chargersCount: stations.length,
      searchRadiusKm: radiusKm,
      stations
    };
  } catch (err: any) {
    console.error("Error in searchChargersHelper:", err);
    return {
      success: false,
      location,
      error: err.message || "Failed to retrieve charging stations."
    };
  }
}

function FormattedMessage({ content }: { content: string }) {
  const lines = content.split('\n');

  return (
    <div className="space-y-1.5 leading-relaxed text-sm">
      {lines.map((line, lineIndex) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={lineIndex} className="h-1" />;
        }

        // Check if line is a list/bullet item
        const isBullet = /^[\*\-\•]\s+/.test(trimmed) || /^\d+[\.\)]\s+/.test(trimmed);
        const cleanLine = trimmed
          .replace(/^#+\s*/, '') // remove markdown header hashes
          .replace(/^[\*\-\•]\s+/, '') // remove bullet chars
          .replace(/^\d+[\.\)]\s+/, ''); // remove numbered list prefix

        // Helper to format inline bold text (**text** or *text*)
        const formatInline = (text: string) => {
          const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
          return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
              return (
                <strong key={i} className="font-semibold text-[#68E371]">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
              return (
                <span key={i} className="font-medium text-[#F6F9FC]">
                  {part.slice(1, -1)}
                </span>
              );
            }
            return part;
          });
        };

        if (isBullet) {
          return (
            <div key={lineIndex} className="flex items-start gap-2 pl-1 py-0.5">
              <span className="text-[#68E371] text-xs mt-0.5 select-none shrink-0">⚡</span>
              <div className="flex-1">{formatInline(cleanLine)}</div>
            </div>
          );
        }

        return <p key={lineIndex}>{formatInline(trimmed)}</p>;
      })}
    </div>
  );
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      text: "👋 Hi there! I'm your 24/7 BatteriVolt assistant ⚡. How can I help you find your dream electric vehicle or locate nearby EV chargers today? 🚗🔌",
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
        systemInstruction: `You are the friendly, knowledgeable BatteriVolt Virtual Assistant ⚡. 
You help customers find electric vehicles 🚗, locate live electric vehicle charging stations (CCS, NACS, Level 2) 🔌, explore deals 🏷️, and learn about sustainable electric mobility 🌱.

Tool Calling for EV Chargers:
- Whenever a user asks for chargers, charging stations, plugs, or places to charge near a city, town, zip/postal code, or address, ALWAYS call the findChargersNearLocation tool.
- Summarize the found charging stations with station name 📍, address, plug types & speeds 🔌, and approximate distance.
- Mention to the user that they can also check the interactive Volt Chargers map section right on our website!

Communication & Formatting Guidelines:
- Write in a friendly, conversational tone with warmth.
- Use helpful emojis (⚡, 🚗, 🔋, 🔌, 📍, 💡, ✨, 🏷️, 👍, 🏁) naturally to make messages easy and pleasant to read.
- Do NOT use raw markdown formatting like asterisks (* or **), hashes (###), or slashes (/) for bullets. Use emojis and natural paragraphs instead.
- Keep answers concise, helpful, and scannable.
- You are a 24/7 AI ready to help anytime!`,
        tools: [{ functionDeclarations: [findChargersDeclaration] }]
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
      
      let result = await chatSessionRef.current.sendMessage(userText);
      let functionCalls = result.response.functionCalls();

      // Process any function call requests from Gemini (e.g. Open Charge Map lookup)
      while (functionCalls && functionCalls.length > 0) {
        const call = functionCalls[0];
        if (call.name === "findChargersNearLocation") {
          const args = call.args as { location: string; radiusKm?: number };
          const chargerData = await searchChargersHelper(args.location, args.radiusKm || 30);
          
          result = await chatSessionRef.current.sendMessage([
            {
              functionResponse: {
                name: "findChargersNearLocation",
                response: chargerData,
              },
            },
          ]);
          functionCalls = result.response.functionCalls();
        } else {
          break;
        }
      }

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
              <h3 className="font-bold text-sm text-[#F6F9FC] font-['Space_Grotesk']">BatteriVolt Assistant</h3>
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
                <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-[#68E371] text-[#050C13] rounded-tr-sm font-medium' 
                    : 'bg-[#14202D] text-[#F6F9FC] border border-[#1a2634] rounded-tl-sm shadow-sm'
                }`}>
                  {msg.sender === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <FormattedMessage content={msg.text} />
                  )}
                  <div className={`text-[10px] mt-1.5 text-right ${msg.sender === 'user' ? 'text-[#050C13]/70' : 'text-[#5A6E85]'}`}>
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
