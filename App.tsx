
import React, { useState, useEffect, useRef } from 'react';
import { ModelService } from './services/modelService';
import { ChatMessage, MediaType } from './types';

// --- Streamlit-Exact UI Components ---

const StSidebar: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <aside className="w-[330px] h-screen bg-[#f0f2f6] border-r border-[#e6eaf1] flex flex-col p-8 overflow-y-auto shrink-0 z-20">
    {children}
  </aside>
);

const StWidgetLabel: React.FC<{ label: string }> = ({ label }) => (
  <label className="block text-sm font-semibold text-[#31333f] mb-2">{label}</label>
);

const StSelect: React.FC<{ label: string, value: string, options: string[], onChange: (v: string) => void }> = ({ label, value, options, onChange }) => (
  <div className="mb-6">
    <StWidgetLabel label={label} />
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white border border-[#d1d5db] rounded-md px-3 py-2 text-sm text-[#31333f] focus:outline-none focus:border-[#ff4b4b] focus:ring-1 focus:ring-[#ff4b4b] transition-all shadow-sm cursor-pointer"
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const StSlider: React.FC<{ label: string, min: number, max: number, step: number, value: number, onChange: (v: number) => void }> = ({ label, min, max, step, value, onChange }) => (
  <div className="mb-6">
    <div className="flex justify-between items-center mb-2">
      <StWidgetLabel label={label} />
      <span className="text-xs font-mono text-[#31333f] bg-white px-2 py-0.5 border border-zinc-200 rounded">{value}</span>
    </div>
    <input 
      type="range" min={min} max={max} step={step} value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1 bg-[#d1d5db] rounded-lg appearance-none cursor-pointer accent-[#ff4b4b]"
    />
  </div>
);

const StButton: React.FC<{ label: string, onClick: () => void, disabled?: boolean, primary?: boolean }> = ({ label, onClick, disabled, primary }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-all border ${
      primary 
        ? 'bg-[#ff4b4b] text-white border-[#ff4b4b] hover:bg-[#e63939] active:scale-[0.98]' 
        : 'bg-white text-[#31333f] border-[#d1d5db] hover:border-[#ff4b4b] hover:text-[#ff4b4b]'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}`}
  >
    {label}
  </button>
);

const StTab: React.FC<{ label: string, active: boolean, onClick: () => void }> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all shrink-0 ${
      active ? 'border-[#ff4b4b] text-[#ff4b4b]' : 'border-transparent text-[#31333f]/60 hover:text-[#31333f]'
    }`}
  >
    {label}
  </button>
);

const StAlert: React.FC<{ type: 'info' | 'error' | 'success', children: React.ReactNode }> = ({ type, children }) => {
  const colors = {
    info: 'bg-[#e7f4ff] text-[#0068c9] border-[#0068c9]/20',
    error: 'bg-[#ffe7e7] text-[#ff4b4b] border-[#ff4b4b]/20',
    success: 'bg-[#e7ffe7] text-[#09ab3b] border-[#09ab3b]/20'
  };
  return (
    <div className={`p-4 rounded-lg border ${colors[type]} text-sm leading-relaxed mb-4`}>
      {children}
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MediaType>(MediaType.TEXT);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Streamlit Configuration State
  const [modelProvider, setModelProvider] = useState('Local (Ollama)');
  const [selectedModel, setSelectedModel] = useState('llama3');
  const [temperature, setTemperature] = useState(0.7);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update models when provider changes
  useEffect(() => {
    if (modelProvider.includes('Local')) {
      setSelectedModel('llama3');
    } else {
      setSelectedModel('gemini-3-pro-preview');
    }
  }, [modelProvider]);

  const handleExecute = async () => {
    if (!input.trim() || isGenerating) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsGenerating(true);
    const currentInput = input;
    setInput('');

    try {
      if (activeTab === MediaType.TEXT) {
        const text = await ModelService.generateText(currentInput, modelProvider, selectedModel);
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: text || 'No response generated.',
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, assistantMsg]);
      } 
      else if (activeTab === MediaType.IMAGE) {
        if (modelProvider.includes('Local')) {
          throw new Error("Local Image Generation is not supported in this build. Please switch 'Model Provider' to Cloud for Visual tasks.");
        }
        const imageUrl = await ModelService.generateImage(currentInput, aspectRatio as any);
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Image generated using Cloud Synthesis. Result for: "${currentInput}"`,
          mediaItems: [{
            id: Date.now().toString(),
            type: MediaType.IMAGE,
            content: imageUrl,
            prompt: currentInput,
            status: 'completed',
            timestamp: Date.now(),
            metadata: { aspectRatio }
          }],
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, assistantMsg]);
      }
      else if (activeTab === MediaType.VIDEO) {
        if (modelProvider.includes('Local')) {
          throw new Error("Local Video Generation is not supported. Please switch to Cloud (Gemini/Veo).");
        }
        // @ts-ignore
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          // @ts-ignore
          await window.aistudio.openSelectKey();
        }

        const operation = await ModelService.startVideoGeneration(currentInput, (aspectRatio === '1:1' ? '16:9' : aspectRatio) as any);
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '🎬 Veo Video sequence started. Rendering from Cloud Compute...',
          mediaItems: [{
            id: Date.now().toString(),
            type: MediaType.VIDEO,
            content: '',
            prompt: currentInput,
            status: 'pending',
            timestamp: Date.now(),
            metadata: { operationId: operation.name, aspectRatio: aspectRatio === '1:1' ? '16:9' : aspectRatio }
          }],
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, assistantMsg]);
        pollVideoStatus(assistantMsg.id, operation);
      }
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ System Exception: ${error instanceof Error ? error.message : 'Unknown error.'}`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const pollVideoStatus = async (messageId: string, operation: any) => {
    let currentOp = operation;
    while (!currentOp.done) {
      await new Promise(r => setTimeout(r, 10000));
      try {
        currentOp = await ModelService.checkVideoStatus(currentOp);
      } catch (e) { break; }
    }
    if (currentOp.done && currentOp.response?.generatedVideos?.[0]?.video?.uri) {
      const uri = currentOp.response.generatedVideos[0].video.uri;
      const blob = await ModelService.fetchVideoBlob(uri);
      const url = URL.createObjectURL(blob);
      setMessages(prev => prev.map(msg => msg.id === messageId ? {
        ...msg, mediaItems: msg.mediaItems?.map(item => ({ ...item, status: 'completed', content: url }))
      } : msg));
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white selection:bg-[#ff4b4b]/30">
      {/* Streamlit Sidebar */}
      <StSidebar>
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-[#ff4b4b] rounded flex items-center justify-center">
              <i className="fas fa-cube text-white text-xs"></i>
            </div>
            <h1 className="text-xl font-bold text-[#31333f]">OmniStudio</h1>
          </div>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.15em]">Unified Multimodal Interface</p>
        </div>

        <StSelect 
          label="Model Provider" 
          value={modelProvider} 
          options={['Local (Ollama)', 'Cloud (Google Gemini)']} 
          onChange={setModelProvider} 
        />

        <StSelect 
          label="Base Model Engine" 
          value={selectedModel} 
          options={
            modelProvider.includes('Local') 
            ? ['llama3', 'mistral', 'phi3', 'bakllava'] 
            : ['gemini-3-pro-preview', 'gemini-3-flash-preview']
          } 
          onChange={setSelectedModel} 
        />

        <StSlider 
          label="Temperature" min={0} max={1} step={0.1} value={temperature} 
          onChange={setTemperature} 
        />

        <StSelect 
          label="Visual Aspect Ratio" 
          value={aspectRatio} 
          options={['1:1', '16:9', '9:16']} 
          onChange={setAspectRatio} 
        />

        <div className="mt-auto space-y-3 pt-6 border-t border-[#e6eaf1]">
          {modelProvider.includes('Local') && (
            <div className="bg-blue-50 p-3 rounded text-[10px] text-[#0068c9] font-medium leading-relaxed">
              <i className="fas fa-info-circle mr-1"></i>
              Ensure Ollama is running with OLLAMA_ORIGINS="http://localhost:*"
            </div>
          )}
          <StButton label="Reset Workspace" onClick={() => setMessages([])} />
          <div className="text-[9px] text-zinc-400 text-center uppercase tracking-widest font-bold">
            BUILD 4.5.12-R | STREAMLIT CORE
          </div>
        </div>
      </StSidebar>

      {/* Main Streamlit App Area */}
      <main className="flex-1 flex flex-col bg-white overflow-hidden relative">
        {/* Streamlit Tabs Navigation */}
        <div className="px-12 pt-6 border-b border-[#e6eaf1] flex space-x-4 bg-white/95 backdrop-blur-sm sticky top-0 z-10 overflow-x-auto no-scrollbar">
          <StTab label="Text Logic" active={activeTab === MediaType.TEXT} onClick={() => setActiveTab(MediaType.TEXT)} />
          <StTab label="Image Gen" active={activeTab === MediaType.IMAGE} onClick={() => setActiveTab(MediaType.IMAGE)} />
          <StTab label="Video Motion" active={activeTab === MediaType.VIDEO} onClick={() => setActiveTab(MediaType.VIDEO)} />
        </div>

        {/* Content Flow */}
        <div className="flex-1 overflow-y-auto px-12 py-10 space-y-12 max-w-[900px] mx-auto w-full pb-48">
          {messages.length === 0 && (
            <div className="space-y-6">
              <h1 className="text-4xl font-bold text-[#31333f]">Welcome to OmniStudio</h1>
              <p className="text-[#31333f]/70 text-lg leading-relaxed">
                A high-performance multimodal workspace that bridges local compute power with cloud-scale creative engines.
              </p>
              
              <StAlert type="info">
                <strong>Current Configuration:</strong> {modelProvider} is active using the {selectedModel} model. 
                {modelProvider.includes('Local') ? ' Your data stays on this machine.' : ' Cloud processing enables high-fidelity media synthesis.'}
              </StAlert>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="p-6 bg-[#f0f2f6] rounded-xl border border-transparent hover:border-[#ff4b4b]/30 cursor-pointer transition-all" onClick={() => setInput("Write a python script to analyze a CSV and plot a graph.")}>
                  <p className="text-sm font-bold text-[#31333f] mb-1">Code Assistant</p>
                  <p className="text-xs text-zinc-500">Perfect for local {selectedModel} models.</p>
                </div>
                <div className="p-6 bg-[#f0f2f6] rounded-xl border border-transparent hover:border-[#ff4b4b]/30 cursor-pointer transition-all" onClick={() => { setActiveTab(MediaType.IMAGE); setInput("A cinematic portrait of a cybernetic owl, neon lighting, dark background, 8k"); }}>
                  <p className="text-sm font-bold text-[#31333f] mb-1">Creative Visuals</p>
                  <p className="text-xs text-zinc-500">Requires Cloud Engine toggle.</p>
                </div>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className="space-y-4">
              <div className="flex items-start space-x-5">
                <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center font-bold text-[10px] shadow-sm ${
                  msg.role === 'user' ? 'bg-[#ff4b4b] text-white' : 'bg-[#31333f] text-white'
                }`}>
                  {msg.role === 'user' ? 'USR' : 'AI'}
                </div>
                <div className="flex-1 pt-1">
                  <div className="text-[#31333f] text-sm leading-relaxed whitespace-pre-wrap font-normal">
                    {msg.content}
                  </div>
                </div>
              </div>

              {msg.mediaItems?.map((item) => (
                <div key={item.id} className="ml-[52px] mt-6 bg-[#f0f2f6]/50 border border-[#e6eaf1] rounded-2xl p-2 shadow-sm overflow-hidden">
                  {item.status === 'pending' ? (
                    <div className="flex flex-col items-center py-20 bg-white rounded-xl">
                      <div className="w-48 h-1 bg-[#f0f2f6] rounded-full overflow-hidden mb-4">
                        <div className="h-full bg-[#ff4b4b] animate-st-progress"></div>
                      </div>
                      <p className="text-[10px] font-black text-[#31333f]/40 uppercase tracking-widest">Processing {item.type} via {modelProvider}...</p>
                    </div>
                  ) : item.type === MediaType.IMAGE ? (
                    <div className="bg-white rounded-xl overflow-hidden p-2">
                      <img src={item.content} alt={item.prompt} className="w-full rounded-lg" />
                    </div>
                  ) : item.type === MediaType.VIDEO ? (
                    <div className="bg-black rounded-xl overflow-hidden">
                      <video src={item.content} controls className="w-full" autoPlay loop />
                    </div>
                  ) : null}
                  <div className="px-4 py-3 flex items-center justify-between bg-transparent">
                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter">RENDER_ID: {item.id.slice(-8)}</span>
                    <button className="text-[10px] font-bold text-[#ff4b4b] uppercase hover:underline">
                      <i className="fas fa-file-export mr-1"></i> Save Asset
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="h-px bg-[#f0f2f6] w-full mt-10"></div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Streamlit Chat Input Widget */}
        <div className="absolute bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
          <div className="max-w-[900px] mx-auto pointer-events-auto">
            <div className="bg-white border border-[#d1d5db] rounded-xl shadow-2xl overflow-hidden focus-within:ring-2 focus-within:ring-[#ff4b4b]/20 focus-within:border-[#ff4b4b] transition-all flex items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleExecute();
                  }
                }}
                placeholder={
                  activeTab === MediaType.TEXT ? `Type a message to ${selectedModel}...` : 
                  `Describe the ${activeTab.toLowerCase()} content to generate...`
                }
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-4 px-6 resize-none max-h-48 text-[#31333f] placeholder:text-[#31333f]/30"
                rows={1}
              />
              <div className="p-3">
                <button
                  onClick={handleExecute}
                  disabled={!input.trim() || isGenerating}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                    !input.trim() || isGenerating ? 'bg-zinc-100 text-zinc-300' : 'bg-[#ff4b4b] text-white hover:bg-[#e63939]'
                  }`}
                >
                  {isGenerating ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <i className="fas fa-paper-plane text-sm"></i>
                  )}
                </button>
              </div>
            </div>
            <p className="mt-4 text-[9px] text-center text-[#31333f]/40 font-bold uppercase tracking-widest">
              Powered by {modelProvider} Engine 2025
            </p>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes st-progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-st-progress {
          width: 40%;
          animation: st-progress 1.2s infinite linear;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default App;
