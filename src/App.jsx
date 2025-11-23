import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, RotateCcw, Gamepad2, BookOpen, Coffee, Save, History, Trophy, AlertCircle, X, CheckCircle2, Download, Upload, Settings, Target, Maximize2, Minimize2, AlertTriangle, Sparkles, BrainCircuit, Server, Cpu, RefreshCw, List, Send, Smile, Search, ChevronDown, Zap, MessageCircle } from 'lucide-react';

// --- 1. 工具函数 (Utility Functions) ---
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
      return { name: "全真模拟演练期", desc: "心态调整 / 考场适应", targetHours: 6, color: "text-cyan-400", borderColor: "border-cyan-500", bg: "bg-cyan-500/10" };
    } else {
       return { name: "终极冲刺期", desc: "背水一战 / 回归基础", targetHours: 11, color: "text-pink-500", borderColor: "border-pink-500", bg: "bg-pink-500/10" };
    }
  } else if (month >= 1 && month <= 6) {
    return { name: "基础夯实期", desc: "地毯式复习 / 英语单词", targetHours: 7, color: "text-emerald-400", borderColor: "border-emerald-500", bg: "bg-emerald-500/10" };
  } else if (month >= 7 && month <= 9) {
    return { name: "强化提升期", desc: "海量刷题 / 攻克难点", targetHours: 9, color: "text-yellow-400", borderColor: "border-yellow-500", bg: "bg-yellow-500/10" };
  } else {
    return { name: "真题实战期", desc: "真题模拟 / 查缺", targetHours: 10, color: "text-orange-400", borderColor: "border-orange-500", bg: "bg-orange-500/10" };
  }
};

// --- 2. 预设数据 (Presets) ---
const API_PROVIDERS = [
  { id: 'siliconflow', name: '硅基流动 (SiliconFlow)', url: 'https://api.siliconflow.cn/v1', defaultModel: 'deepseek-ai/DeepSeek-R1' },
  { id: 'deepseek', name: 'DeepSeek 官方', url: 'https://api.deepseek.com', defaultModel: 'deepseek-chat' },
  { id: 'moonshot', name: '月之暗面 (Kimi)', url: 'https://api.moonshot.cn/v1', defaultModel: 'moonshot-v1-8k' },
  { id: 'aliyun', name: '阿里云 (通义千问)', url: 'https://dashscope.aliyuncs.com/compatible-mode/v1', defaultModel: 'qwen-turbo' },
  { id: 'openai', name: 'OpenAI (需要梯子)', url: 'https://api.openai.com/v1', defaultModel: 'gpt-4o' },
  { id: 'custom', name: '自定义 (Custom)', url: '', defaultModel: '' }
];

const COMMON_EMOJIS = ['👍', '🔥', '💪', '😭', '🙏', '🎉', '🤔', '💤', '📚', '☕️', '🤖', '👻'];

