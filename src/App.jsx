import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, RotateCcw, Gamepad2, BookOpen, Coffee, Save, History, Trophy, AlertCircle, X, CheckCircle2, Download, Upload, Settings, Target, Maximize2, Minimize2, AlertTriangle, Sparkles, BrainCircuit, Server, Cpu, RefreshCw, List, Send, Smile, Search, Filter, MessageCircle, ChevronDown } from 'lucide-react';

// --- Utility Functions ---
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const getTodayDateString = () => {
  const date = new Date();
  return date.toISOString().split('T')[0];
};

const getYesterdayDateString = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
};

const getStageInfo = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const TARGET_YEAR = 2026; 

  if (month === 11 || month === 12) {
    if (year === TARGET_YEAR - 1) {
      return { name: "全真模拟演练期", desc: "心态调整 / 考场适应", targetHours: 6, color: "text-blue-400", borderColor: "border-blue-500" };
    } else {
       return { name: "终极冲刺期", desc: "背水一战 / 回归基础", targetHours: 11, color: "text-red-500", borderColor: "border-red-500" };
    }
  } else if (month >= 1 && month <= 6) {
    return { name: "基础夯实期", desc: "地毯式复习 / 英语单词", targetHours: 7, color: "text-emerald-400", borderColor: "border-emerald-500" };
  } else if (month >= 7 && month <= 9) {
    return { name: "强化提升期", desc: "海量刷题 / 攻克难点", targetHours: 9, color: "text-yellow-400", borderColor: "border-yellow-500" };
  } else {
    return { name: "真题实战期", desc: "真题模拟 / 查缺", targetHours: 10, color: "text-orange-400", borderColor: "border-orange-500" };
  }
};

// --- API Presets ---
const API_PROVIDERS = [
  { id: 'siliconflow', name: '硅基流动 (SiliconFlow)', url: 'https://api.siliconflow.cn/v1', defaultModel: 'deepseek-ai/DeepSeek-R1' },
  { id: 'deepseek', name: 'DeepSeek 官方', url: 'https://api.deepseek.com/v1', defaultModel: 'deepseek-chat' },
  { id: 'moonshot', name: '月之暗面 (Kimi)', url: 'https://api.moonshot.cn/v1', defaultModel: 'moonshot-v1-8k' },
  { id: 'aliyun', name: '阿里云 (通义千问)', url: 'https://dashscope.aliyuncs.com/compatible-mode/v1', defaultModel: 'qwen-turbo' },
  { id: 'openai', name: 'OpenAI (需要梯子)', url: 'https://api.openai.com/v1', defaultModel: 'gpt-4o' },
  { id: 'custom', name: '自定义 (Custom)', url: '', defaultModel: '' }
];

const COMMON_EMOJIS = ['👍', '🔥', '💪', '😭', '🙏', '🎉', '🤔', '💤', '📚', '☕️', '🤖', '👻'];

