import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare,
  X,
  Mic,
  MicOff,
  Send,
  RefreshCcw,
  Volume2,
  VolumeX,
  Globe
} from 'lucide-react';
import { farmerAPI, batchAPI, stakeholderAPI, transportAPI, paymentAPI } from '../../services/api';
import { assistantTranslations, normalizeVoiceInput } from './AssistantTranslations';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const AssistantWidget = ({ onActionComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState('en');
  const [messages, setMessages] = useState([]);
  const [options, setOptions] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(true);
  const [inputValue, setInputValue] = useState('');
  
  // State Machine Variables
  const [currentFlow, setCurrentFlow] = useState('MENU');
  const [flowStep, setFlowStep] = useState('INIT');
  const [flowData, setFlowData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  
  const translations = assistantTranslations[lang];

  // Initialize Speech Recognition
  useEffect(() => {
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      // Map app language to BCP 47 tags for speech recognition
      const langMap = { 'en': 'en-IN', 'hi': 'hi-IN', 'mr': 'mr-IN' };
      recognitionRef.current.lang = langMap[lang] || 'en-IN';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleTextInput(transcript, true);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [lang]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, options]);

  // Initialize bot when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      resetConversation();
    }
  }, [isOpen]);

  const speakText = useCallback((text) => {
    if (!isSpeaking || !('speechSynthesis' in window)) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    // Rough language mapping for TTS voices if available
    const langMap = { 'en': 'en-IN', 'hi': 'hi-IN', 'mr': 'mr-IN' };
    utterance.lang = langMap[lang] || 'en-IN';
    
    // For Hindi/Marathi, try to find a local voice
    const voices = window.speechSynthesis.getVoices();
    if (lang === 'hi' || lang === 'mr') {
      const indianVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('IN'));
      if (indianVoice) utterance.voice = indianVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  }, [isSpeaking, lang]);

  const addMessage = (text, sender = 'bot') => {
    setMessages(prev => [...prev, { text, sender, id: Date.now() + Math.random() }]);
    if (sender === 'bot') {
      speakText(text);
    }
  };

  const setBotState = (text, opts) => {
    addMessage(text, 'bot');
    setOptions(opts || []);
  };

  const resetConversation = () => {
    setMessages([]);
    setCurrentFlow('MENU');
    setFlowStep('INIT');
    setFlowData({});
    setBotState(translations.greeting, [
      { label: translations.options_menu.create_batch, value: 'CREATE_BATCH' },
      { label: translations.options_menu.request_transport, value: 'REQUEST_TRANSPORT' },
      { label: translations.options_menu.view_batches, value: 'VIEW_BATCHES' },
      { label: translations.options_menu.payment_status, value: 'PAYMENT_STATUS' }
    ]);
  };

  const handleOptionSelect = (option) => {
    const { label, value } = option;
    addMessage(label, 'user');
    setOptions([]); // clear options while processing
    processUserInput(value, label);
  };

  const handleTextInput = (text, isVoice = false) => {
    if (!text.trim()) return;
    
    addMessage(text, 'user');
    setOptions([]);
    setInputValue('');
    
    let processedValue = text;
    if (isVoice) {
      processedValue = normalizeVoiceInput(text);
      console.log(`Voice input normalized: "${text}" -> "${processedValue}"`);
    }

    // Attempt to match input value to current options
    let matchedOption = null;
    if (options.length > 0) {
      // Direct exact match
      matchedOption = options.find(o => 
        o.value.toString().toLowerCase() === processedValue.toLowerCase() || 
        o.label.toLowerCase() === processedValue.toLowerCase()
      );
      
      // If no exact match and it's voice/typing, try partial inclusion match
      if (!matchedOption) {
        matchedOption = options.find(o => 
          o.label.toLowerCase().includes(processedValue.toLowerCase()) ||
          processedValue.toLowerCase().includes(o.label.toLowerCase())
        );
      }
    }

    if (matchedOption) {
      processUserInput(matchedOption.value, matchedOption.label);
    } else {
      // Free text fallback
      processUserInput(processedValue, text);
    }
  };

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error("Speech recognition error", e);
      }
    }
  };

  // --------------------------------------------------------------------------
  // DECISION ENGINE
  // --------------------------------------------------------------------------
  
  const processUserInput = async (value, rawLabel) => {
    if (currentFlow === 'MENU') {
      handleMenuSelection(value);
      return;
    }

    if (currentFlow === 'CREATE_BATCH') {
      await handleCreateBatchFlow(value, rawLabel);
      return;
    }

    if (currentFlow === 'REQUEST_TRANSPORT') {
      await handleTransportFlow(value, rawLabel);
      return;
    }

    // Default fallback if confused
    addMessage(translations.common.not_understood, 'bot');
    resetConversation();
  };

  const handleMenuSelection = async (selection) => {
    if (selection === 'CREATE_BATCH') {
      setCurrentFlow('CREATE_BATCH');
      setFlowStep('CROP');
      setIsLoading(true);
      addMessage(translations.common.fetching_data, 'bot');
      try {
        const res = await farmerAPI.getAllCrops();
        const crops = res.data;
        const cropOpts = crops.map(c => ({ label: c, value: c }));
        setBotState(translations.create_batch.ask_crop, cropOpts);
      } catch (e) {
        setBotState(translations.create_batch.error, []);
        resetConversation();
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (selection === 'REQUEST_TRANSPORT') {
      setCurrentFlow('REQUEST_TRANSPORT');
      setFlowStep('BATCH');
      setIsLoading(true);
      try {
        const res = await batchAPI.list();
        // Filter only parent batches that belong to farmer and are not locked
        const eligibleBatches = res.data.filter(b => !b.is_child_batch && !b.is_locked);
        if (eligibleBatches.length === 0) {
          setBotState("You have no eligible batches for transport right now.", []);
          resetConversation();
          return;
        }
        const bOpts = eligibleBatches.map(b => ({
          label: `${b.product_batch_id} (${b.crop_type})`,
          value: b.id
        }));
        setBotState(translations.request_transport.ask_batch, bOpts);
      } catch (e) {
        setBotState(translations.request_transport.error, []);
        resetConversation();
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (selection === 'VIEW_BATCHES') {
      setIsLoading(true);
      try {
        const res = await batchAPI.list();
        const active = res.data.filter(b => b.status !== 'SUSPENDED');
        setBotState(`You have ${active.length} active batches. Check the main dashboard for details.`, []);
      } catch (e) {
        addMessage("Failed to fetch batches.", 'bot');
      } finally {
        setIsLoading(false);
        setTimeout(resetConversation, 3000);
      }
      return;
    }

    if (selection === 'PAYMENT_STATUS') {
      setIsLoading(true);
      try {
        const res = await paymentAPI.getSummary();
        const pending = res.data.pending_count || 0;
        const revenue = res.data.total_revenue || 0;
        setBotState(`You have ${pending} pending payments. Total revenue is ₹${revenue}.`, []);
      } catch (e) {
        addMessage("Failed to fetch payment status.", 'bot');
      } finally {
        setIsLoading(false);
        setTimeout(resetConversation, 4000);
      }
      return;
    }

    addMessage(translations.common.not_understood, 'bot');
    resetConversation();
  };

  const handleCreateBatchFlow = async (value, rawLabel) => {
    switch (flowStep) {
      case 'CROP':
        setFlowData({ ...flowData, crop_type: value });
        setFlowStep('QUANTITY');
        setBotState(translations.create_batch.ask_quantity, [
          { label: '50 kg', value: '50' },
          { label: '100 kg', value: '100' },
          { label: '500 kg', value: '500' },
          { label: '1000 kg', value: '1000' }
        ]);
        break;
      
      case 'QUANTITY':
        // Ensure numbers only
        const qty = value.toString().replace(/[^0-9]/g, '');
        if (!qty) {
          setBotState(translations.common.not_understood, [
            { label: '50 kg', value: '50' },
            { label: '100 kg', value: '100' }
          ]);
          return;
        }
        setFlowData({ ...flowData, quantity: qty });
        setFlowStep('DATE');
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        setBotState(translations.create_batch.ask_date, [
          { label: 'Today', value: today },
          { label: 'Yesterday', value: yesterday }
        ]);
        break;

      case 'DATE':
        let selectedDate = value;
        if (value.toLowerCase() === 'today' || value === 'आज') {
          selectedDate = new Date().toISOString().split('T')[0];
        } else if (value.toLowerCase() === 'yesterday' || value === 'कल') {
          selectedDate = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        }
        
        // Attempt Date parsing backup
        if (isNaN(new Date(selectedDate).getTime())) {
          selectedDate = new Date().toISOString().split('T')[0]; // Default to today
        }
        
        setFlowData({ ...flowData, harvest_date: selectedDate });
        setFlowStep('PRICE');
        setBotState(translations.create_batch.ask_price, [
          { label: '₹20 / kg', value: '20' },
          { label: '₹40 / kg', value: '40' },
          { label: '₹60 / kg', value: '60' },
          { label: '₹100 / kg', value: '100' }
        ]);
        break;
      
      case 'PRICE':
        const price = value.toString().replace(/[^0-9]/g, '');
        if (!price) {
          setBotState(translations.common.not_understood, [
             { label: '₹40 / kg', value: '40' }
          ]);
          return;
        }
        const newData = { ...flowData, farmer_base_price_per_unit: price };
        setFlowData(newData);
        setFlowStep('CONFIRM');
        const summary = `${translations.create_batch.confirm}\n- Crop: ${newData.crop_type}\n- Qty: ${newData.quantity} kg\n- Price: ₹${newData.farmer_base_price_per_unit}/kg`;
        setBotState(summary, [
          { label: translations.common.confirm, value: 'YES' },
          { label: translations.common.cancel, value: 'NO' }
        ]);
        break;

      case 'CONFIRM':
        if (value === 'YES' || value.toLowerCase() === 'yes' || value.toLowerCase() === 'हाँ') {
          setIsLoading(true);
          try {
            await batchAPI.create(flowData);
            setBotState(translations.create_batch.success, []);
            if (onActionComplete) onActionComplete();
          } catch (e) {
            setBotState(translations.create_batch.error, []);
          } finally {
            setIsLoading(false);
            setTimeout(resetConversation, 3000);
          }
        } else {
          resetConversation();
        }
        break;
      
      default:
        resetConversation();
    }
  };

  const handleTransportFlow = async (value, rawLabel) => {
    switch (flowStep) {
      case 'BATCH':
        setFlowData({ ...flowData, batch_id: value });
        setFlowStep('DISTRIBUTOR');
        setIsLoading(true);
        try {
          const res = await stakeholderAPI.listProfiles();
          const dists = res.data.filter(p => p.role === 'distributor');
          if (dists.length === 0) {
            setBotState("No distributors available.", []);
            resetConversation();
            return;
          }
          const dOpts = dists.map(d => ({
            label: d.organization || d.user_details?.username || `Distributor ${d.id}`,
            value: d.id
          }));
          setBotState(translations.request_transport.ask_distributor, dOpts);
        } catch (e) {
           setBotState(translations.request_transport.error, []);
           resetConversation();
        } finally {
          setIsLoading(false);
        }
        break;
      
      case 'DISTRIBUTOR':
        setFlowData({ ...flowData, distributor_id: value });
        setFlowStep('CONFIRM');
        setBotState(`Confirm transport request to Distributor?`, [
          { label: translations.common.confirm, value: 'YES' },
          { label: translations.common.cancel, value: 'NO' }
        ]);
        break;

      case 'CONFIRM':
        if (value === 'YES' || value.toLowerCase() === 'yes' || value.toLowerCase() === 'हाँ') {
          setIsLoading(true);
          try {
            await transportAPI.createRequest(flowData);
            setBotState(translations.request_transport.success, []);
            if (onActionComplete) onActionComplete();
          } catch (e) {
            setBotState(translations.request_transport.error, []);
          } finally {
            setIsLoading(false);
            setTimeout(resetConversation, 3000);
          }
        } else {
          resetConversation();
        }
        break;
    }
  }

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-green-600 text-white rounded-full shadow-xl hover:bg-green-700 transition-all z-50 flex items-center gap-2 group"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="hidden group-hover:block font-medium px-2">Assistant</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 md:w-96 bg-white dark:bg-cosmos-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-cosmos-700 flex flex-col z-50 overflow-hidden" style={{ height: '600px', maxHeight: '80vh' }}>
      
      {/* Header */}
      <div className="bg-green-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <h3 className="font-semibold">AgriChain Assistant</h3>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              const langs = ['en', 'hi', 'mr'];
              setLang(langs[(langs.indexOf(lang) + 1) % langs.length]);
            }}
            className="text-white/80 hover:text-white flex items-center gap-1 text-xs"
            title="Switch Language"
          >
            <Globe className="w-4 h-4" />
            {lang.toUpperCase()}
          </button>
          <button 
            onClick={() => setIsSpeaking(!isSpeaking)}
            className="text-white/80 hover:text-white"
            title={isSpeaking ? "Mute Bot" : "Unmute Bot"}
          >
            {isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button onClick={resetConversation} className="text-white/80 hover:text-white" title="Restart">
            <RefreshCcw className="w-4 h-4" />
          </button>
          <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white ml-2">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-cosmos-900/50">
        {messages.map((msg, i) => (
          <div key={msg.id || i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                msg.sender === 'user' 
                  ? 'bg-green-600 text-white rounded-br-none' 
                  : 'bg-white dark:bg-cosmos-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-cosmos-700 rounded-bl-none shadow-sm'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white dark:bg-cosmos-800 border border-gray-100 dark:border-cosmos-700 rounded-2xl rounded-bl-none px-4 py-2 animate-pulse">
               <div className="flex gap-1">
                 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
               </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Options Area (Dynamic Buttons) */}
      {options.length > 0 && !isLoading && (
        <div className="p-3 bg-white dark:bg-cosmos-800 border-t border-gray-100 dark:border-cosmos-700 flex flex-wrap gap-2 max-h-48 overflow-y-auto">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleOptionSelect(opt)}
              className="px-3 py-1.5 text-sm bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-xl transition-colors whitespace-nowrap"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 bg-white dark:bg-cosmos-800 border-t border-gray-100 dark:border-cosmos-700 flex items-center gap-2">
        {SpeechRecognition && (
          <button
            onClick={toggleListen}
            className={`p-2 rounded-full transition-colors ${
              isListening 
                ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-cosmos-700 dark:text-gray-300'
            }`}
          >
            {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
        )}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleTextInput(inputValue);
          }}
          placeholder={isListening ? "Listening..." : "Type or speak..."}
          className="flex-1 bg-gray-50 dark:bg-cosmos-900 border border-gray-200 dark:border-cosmos-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-green-500 dark:text-white"
          disabled={isLoading}
        />
        <button
          onClick={() => handleTextInput(inputValue)}
          disabled={!inputValue.trim() || isLoading}
          className="p-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

export default AssistantWidget;