// --- 3. 主组件 (Main Component) ---
export default function LevelUpApp() {
  const [loading, setLoading] = useState(true);
  
  // 3.1 计时器状态
  const [mode, setMode] = useState('focus'); 
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isActive, setIsActive] = useState(false);
  const [initialTime, setInitialTime] = useState(45 * 60);
  const [stage, setStage] = useState(getStageInfo());
  const [isZen, setIsZen] = useState(false);
  
  // 3.2 数据状态
  const [todayStats, setTodayStats] = useState({ studyMinutes: 0, gameBank: 0, gameUsed: 0, logs: [] });
  const [history, setHistory] = useState([]);
  
  // 3.3 AI 设置状态
  const [apiKey, setApiKey] = useState(''); 
  const [apiBaseUrl, setApiBaseUrl] = useState('https://api.siliconflow.cn/v1'); 
  const [apiModel, setApiModel] = useState('deepseek-ai/DeepSeek-R1');
  const [selectedProvider, setSelectedProvider] = useState('siliconflow');
  
  // 3.4 模型列表状态
  const [availableModels, setAvailableModels] = useState([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [isModelListOpen, setIsModelListOpen] = useState(false);
  const [modelSearch, setModelSearch] = useState('');
  
  // 3.5 聊天状态
  const [chatMessages, setChatMessages] = useState([]); 
  const [chatInput, setChatInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const chatEndRef = useRef(null);

  // 3.6 UI 状态
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

  // --- 4. 数据加载与保存逻辑 (LocalStorage) ---
  const loadData = () => {
    try {
      const todayStr = getTodayDateString();
      const storedHistory = JSON.parse(localStorage.getItem('levelup_history') || '[]');
      
      // Load AI Settings
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

  // --- 5. 计时器核心逻辑 ---
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => { setTimeLeft((prev) => prev - 1); }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleTimerComplete();
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  // --- 6. 监听全屏变化 ---
  useEffect(() => {
    const handleFsChange = () => { setIsFullscreen(!!document.fullscreenElement); };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // --- 7. AI 交互逻辑 ---
  const fetchAvailableModels = async () => {
    if (!apiKey) return alert("请先输入 API Key！");
    setIsFetchingModels(true);
    try {
      const cleanBaseUrl = apiBaseUrl.replace(/\/$/, '');
      // SiliconFlow 使用 /models，DeepSeek 可能略有不同，这里做通用尝试
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
      alert(`获取失败: ${error.message}\n请检查 Base URL 是否正确。`);
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
        systemContext += `有效学习${studyHours}小时，目标${stage.targetHours}小时，玩游戏${yesterdayData.gameUsed}分钟。日志：${yesterdayData.logs.map(l => typeof l.content === 'string' ? l.content : JSON.stringify(l)).join(';')}`;
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

  // --- 8. 状态更新辅助函数 (Move these BEFORE they are used) ---
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
    
    // Safely check for fullscreen capability
    const isFullscreenAvailable = document.fullscreenEnabled || document.webkitFullscreenEnabled;
    
    if (!isFullscreenAvailable) return;

    if (!document.fullscreenElement) {
      try {
        await appContainerRef.current.requestFullscreen();
      } catch (err) { console.log("Fullscr err", err); }
    } else {
      try {
        if (document.exitFullscreen) await document.exitFullscreen();
      } catch (err) { console.log("Exit Fullscr err", err); }
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
        if (appContainerRef.current && (document.fullscreenEnabled || document.webkitFullscreenEnabled)) {
            appContainerRef.current.requestFullscreen().catch(() => {});
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
  
  const confirmStopTimer = () => { 
    setShowStopModal(false); 
    setIsActive(false); 
    setIsZen(false); 
    setTimeLeft(initialTime); 
    if(document.fullscreenElement) document.exitFullscreen().catch(()=>{}); 
    if(mode==='gaming') updateGameStats(initialTime-timeLeft); 
  };
  
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

  // --- 9. 渲染相关 (Render) ---
  const progress = ((initialTime - timeLeft) / initialTime) * 100;
  const dailyProgressPercent = Math.min((todayStats.studyMinutes / (stage.targetHours*60)) * 100, 100);
  
  // Fix: Define getThemeColor and getBgColor properly
  const getThemeColor = () => {
    if (mode === 'focus') return 'text-emerald-400 border-emerald-500 shadow-emerald-900/50';
    if (mode === 'break') return 'text-blue-400 border-blue-500 shadow-blue-900/50';
    if (mode === 'gaming') return 'text-purple-400 border-purple-500 shadow-purple-900/50';
  };
  
  const getBgColor = () => {
     if (mode === 'focus') return 'from-emerald-950/90 to-black';
     if (mode === 'break') return 'from-blue-950/90 to-black';
     if (mode === 'gaming') return 'from-purple-950/90 to-black';
  };

  // Ensure currentTheme objects are valid and accessible
  const currentTheme = {
    color: getThemeColor(),
    // 额外的样式对象
    textColor: mode === 'focus' ? 'text-emerald-400' : mode === 'break' ? 'text-blue-400' : 'text-purple-400'
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center font-mono">Loading System...</div>;

  return (
    <div ref={appContainerRef} className={`h-[100dvh] w-full bg-[#0a0a0a] text-gray-100 font-sans flex flex-col md:flex-row overflow-hidden relative`}>
      {/* 背景纹理 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,20,40,0.4),transparent_70%)] pointer-events-none"></div>
      
      {/* Sidebar */}
      <div className={`${isZen ? 'hidden' : 'flex'} flex-col w-full md:w-96 bg-[#111116] border-b md:border-b-0 md:border-r border-gray-800 p-4 md:p-6 gap-4 overflow-y-auto z-20 shadow-2xl flex-shrink-0 h-1/3 md:h-full relative group`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        <div className="flex justify-between items-start relative z-10">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">LEVEL UP!</h1>
            <p className="text-[10px] text-gray-500 font-mono flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-500"/> CHAT COACH EDITION</p>
          </div>
          <button onClick={() => setShowSettings(!showSettings)} className="text-gray-500 hover:text-white transition p-1 hover:bg-gray-800 rounded-full"><Settings className="w-5 h-5" /></button>
        </div>

        <button onClick={startAICoach} className="w-full relative overflow-hidden group bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 hover:border-purple-400 text-white font-bold py-3 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.2)] flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <MessageCircle className="w-5 h-5 text-purple-400 group-hover:text-white transition-colors" /> <span className="relative z-10">进入 AI 导师通信终端</span>
        </button>

        {showSettings && (
          <div className="bg-[#1a1a20] border border-gray-700 rounded-lg p-4 text-xs animate-in fade-in slide-in-from-top-2 space-y-4 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-gray-400 font-bold mb-2 flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-cyan-500"/> AI 模型配置</h3>
              <div className="mb-2">
                <label className="text-gray-500 block mb-1">服务商</label>
                <div className="flex items-center bg-black/50 border border-gray-600 rounded px-2 relative">
                  <select value={selectedProvider} onChange={(e) => {
                    const p = API_PROVIDERS.find(x => x.id === e.target.value);
                    if (p) saveAISettings(apiKey, p.url, p.defaultModel, p.id);
                    else setSelectedProvider('custom');
                  }} className="w-full bg-transparent py-2 text-white outline-none border-none appearance-none z-10 font-mono">
                    {API_PROVIDERS.map(p => <option key={p.id} value={p.id} className="bg-gray-900">{p.name}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2" />
                </div>
              </div>
              <div className="mb-2">
                <label className="text-gray-500 block mb-1">API Key</label>
                <input type="password" placeholder="sk-..." value={apiKey} onChange={(e) => saveAISettings(e.target.value, apiBaseUrl, apiModel, selectedProvider)} className="w-full bg-black/50 border border-gray-600 rounded p-2 text-white outline-none focus:border-cyan-500 font-mono"/>
              </div>
              <div className="mb-2 relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-gray-500">模型名称</label>
                  <button onClick={fetchAvailableModels} disabled={isFetchingModels} className="text-[9px] bg-cyan-900/30 text-cyan-300 border border-cyan-800/50 px-2 py-0.5 rounded flex items-center gap-1 hover:bg-cyan-800/50 transition-colors">{isFetchingModels ? <RefreshCw className="w-3 h-3 animate-spin"/> : <List className="w-3 h-3"/>} 获取列表</button>
                </div>
                <div className="flex items-center bg-black/50 border border-gray-600 rounded px-2">
                  <Cpu className="w-3 h-3 text-gray-500 mr-2 flex-shrink-0" />
                  <input type="text" value={apiModel} onChange={(e) => { setApiModel(e.target.value); setIsModelListOpen(true); setModelSearch(e.target.value); }} onFocus={() => setIsModelListOpen(true)} className="w-full bg-transparent py-2 text-white outline-none font-mono" placeholder="输入或选择模型"/>
                  <button onClick={() => setIsModelListOpen(!isModelListOpen)}><ChevronDown className="w-4 h-4 text-gray-500" /></button>
                </div>
                
                {/* Custom Dropdown for Models */}
                {isModelListOpen && availableModels.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-[#1a1a20] border border-gray-700 rounded-b-lg shadow-xl max-h-40 overflow-y-auto z-50 mt-1 font-mono">
                    <div className="sticky top-0 bg-[#1a1a20] p-2 border-b border-gray-700 flex items-center gap-2">
                      <Search className="w-3 h-3 text-gray-500" />
                      <input type="text" value={modelSearch} onChange={(e) => setModelSearch(e.target.value)} placeholder="搜索..." className="w-full bg-transparent text-white outline-none text-xs"/>
                    </div>
                    {availableModels.filter(m => m.toLowerCase().includes(modelSearch.toLowerCase())).map(m => (
                      <div key={m} onClick={() => { setApiModel(m); saveAISettings(apiKey, apiBaseUrl, m, selectedProvider); setIsModelListOpen(false); }} className="px-3 py-2 hover:bg-cyan-900/30 cursor-pointer truncate text-gray-300 hover:text-cyan-400 transition-colors">{m}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="border-t border-gray-700 pt-3 flex gap-2">
              <button onClick={handleExportData} className="flex-1 bg-gray-800 hover:bg-gray-700 p-2 rounded flex justify-center gap-1 transition-colors text-gray-400 hover:text-white"><Download className="w-3 h-3"/> 导出</button>
              <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-gray-800 hover:bg-gray-700 p-2 rounded flex justify-center gap-1 transition-colors text-gray-400 hover:text-white"><Upload className="w-3 h-3"/> 导入</button>
              <input type="file" ref={fileInputRef} onChange={handleImportData} className="hidden" accept=".json" />
            </div>
          </div>
        )}

        {/* 状态卡片 */}
        <div className={`rounded-xl p-3 md:p-4 border-l-4 ${stage.borderColor} ${stage.bg} relative overflow-hidden`}>
          <div className="flex items-center gap-2 mb-1 relative z-10"><Target className={`w-4 h-4 ${stage.color}`} /><span className={`text-xs font-bold ${stage.color} tracking-widest uppercase`}>STAGE: {stage.name}</span></div>
          <div className="pl-6 relative z-10">
            <div className="flex justify-between text-xs mb-1 text-gray-400"><span>DAILY TARGET</span><span className="font-mono">{stage.targetHours}h</span></div>
            <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden"><div className={`h-full ${stage.color.replace('text', 'bg')} transition-all duration-1000 shadow-[0_0_10px_currentColor]`} style={{ width: `${dailyProgressPercent}%` }}></div></div>
            <div className="text-[10px] text-gray-500 mt-1 text-right font-mono">{(todayStats.studyMinutes/60).toFixed(1)}h / {stage.targetHours}h</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-1 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
           {todayStats.logs && todayStats.logs.slice().reverse().map((log, i) => (
             <div key={i} className="bg-[#1a1a20] p-3 rounded border-l-2 border-emerald-500/50 text-xs text-gray-300 relative group hover:bg-[#222228] transition-colors">
               <div className="flex justify-between text-gray-500 mb-1"><span className="font-mono text-emerald-600">{log.time}</span><span className="text-emerald-500/80">+{log.duration}m XP</span></div>
               <div className="truncate">{typeof log.content === 'string' ? log.content : 'Log Entry'}</div>
             </div>
           ))}
        </div>
      </div>

      {/* Main Timer Area */}
      <div className={`flex-1 flex flex-col items-center justify-center p-4 relative bg-gradient-to-br ${getBgColor()} transition-colors duration-1000 overflow-hidden`}>
        <div className={`absolute top-4 right-4 z-30 ${isZen && isActive ? 'opacity-0 hover:opacity-100 transition-opacity' : ''}`}>
           {isZen && <button onClick={() => setIsZen(false)} className="mr-2 bg-black/50 text-gray-400 px-3 py-2 rounded text-xs backdrop-blur-md hover:text-white border border-white/10">退出禅模式</button>}
           <button onClick={toggleFullScreen} className="bg-black/30 text-white p-2 rounded-lg hover:bg-white/10 transition backdrop-blur-md">{isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}</button>
        </div>

        <div className={`flex gap-2 mb-12 bg-black/40 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 z-10 transition-all duration-500 ${isZen ? '-translate-y-40 opacity-0 absolute' : ''}`}>
          <button onClick={() => switchMode('focus')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${mode === 'focus' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-gray-500 hover:text-gray-300'}`}><BookOpen className="w-4 h-4"/> 专注</button>
          <button onClick={() => switchMode('break')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${mode === 'break' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'text-gray-500 hover:text-gray-300'}`}><Coffee className="w-4 h-4"/> 休息</button>
          <button onClick={() => switchMode('gaming')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${mode === 'gaming' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'text-gray-500 hover:text-gray-300'}`}><Gamepad2 className="w-4 h-4"/> 奖励</button>
        </div>

        <div className={`relative mb-8 group transition-all duration-1000 ${isZen ? 'scale-125 md:scale-150' : 'scale-100'}`}>
          <div className={`rounded-full flex items-center justify-center relative shadow-[0_0_50px_-10px_currentColor] transition-all duration-1000 ${isZen ? '' : `border-8 bg-black/50 backdrop-blur-sm ${currentTheme.color.split(' ')[1]}`}`} style={{ width: 'min(70vmin, 320px)', height: 'min(70vmin, 320px)' }}>
             <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
               {!isZen && <circle cx="50" cy="50" r="44" fill="none" stroke="#222" strokeWidth="2" />}
               <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth={isZen ? "2" : "4"} strokeLinecap="round" strokeDasharray="276" strokeDashoffset={276 - (276 * progress) / 100} className={`transition-all duration-1000 ease-linear ${isZen ? 'text-white/30' : ''}`}/>
             </svg>
             <div className="flex flex-col items-center z-10 select-none w-full">
               <div className={`font-mono font-bold tabular-nums text-center text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] w-[5ch] transition-all duration-500 ${isZen ? 'text-[18vmin]' : 'text-[13vmin]'}`}>{formatTime(timeLeft)}</div>
               <div className={`text-xs mt-2 font-bold tracking-[0.2em] uppercase transition-opacity duration-500 ${isZen ? 'opacity-30' : 'opacity-100'} ${currentTheme.textColor}`}>{mode === 'focus' ? 'DEEP WORK' : mode === 'break' ? 'RECHARGING' : 'PLAYING'}</div>
             </div>
          </div>
        </div>

        <div className={`flex gap-6 z-10 transition-all duration-300 ${isZen && isActive ? 'opacity-100' : 'opacity-100'}`}>
           {!isActive ? (
             <button onClick={toggleTimer} className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 hover:shadow-[0_0_30px_white] transition-all active:scale-95"><Play className="w-8 h-8 ml-1 fill-black"/></button>
           ) : (
             <div className="flex gap-6">
                <button onClick={toggleTimer} className="w-20 h-20 rounded-full bg-black/50 border border-white/20 text-white flex items-center justify-center hover:bg-white/10 hover:border-white/50 transition-all active:scale-95 backdrop-blur-md"><Pause className="w-8 h-8 fill-white"/></button>
                <button onClick={triggerStopTimer} className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/50 text-red-500 flex items-center justify-center hover:bg-red-500/40 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all active:scale-95 backdrop-blur-md"><Square className="w-6 h-6 fill-red-500"/></button>
             </div>
           )}
           {!isZen && (<button onClick={() => { setIsActive(false); setTimeLeft(initialTime); }} className="absolute bottom-8 right-8 md:static w-12 h-12 rounded-full bg-white/5 border border-white/10 text-gray-400 flex items-center justify-center hover:text-white hover:bg-white/10 transition-all" title="Reset Timer"><RotateCcw className="w-5 h-5" /></button>)}
        </div>
      </div>

      {/* AI Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
          <div className="bg-[#111116] w-full md:max-w-md h-full md:h-[85vh] md:rounded-3xl shadow-2xl flex flex-col relative overflow-hidden border border-gray-800">
            <div className="p-4 bg-[#16161c] border-b border-gray-800 flex justify-between items-center z-10 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg"><Sparkles className="w-5 h-5 text-white" /></div>
                <div><h3 className="font-bold text-white text-sm">AI 导师</h3><p className="text-[10px] text-gray-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online</p></div>
              </div>
              <button onClick={() => setShowChatModal(false)} className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition"><X className="w-4 h-4"/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a]">
              {chatMessages.filter(m => m.role !== 'system').map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-md ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-[#1f1f27] text-gray-200 rounded-bl-none border border-gray-800'}`}>
                    {typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}
                  </div>
                </div>
              ))}
              {aiThinking && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-[#1f1f27] p-4 rounded-2xl rounded-bl-none flex gap-1.5 items-center border border-gray-800">
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 bg-[#16161c] border-t border-gray-800 flex flex-col gap-2">
              {showEmojiPicker && (
                <div className="bg-[#1f1f27] p-3 rounded-xl grid grid-cols-6 gap-2 mb-2 absolute bottom-20 left-4 shadow-xl border border-gray-700 z-50 animate-in zoom-in duration-200 origin-bottom-left">
                  {COMMON_EMOJIS.map(e => <button key={e} onClick={() => handleEmojiClick(e)} className="text-2xl hover:bg-white/10 p-2 rounded transition">{e}</button>)}
                </div>
              )}
              <div className="flex items-center gap-2 bg-[#0a0a0a] p-1.5 rounded-full border border-gray-800 focus-within:border-purple-500/50 transition-colors">
                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-yellow-400 hover:bg-white/5 transition"><Smile className="w-5 h-5"/></button>
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUserSend()} placeholder="输入消息..." className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-gray-600"/>
                <button onClick={handleUserSend} disabled={!chatInput.trim() || aiThinking} className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"><Send className="w-4 h-4 ml-0.5" /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other Modals (Stop/Log) - Styled */}
      {showStopModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-200">
          <div className="bg-[#16161c] border border-red-500/30 rounded-3xl p-6 max-w-sm w-full shadow-[0_0_50px_rgba(239,68,68,0.15)]">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-2"><AlertTriangle className="w-8 h-8 text-red-500" /></div>
              <h3 className="text-xl font-bold text-white">确定要放弃吗？</h3>
              <p className="text-gray-400 text-sm leading-relaxed">如果现在停止，你本次的努力将<span className="text-red-400 font-bold">不会获得任何奖励</span>。坚持就是胜利！</p>
              <div className="flex gap-3 w-full mt-2">
                <button onClick={cancelStopTimer} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 rounded-2xl transition-colors">继续坚持</button>
                <button onClick={confirmStopTimer} className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 font-bold py-3.5 rounded-2xl transition-colors">放弃</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-200">
          <div className="bg-[#16161c] border border-emerald-500/30 rounded-3xl p-6 max-w-md w-full shadow-[0_0_50px_rgba(16,185,129,0.15)]">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-emerald-400"><CheckCircle2 className="w-8 h-8" /><h3 className="text-2xl font-bold text-white">任务完成！</h3></div>
              <textarea value={logContent} onChange={(e)=>setLogContent(e.target.value)} className="w-full bg-black/30 border border-gray-700 rounded-2xl p-4 text-white min-h-[120px] outline-none focus:border-emerald-500/50 transition-colors placeholder:text-gray-600" placeholder="记录一下刚才的成就..." autoFocus/>
              <button onClick={saveLog} disabled={!logContent.trim()} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-2xl shadow-lg disabled:opacity-50 transition-all transform active:scale-[0.98]">存入档案 (+10m 券)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}