// --- Main Component ---
export default function LevelUpApp() {
  const [loading, setLoading] = useState(true);
  
  // Timer State
  const [mode, setMode] = useState('focus'); 
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isActive, setIsActive] = useState(false);
  const [initialTime, setInitialTime] = useState(45 * 60);
  const [stage, setStage] = useState(getStageInfo());
  const [isZen, setIsZen] = useState(false);
  
  // Data State
  const [todayStats, setTodayStats] = useState({ studyMinutes: 0, gameBank: 0, gameUsed: 0, logs: [] });
  const [history, setHistory] = useState([]);
  
  // AI Settings
  const [apiKey, setApiKey] = useState(''); 
  const [apiBaseUrl, setApiBaseUrl] = useState('https://api.siliconflow.cn/v1'); 
  const [apiModel, setApiModel] = useState('deepseek-ai/DeepSeek-R1');
  const [selectedProvider, setSelectedProvider] = useState('siliconflow');
  
  // Model Discovery & UI
  const [availableModels, setAvailableModels] = useState([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [isModelListOpen, setIsModelListOpen] = useState(false);
  const [modelSearch, setModelSearch] = useState('');
  
  // Chat State
  const [chatMessages, setChatMessages] = useState([]); 
  const [chatInput, setChatInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const chatEndRef = useRef(null);

  // UI State
  const [showLogModal, setShowLogModal] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false); 
  const [logContent, setLogContent] = useState('');
  const [pendingStudyTime, setPendingStudyTime] = useState(0); 
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const fileInputRef = useRef(null);
  const timerRef = useRef(null);
  const appContainerRef = useRef(null);

  // --- LocalStorage Logic ---
  const loadData = () => {
    try {
      const todayStr = getTodayDateString();
      const storedHistory = JSON.parse(localStorage.getItem('levelup_history') || '[]');
      const storedKey = localStorage.getItem('ai_api_key') || '';
      const storedBaseUrl = localStorage.getItem('ai_base_url') || 'https://api.siliconflow.cn/v1';
      const storedModel = localStorage.getItem('ai_model') || 'deepseek-ai/DeepSeek-R1';
      const storedProvider = localStorage.getItem('ai_provider') || 'siliconflow';
      const storedModelList = JSON.parse(localStorage.getItem('ai_model_list') || '[]');
      
      setHistory(storedHistory);
      setApiKey(storedKey);
      setApiBaseUrl(storedBaseUrl);
      setApiModel(storedModel);
      setSelectedProvider(storedProvider);
      setAvailableModels(storedModelList);

      const todayData = storedHistory.find(d => d.date === todayStr);
      if (todayData) {
        setTodayStats(todayData);
      } else {
        let lastBank = 0;
        if (storedHistory.length > 0) lastBank = storedHistory[0].gameBank;
        setTodayStats({ date: todayStr, studyMinutes: 0, gameBank: lastBank > 0 ? lastBank : 0, gameUsed: 0, logs: [] });
      }
    } catch (e) { console.error("Load Error", e); }
    setLoading(false);
  };

  const saveData = (newTodayStats) => {
    try {
      const todayStr = getTodayDateString();
      let storedHistory = JSON.parse(localStorage.getItem('levelup_history') || '[]');
      storedHistory = storedHistory.filter(d => d.date !== todayStr);
      storedHistory.unshift(newTodayStats);
      storedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
      localStorage.setItem('levelup_history', JSON.stringify(storedHistory));
      setTodayStats(newTodayStats);
      setHistory(storedHistory);
    } catch (e) { console.error("Save Error", e); }
  };

  const saveAISettings = (key, baseUrl, model, provider, modelList = availableModels) => {
    setApiKey(key); setApiBaseUrl(baseUrl); setApiModel(model); setSelectedProvider(provider); setAvailableModels(modelList);
    localStorage.setItem('ai_api_key', key);
    localStorage.setItem('ai_base_url', baseUrl);
    localStorage.setItem('ai_model', model);
    localStorage.setItem('ai_provider', provider);
    localStorage.setItem('ai_model_list', JSON.stringify(modelList));
  };

  useEffect(() => { loadData(); }, []);
  
  useEffect(() => { 
    if (showChatModal) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, showChatModal]);

  // --- Timer Logic ---
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => { setTimeLeft((prev) => prev - 1); }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleTimerComplete();
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  // --- Fullscreen Listener ---
  useEffect(() => {
    const handleFsChange = () => { setIsFullscreen(!!document.fullscreenElement); };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // --- AI & Chat Logic ---
  const fetchAvailableModels = async () => {
    if (!apiKey) return alert("请先输入 API Key！");
    setIsFetchingModels(true);
    try {
      const cleanBaseUrl = apiBaseUrl.replace(/\/$/, '');
      const response = await fetch(`${cleanBaseUrl}/models`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      if (data.data && Array.isArray(data.data)) {
        const models = data.data.map(m => m.id).sort();
        setAvailableModels(models);
        saveAISettings(apiKey, apiBaseUrl, apiModel, selectedProvider, models);
        setIsModelListOpen(true); 
      } else {
        alert("获取成功，但返回格式无法解析。");
      }
    } catch (error) {
      alert(`获取失败: ${error.message}`);
    } finally {
      setIsFetchingModels(false);
    }
  };

  const sendToAI = async (newMessages) => {
    setAiThinking(true);
    try {
      const cleanBaseUrl = apiBaseUrl.replace(/\/$/, '');
      const endpoint = `${cleanBaseUrl}/chat/completions`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: apiModel,
          messages: newMessages,
          temperature: 0.7,
          stream: false
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || JSON.stringify(data));

      if (data.choices && data.choices.length > 0) {
        const reply = data.choices[0].message.content;
        setChatMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      }
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: `⚠️ 连接失败: ${error.message}` }]);
    } finally {
      setAiThinking(false);
    }
  };

  const startAICoach = () => {
    if (!apiKey) {
      alert("请先在设置中输入 API Key！");
      setShowSettings(true);
      return;
    }
    setShowChatModal(true);
    
    if (chatMessages.length === 0) {
      const yesterdayStr = getYesterdayDateString();
      const yesterdayData = history.find(d => d.date === yesterdayStr);
      
      let systemContext = `你是一位幽默、有时严厉但内心温暖的二次元风格考研导师。你的学生正在备考上海交大/中科大AI硕士（目标2026年）。
      如果学生发表情包，你也请回复表情包。请用对话的形式与学生交流，不要一次性发长篇大论，要引导学生回复。
      
      昨天（${yesterdayStr}）数据：
      `;
      
      if (!yesterdayData) {
        systemContext += `学生没有记录任何数据。请直接发起对话，询问昨天去哪了，是不是偷懒了。`;
      } else {
        const studyHours = (yesterdayData.studyMinutes / 60).toFixed(1);
        systemContext += `有效学习${studyHours}小时，目标${stage.targetHours}小时，玩游戏${yesterdayData.gameUsed}分钟。日志：${yesterdayData.logs.map(l => l.content).join(';')}`;
      }

      const initialMsg = { role: 'system', content: systemContext };
      const triggerMsg = { role: 'user', content: "导师，我来了，看看我昨天的情况。" };
      
      const newHistory = [initialMsg, triggerMsg];
      setChatMessages(newHistory); 
      sendToAI(newHistory);
    }
  };

  const handleUserSend = () => {
    if (!chatInput.trim()) return;
    const newMsg = { role: 'user', content: chatInput };
    const updatedHistory = [...chatMessages, newMsg];
    setChatMessages(updatedHistory);
    setChatInput('');
    setShowEmojiPicker(false);
    sendToAI(updatedHistory);
  };

  const handleEmojiClick = (emoji) => {
    setChatInput(prev => prev + emoji);
  };

  // --- Helpers for State Updates ---
  const updateStudyStats = (seconds, log) => {
    const m = Math.floor(seconds / 60);
    const g = Math.floor(m / 4.5); 
    saveData({ ...todayStats, studyMinutes: todayStats.studyMinutes + m, gameBank: todayStats.gameBank + g, logs: [...todayStats.logs, { time: new Date().toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit'}), content: log, duration: m }] });
  };

  const updateGameStats = (seconds) => {
    const m = Math.floor(seconds / 60);
    saveData({ ...todayStats, gameUsed: todayStats.gameUsed + m, gameBank: todayStats.gameBank - m });
  };

  const saveLog = () => { 
    if(logContent.trim()){ 
      updateStudyStats(pendingStudyTime, logContent); 
      setShowLogModal(false); 
      setLogContent(''); 
      switchMode('break'); 
    }
  };

  const switchMode = (newMode) => {
    setIsActive(false);
    setIsZen(false);
    setMode(newMode);
    if (newMode === 'focus') {
      setInitialTime(45 * 60);
      setTimeLeft(45 * 60);
    } else if (newMode === 'break') {
      setInitialTime(10 * 60); 
      setTimeLeft(10 * 60);
    } else if (newMode === 'gaming') {
      if (todayStats.gameBank <= 0) {
        alert("⛔ 你的游戏券余额为0！请先去专注学习！\n\n提示：每专注45分钟 = 10分钟游戏时间。");
        setMode('focus');
        setInitialTime(45 * 60);
        setTimeLeft(45 * 60);
        return;
      }
      const availableSeconds = todayStats.gameBank * 60;
      setInitialTime(availableSeconds);
      setTimeLeft(availableSeconds);
    }
  };

  const toggleFullScreen = async () => {
    if (!appContainerRef.current) return;
    const isFullscreenAvailable = document.fullscreenEnabled || document.webkitFullscreenEnabled;
    if (!isFullscreenAvailable) return;

    if (!document.fullscreenElement) {
      try {
        await appContainerRef.current.requestFullscreen();
      } catch (err) { }
    } else {
      try {
        if (document.exitFullscreen) await document.exitFullscreen();
      } catch (err) { }
    }
  };

  const toggleTimer = () => {
    if (mode === 'gaming' && todayStats.gameBank <= 0 && !isActive) {
      alert("余额不足！");
      return;
    }
    if (!isActive) {
      setIsActive(true);
      if (mode === 'focus') {
        setIsZen(true);
        if (!document.fullscreenElement) {
            toggleFullScreen().catch(() => {});
        }
      }
    } else {
      setIsActive(false);
    }
  };

  const handleTimerComplete = () => {
    setIsActive(false); 
    setIsZen(false);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    clearInterval(timerRef.current);
    if (mode === 'focus') {
      setPendingStudyTime(initialTime); setShowLogModal(true);
    } else if (mode === 'gaming') {
      alert("⚠️ 游戏时间耗尽！"); updateGameStats(initialTime); 
    } else { alert("🔔 休息结束！"); }
  };

  const triggerStopTimer = () => setShowStopModal(true);
  const confirmStopTimer = () => { setShowStopModal(false); setIsActive(false); setIsZen(false); setTimeLeft(initialTime); if(document.fullscreenElement) document.exitFullscreen().catch(()=>{}); if(mode==='gaming') updateGameStats(initialTime-timeLeft); };
  const cancelStopTimer = () => setShowStopModal(false);
  
  const handleExportData = () => {
    const str = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history));
    const a = document.createElement('a'); a.href = str; a.download = `LevelUp_Backup_${getTodayDateString()}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };
  
  const handleImportData = (e) => {
    const f = e.target.files[0]; if(!f)return; const r = new FileReader();
    r.onload = (ev) => { try { const d = JSON.parse(ev.target.result); if(window.confirm(`导入 ${d.length} 条记录?`)) { localStorage.setItem('levelup_history', JSON.stringify(d)); loadData(); alert("成功!"); } } catch(err){alert("失败");} };
    r.readAsText(f);
  };

  // --- Render ---
  const progress = ((initialTime - timeLeft) / initialTime) * 100;
  const dailyProgressPercent = Math.min((todayStats.studyMinutes / (stage.targetHours*60)) * 100, 100);
  const getThemeColor = () => mode === 'focus' ? 'text-emerald-400 border-emerald-500 shadow-emerald-900/50' : mode === 'break' ? 'text-blue-400 border-blue-500 shadow-blue-900/50' : 'text-purple-400 border-purple-500 shadow-purple-900/50';
  const getBgColor = () => mode === 'focus' ? 'from-emerald-950/90 to-black' : mode === 'break' ? 'from-blue-950/90 to-black' : 'from-purple-950/90 to-black';

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

  return (
    <div ref={appContainerRef} className={`h-[100dvh] w-full bg-black text-gray-100 font-sans flex flex-col md:flex-row overflow-hidden transition-all duration-500 overscroll-none`}>
      
      {/* Sidebar */}
      <div className={`${isZen ? 'hidden' : 'flex'} flex-col w-full md:w-96 bg-gray-900/90 border-b md:border-b-0 md:border-r border-gray-800 p-4 md:p-6 gap-4 overflow-y-auto z-20 shadow-2xl flex-shrink-0 h-1/3 md:h-full`}>
        <div className="flex justify-between items-start">
          <div><h1 className="text-2xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">LEVEL UP!</h1><p className="text-[10px] text-gray-500 font-mono">CHAT COACH EDITION</p></div>
          <button onClick={() => setShowSettings(!showSettings)} className="text-gray-500 hover:text-white transition"><Settings className="w-5 h-5" /></button>
        </div>

        <button onClick={startAICoach} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]">
          <MessageCircle className="w-5 h-5" /> 进入 AI 导师聊天室
        </button>

        {showSettings && (
          <div className="bg-gray-800 rounded-lg p-4 text-xs animate-in fade-in slide-in-from-top-2 space-y-4">
            <div>
              <h3 className="text-gray-400 font-bold mb-2 flex items-center gap-2"><BrainCircuit className="w-4 h-4"/> AI 模型配置</h3>
              <div className="mb-2">
                <label className="text-gray-500 block mb-1">服务商</label>
                <div className="flex items-center bg-black/50 border border-gray-600 rounded px-2 relative">
                  <select value={selectedProvider} onChange={(e) => {
                    const p = API_PROVIDERS.find(x => x.id === e.target.value);
                    if (p) saveAISettings(apiKey, p.url, p.defaultModel, p.id);
                    else setSelectedProvider('custom');
                  }} className="w-full bg-transparent py-2 text-white outline-none border-none appearance-none z-10">
                    {API_PROVIDERS.map(p => <option key={p.id} value={p.id} className="bg-gray-900">{p.name}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2" />
                </div>
              </div>
              <div className="mb-2">
                <label className="text-gray-500 block mb-1">API Key</label>
                <input type="password" placeholder="sk-..." value={apiKey} onChange={(e) => saveAISettings(e.target.value, apiBaseUrl, apiModel, selectedProvider)} className="w-full bg-black/50 border border-gray-600 rounded p-2 text-white outline-none focus:border-purple-500"/>
              </div>
              <div className="mb-2 relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-gray-500">模型名称</label>
                  <button onClick={fetchAvailableModels} disabled={isFetchingModels} className="text-[9px] bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded flex items-center gap-1">{isFetchingModels ? <RefreshCw className="w-3 h-3 animate-spin"/> : <List className="w-3 h-3"/>} 获取列表</button>
                </div>
                <div className="flex items-center bg-black/50 border border-gray-600 rounded px-2">
                  <Cpu className="w-3 h-3 text-gray-500 mr-2 flex-shrink-0" />
                  <input type="text" value={apiModel} onChange={(e) => { setApiModel(e.target.value); setIsModelListOpen(true); setModelSearch(e.target.value); }} onFocus={() => setIsModelListOpen(true)} className="w-full bg-transparent py-2 text-white outline-none" placeholder="输入或选择模型"/>
                  <button onClick={() => setIsModelListOpen(!isModelListOpen)}><ChevronDown className="w-4 h-4 text-gray-500" /></button>
                </div>
                
                {/* Custom Dropdown for Models */}
                {isModelListOpen && availableModels.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-gray-800 border border-gray-700 rounded-b-lg shadow-xl max-h-40 overflow-y-auto z-50 mt-1">
                    <div className="sticky top-0 bg-gray-800 p-2 border-b border-gray-700 flex items-center gap-2">
                      <Search className="w-3 h-3 text-gray-500" />
                      <input type="text" value={modelSearch} onChange={(e) => setModelSearch(e.target.value)} placeholder="搜索模型..." className="w-full bg-transparent text-white outline-none text-xs"/>
                    </div>
                    {availableModels.filter(m => m.toLowerCase().includes(modelSearch.toLowerCase())).map(m => (
                      <div key={m} onClick={() => { setApiModel(m); saveAISettings(apiKey, apiBaseUrl, m, selectedProvider); setIsModelListOpen(false); }} className="px-3 py-2 hover:bg-purple-900/30 cursor-pointer truncate">{m}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="border-t border-gray-700 pt-3 flex gap-2">
              <button onClick={handleExportData} className="flex-1 bg-gray-700 p-2 rounded flex justify-center gap-1"><Download className="w-3 h-3"/> 导出</button>
              <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-gray-700 p-2 rounded flex justify-center gap-1"><Upload className="w-3 h-3"/> 导入</button>
              <input type="file" ref={fileInputRef} onChange={handleImportData} className="hidden" accept=".json" />
            </div>
          </div>
        )}

        {/* Stats & Logs UI */}
        <div className={`rounded-xl p-3 md:p-4 border-l-4 ${stage.borderColor} bg-gray-800/50`}>
          <div className="flex items-center gap-2 mb-1"><Target className={`w-4 h-4 ${stage.color}`} /><span className={`text-xs font-bold ${stage.color}`}>阶段: {stage.name}</span></div>
          <div className="pl-6 text-[10px] text-gray-500">{(todayStats.studyMinutes/60).toFixed(1)}h / {stage.targetHours}h</div>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-1">
           {todayStats.logs && todayStats.logs.slice().reverse().map((log, i) => (
             <div key={i} className="bg-gray-800/30 p-2 rounded border-l-2 border-emerald-500/50 text-xs text-gray-300 truncate">{log.content}</div>
           ))}
        </div>
      </div>

      {/* Main Timer */}
      <div className={`flex-1 flex flex-col items-center justify-center p-4 relative bg-gradient-to-br ${getBgColor()} transition-colors duration-1000`}>
        <div className={`absolute top-4 right-4 z-30 ${isZen && isActive ? 'opacity-0 hover:opacity-100' : ''}`}>
           {isZen && <button onClick={() => setIsZen(false)} className="mr-2 bg-gray-800/50 text-gray-400 px-3 py-2 rounded text-xs">退出禅模式</button>}
           <button onClick={toggleFullScreen} className="bg-gray-800/50 text-white p-2 rounded-lg">{isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}</button>
        </div>
        <div className={`flex gap-2 mb-8 md:mb-12 bg-gray-900/80 p-1.5 rounded-2xl border border-gray-700/50 z-10 ${isZen ? '-translate-y-40 opacity-0 absolute' : ''}`}>
          <button onClick={() => switchMode('focus')} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold ${mode === 'focus' ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}><BookOpen className="w-4 h-4"/> 专注</button>
          <button onClick={() => switchMode('break')} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold ${mode === 'break' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}><Coffee className="w-4 h-4"/> 休息</button>
          <button onClick={() => switchMode('gaming')} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold ${mode === 'gaming' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}><Gamepad2 className="w-4 h-4"/> 奖励</button>
        </div>
        {/* Timer Circle Visuals */}
        <div className={`relative mb-8 group ${isZen ? 'scale-125' : 'scale-100'}`}>
          {!isZen && <div className={`absolute inset-0 rounded-full border-4 border-gray-800/50 scale-110`}></div>}
          <div className={`rounded-full flex items-center justify-center relative shadow-2xl ${isZen ? 'border-0' : `border-8 bg-gray-900 ${getThemeColor()}`}`} style={{ width: 'min(70vmin, 320px)', height: 'min(70vmin, 320px)' }}>
             <div className={`font-mono font-bold tabular-nums text-center text-white drop-shadow-2xl w-[5ch] ${isZen ? 'text-[15vmin]' : 'text-[12vmin]'}`}>{formatTime(timeLeft)}</div>
          </div>
        </div>
        <div className={`flex gap-4 z-10 ${isZen && isActive ? 'opacity-100' : ''}`}>
           {!isActive ? <button onClick={toggleTimer} className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95"><Play className="w-8 h-8 ml-1"/></button> : <div className="flex gap-4"><button onClick={toggleTimer} className="w-16 h-16 rounded-full bg-gray-800 border-2 border-gray-600 text-white flex items-center justify-center active:scale-95"><Pause className="w-8 h-8"/></button><button onClick={triggerStopTimer} className="w-16 h-16 rounded-full bg-red-950/30 border-2 border-red-900/50 text-red-500 flex items-center justify-center active:scale-95"><Square className="w-6 h-6"/></button></div>}
        </div>
      </div>

      {/* Chat Modal (WeChat Style) */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
          <div className="bg-gray-900 w-full md:max-w-md h-full md:h-[80vh] md:rounded-2xl shadow-2xl flex flex-col relative overflow-hidden border border-gray-800">
            {/* Header */}
            <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center z-10 shadow-md">
              <div className="flex items-center gap-2 text-white font-bold">
                <Sparkles className="w-5 h-5 text-purple-400" /> 
                <span>AI 导师</span>
                <span className="text-[10px] bg-purple-900 px-1.5 rounded text-purple-200 font-normal">{apiModel}</span>
              </div>
              <button onClick={() => setShowChatModal(false)} className="text-gray-400 hover:text-white"><X className="w-6 h-6"/></button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/50">
              {chatMessages.filter(m => m.role !== 'system').map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-emerald-600 text-white rounded-br-none' 
                      : 'bg-gray-700 text-gray-100 rounded-bl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {aiThinking && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 p-3 rounded-2xl rounded-bl-none flex gap-1 items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-gray-800 border-t border-gray-700 flex flex-col gap-2">
              {/* Emoji Picker Popover */}
              {showEmojiPicker && (
                <div className="bg-gray-700 p-2 rounded-lg grid grid-cols-6 gap-2 mb-2 absolute bottom-16 left-2 shadow-xl border border-gray-600">
                  {COMMON_EMOJIS.map(e => (
                    <button key={e} onClick={() => handleEmojiClick(e)} className="text-xl hover:bg-gray-600 p-1 rounded">{e}</button>
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-gray-400 hover:text-yellow-400 transition"><Smile className="w-6 h-6"/></button>
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUserSend()}
                  placeholder="回复导师..." 
                  className="flex-1 bg-black/50 border border-gray-600 rounded-full px-4 py-2 text-white outline-none focus:border-emerald-500"
                />
                <button onClick={handleUserSend} disabled={!chatInput.trim() || aiThinking} className="bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition">
                  <Send className="w-5 h-5 ml-0.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stop Modal & Log Modal */}
      {showStopModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-red-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><AlertTriangle className="text-red-500"/> 确定放弃？</h3>
            <div className="flex gap-3"><button onClick={cancelStopTimer} className="flex-1 bg-gray-800 text-white py-3 rounded-xl">继续</button><button onClick={confirmStopTimer} className="flex-1 bg-red-900/50 text-red-200 border border-red-800 py-3 rounded-xl">放弃</button></div>
          </div>
        </div>
      )}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-emerald-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><CheckCircle2 className="text-emerald-400"/> 任务完成！</h3>
            <textarea value={logContent} onChange={(e)=>setLogContent(e.target.value)} className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white min-h-[100px] mb-4 outline-none" autoFocus/>
            <button onClick={saveLog} disabled={!logContent.trim()} className="w-full bg-emerald-600 text-white py-3 rounded-xl shadow-lg">存入档案</button>
          </div>
        </div>
      )}
    </div>
  );
}