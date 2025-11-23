import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, RotateCcw, Gamepad2, BookOpen, Coffee, Save, History, Trophy, AlertCircle, X, CheckCircle2, Download, Upload, Settings, Target, Maximize2, Minimize2, AlertTriangle } from 'lucide-react';

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

const getStageInfo = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const TARGET_YEAR = 2026; 

  if (month === 11 || month === 12) {
    if (year === TARGET_YEAR - 1) {
      return {
        name: "全真模拟演练期",
        desc: "心态调整 / 考场适应 / 查漏补缺",
        targetHours: 6,
        color: "text-blue-400",
        borderColor: "border-blue-500"
      };
    } else {
       return {
        name: "终极冲刺期",
        desc: "背水一战 / 模拟考试 / 回归基础",
        targetHours: 11,
        color: "text-red-500",
        borderColor: "border-red-500"
      };
    }
  } else if (month >= 1 && month <= 6) {
    return {
      name: "基础夯实期 (一轮)",
      desc: "地毯式复习 / 英语单词 / 数学全书",
      targetHours: 7,
      color: "text-emerald-400",
      borderColor: "border-emerald-500"
    };
  } else if (month >= 7 && month <= 9) {
    return {
      name: "强化提升期 (二轮)",
      desc: "海量刷题 / 攻克难点 / 408强化",
      targetHours: 9,
      color: "text-yellow-400",
      borderColor: "border-yellow-500"
    };
  } else {
    return {
      name: "真题实战期",
      desc: "真题模拟 / 政治背诵 / 查缺",
      targetHours: 10,
      color: "text-orange-400",
      borderColor: "border-orange-500"
    };
  }
};

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
  const [todayStats, setTodayStats] = useState({
    studyMinutes: 0,
    gameBank: 0, 
    gameUsed: 0,
    logs: []
  });
  const [history, setHistory] = useState([]);
  
  // UI State
  const [showLogModal, setShowLogModal] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
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
      setHistory(storedHistory);

      const todayData = storedHistory.find(d => d.date === todayStr);
      if (todayData) {
        setTodayStats(todayData);
      } else {
        let lastBank = 0;
        if (storedHistory.length > 0) {
           lastBank = storedHistory[0].gameBank;
        }
        
        const newToday = {
          date: todayStr,
          studyMinutes: 0,
          gameBank: lastBank > 0 ? lastBank : 0, 
          gameUsed: 0,
          logs: []
        };
        setTodayStats(newToday);
      }
    } catch (e) {
      console.error("Load Error", e);
    }
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
    } catch (e) {
      console.error("Save Error", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Timer Logic ---
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleTimerComplete();
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  // --- Fullscreen Listener ---
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // --- Handlers ---
  
  const handleTimerComplete = () => {
    setIsActive(false);
    setIsZen(false);
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.log("Exit Fullscreen info:", err));
    }
    clearInterval(timerRef.current);
    
    if (mode === 'focus') {
      const completedTime = initialTime;
      setPendingStudyTime(completedTime);
      setShowLogModal(true);
    } else if (mode === 'gaming') {
      alert("⚠️ 游戏时间耗尽！立即停止操作，回到现实！");
      updateGameStats(initialTime); 
    } else {
      alert("🔔 休息结束，请立即开始下一轮专注！");
    }
  };

  const updateStudyStats = (secondsStudied, logText) => {
    const minutes = Math.floor(secondsStudied / 60);
    const gameEarned = Math.floor(minutes / 4.5); 

    const newStats = {
      ...todayStats,
      studyMinutes: todayStats.studyMinutes + minutes,
      gameBank: todayStats.gameBank + gameEarned,
      logs: [...todayStats.logs, {
        time: new Date().toLocaleTimeString('zh-CN', {hour: '2-digit', minute:'2-digit'}),
        content: logText,
        duration: minutes
      }]
    };
    saveData(newStats);
  };

  const updateGameStats = (secondsPlayed) => {
    const minutes = Math.floor(secondsPlayed / 60);
    const newStats = {
      ...todayStats,
      gameUsed: todayStats.gameUsed + minutes,
      gameBank: todayStats.gameBank - minutes
    };
    saveData(newStats);
  };

  const saveLog = () => {
    if (!logContent.trim()) return;
    updateStudyStats(pendingStudyTime, logContent);
    setShowLogModal(false);
    setLogContent('');
    setPendingStudyTime(0);
    switchMode('break');
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
      } catch (err) {
        console.warn("Fullscreen request failed:", err);
      }
    } else {
      try {
        if (document.exitFullscreen) await document.exitFullscreen();
      } catch (err) {
        console.warn("Exit Fullscreen failed:", err);
      }
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

  const triggerStopTimer = () => setShowStopModal(true);

  const confirmStopTimer = () => {
    setShowStopModal(false);
    setIsActive(false);
    setIsZen(false);
    setTimeLeft(initialTime);
    if (document.fullscreenElement) document.exitFullscreen().catch(err => console.log("Exit FS Info:", err));

    if (mode === 'gaming') {
      const usedSeconds = initialTime - timeLeft;
      if (usedSeconds > 60) {
           updateGameStats(usedSeconds);
      }
    }
  };

  const cancelStopTimer = () => setShowStopModal(false);

  // --- Export/Import ---
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `LevelUp_Backup_${getTodayDateString()}.json`);
    document.body.appendChild(downloadAnchorNode); 
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (!Array.isArray(importedData)) throw new Error("Format invalid");
        if (window.confirm(`确认导入 ${importedData.length} 条历史记录吗？`)) {
           localStorage.setItem('levelup_history', JSON.stringify(importedData));
           loadData(); // reload
           alert("导入成功！");
        }
      } catch (err) {
        alert("导入失败：文件格式不正确");
      }
    };
    reader.readAsText(file);
  };

  // --- Render Helpers ---
  const progress = ((initialTime - timeLeft) / initialTime) * 100;
  const displayedDailyTargetMin = stage.targetHours * 60; 
  const dailyProgressPercent = Math.min((todayStats.studyMinutes / displayedDailyTargetMin) * 100, 100);

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

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

  return (
    <div ref={appContainerRef} className={`min-h-screen bg-black text-gray-100 font-sans selection:bg-emerald-500/30 flex flex-col md:flex-row overflow-hidden transition-all duration-500`}>
      
      {/* Sidebar */}
      <div className={`${isZen ? 'hidden' : 'flex w-full md:w-96 opacity-100'} bg-gray-900/90 border-r border-gray-800 p-6 flex-col gap-6 overflow-y-auto z-20 shadow-2xl transition-all duration-500`}>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">LEVEL UP!</h1>
            <p className="text-[10px] text-gray-500 font-mono mt-1">PRO EDITION: 400+ TARGET</p>
          </div>
          <button onClick={() => setShowSettings(!showSettings)} className="text-gray-500 hover:text-white transition"><Settings className="w-5 h-5" /></button>
        </div>

        {showSettings && (
          <div className="bg-gray-800 rounded-lg p-3 text-xs animate-in fade-in slide-in-from-top-2">
            <h3 className="text-gray-400 font-bold mb-2">数据备份 (Local Backup)</h3>
            <div className="flex gap-2">
              <button onClick={handleExportData} className="flex-1 bg-gray-700 hover:bg-gray-600 p-2 rounded flex items-center justify-center gap-1 transition"><Download className="w-3 h-3" /> 导出备份</button>
              <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-gray-700 hover:bg-gray-600 p-2 rounded flex items-center justify-center gap-1 transition"><Upload className="w-3 h-3" /> 导入恢复</button>
              <input type="file" ref={fileInputRef} onChange={handleImportData} className="hidden" accept=".json" />
            </div>
          </div>
        )}

        <div className={`rounded-xl p-4 border-l-4 ${stage.borderColor} bg-gray-800/50`}>
          <div className="flex items-center gap-2 mb-1">
             <Target className={`w-4 h-4 ${stage.color}`} />
             <span className={`text-xs font-bold uppercase tracking-wider ${stage.color}`}>当前阶段: {stage.name}</span>
          </div>
          <p className="text-xs text-gray-400 mb-3 pl-6">{stage.desc}</p>
          <div className="pl-6">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">今日目标</span>
              <span className="text-white font-mono">{stage.targetHours}h</span>
            </div>
            <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
               <div className={`h-full ${stage.color.replace('text', 'bg')} transition-all duration-1000`} style={{ width: `${dailyProgressPercent}%` }}></div>
            </div>
            <div className="text-[10px] text-gray-500 mt-1 text-right">{(todayStats.studyMinutes/60).toFixed(1)}h / {stage.targetHours}h</div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <h2 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2"><Trophy className="w-4 h-4" /> 资源管理</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
              <div className="text-xs text-gray-500 mb-1">有效投入</div>
              <div className="text-xl font-mono font-bold text-white">{Math.floor(todayStats.studyMinutes / 60)}<span className="text-xs text-gray-500">h</span> {todayStats.studyMinutes % 60}<span className="text-xs text-gray-500">m</span></div>
            </div>
            <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800 relative overflow-hidden">
               {todayStats.gameBank > 90 && <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>}
              <div className="text-xs text-gray-500 mb-1">游戏券余额</div>
              <div className={`text-xl font-mono font-bold ${todayStats.gameBank > 0 ? 'text-purple-400' : 'text-red-500'}`}>{todayStats.gameBank}<span className="text-xs text-gray-500">m</span></div>
            </div>
          </div>
          <div className="mt-3 text-[10px] text-gray-500 flex justify-between px-1"><span>汇率: 45min学习 = 10min游戏</span><span>今日已玩: {todayStats.gameUsed}m</span></div>
        </div>

        <div className="flex-1 min-h-[150px] overflow-hidden flex flex-col">
          <h2 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2"><History className="w-4 h-4" /> 战斗日志</h2>
          <div className="overflow-y-auto space-y-2 pr-2 flex-1 scrollbar-thin scrollbar-thumb-gray-700">
            {todayStats.logs && todayStats.logs.length > 0 ? ([...todayStats.logs].reverse().map((log, idx) => (
                <div key={idx} className="bg-gray-800/30 p-2 rounded border-l-2 border-emerald-500/50 text-xs hover:bg-gray-800/50 transition">
                  <div className="flex justify-between text-gray-500 mb-1"><span className="font-mono">{log.time}</span><span className="text-emerald-500">+{log.duration}m XP</span></div>
                  <div className="text-gray-300 leading-relaxed">{log.content}</div>
                </div>
              ))) : (<div className="text-center py-8 text-gray-600 text-xs italic border border-dashed border-gray-800 rounded">空空如也... 行动起来！</div>)}
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className={`flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative bg-gradient-to-br ${getBgColor()} transition-colors duration-1000`}>
        
        <div className={`absolute top-6 right-6 z-30 transition-opacity duration-300 ${isZen && isActive ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
           {isZen && <button onClick={() => setIsZen(false)} className="mr-4 bg-gray-800/50 hover:bg-gray-700 text-gray-400 hover:text-white px-3 py-2 rounded text-xs transition">退出禅模式</button>}
           <button onClick={toggleFullScreen} className="bg-gray-800/50 hover:bg-gray-700 text-white p-2 rounded-lg backdrop-blur-sm transition-all shadow-lg">{isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}</button>
        </div>

        <div className={`flex gap-2 md:gap-4 mb-8 md:mb-12 bg-gray-900/80 backdrop-blur-md p-2 rounded-2xl border border-gray-700/50 shadow-2xl z-10 transition-all duration-500 ${isZen ? '-translate-y-40 opacity-0 scale-75 absolute' : 'translate-y-0 opacity-100 scale-100'}`}>
          <button onClick={() => switchMode('focus')} className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'focus' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 scale-105' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}><BookOpen className="w-4 h-4" /> <span className="hidden md:inline">专注学习</span></button>
          <button onClick={() => switchMode('break')} className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'break' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 scale-105' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}><Coffee className="w-4 h-4" /> <span className="hidden md:inline">休息</span></button>
          <button onClick={() => switchMode('gaming')} className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'gaming' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50 scale-105' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}><Gamepad2 className="w-4 h-4" /> <span className="hidden md:inline">奖励时刻</span></button>
        </div>

        <div className={`relative mb-12 group transition-all duration-700 ease-in-out ${isZen ? 'scale-150 md:scale-[2.5]' : 'scale-90 md:scale-100'}`}>
          {!isZen && (<><div className={`absolute inset-0 rounded-full border-4 border-gray-800/50 scale-110`}></div><div className={`absolute inset-0 rounded-full border-4 opacity-20 blur-md transition-all duration-500 ${getThemeColor().split(' ')[0].replace('text', 'border')}`}></div></>)}
          <div className={`rounded-full flex items-center justify-center relative transition-all duration-500 ${isZen ? 'w-64 h-64 border-0' : `w-72 h-72 md:w-80 md:h-80 border-8 bg-gray-900 shadow-[0_0_60px_-15px_rgba(0,0,0,0.6)] ${getThemeColor()}`}`}>
             <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
               {!isZen && <circle cx="50" cy="50" r="44" fill="none" stroke="#1f2937" strokeWidth="4" />}
               <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth={isZen ? "2" : "4"} strokeLinecap="round" strokeDasharray="276" strokeDashoffset={276 - (276 * progress) / 100} className={`transition-all duration-1000 ease-linear ${isZen ? 'text-white/20' : ''}`}/>
             </svg>
             <div className="flex flex-col items-center z-10 select-none">
               <div className={`font-mono font-bold tabular-nums text-center whitespace-nowrap text-white drop-shadow-2xl transition-all duration-500 w-[5ch] ${isZen ? 'text-8xl' : 'text-6xl md:text-7xl'}`}>{formatTime(timeLeft)}</div>
               <div className={`text-sm mt-4 font-bold tracking-widest uppercase transition-all duration-500 ${mode === 'focus' ? 'text-emerald-400' : mode === 'break' ? 'text-blue-400' : 'text-purple-400'} ${isZen ? 'opacity-50' : 'opacity-100'}`}>{mode === 'focus' ? 'DEEP WORK' : mode === 'break' ? 'RECHARGE' : 'GAME ON'}</div>
               {!isZen && mode === 'focus' && isActive && (<div className="text-[10px] text-gray-500 mt-2 bg-gray-800 px-2 py-1 rounded-full animate-pulse border border-gray-700">预计收益: +{Math.floor(initialTime / 60 / 4.5)}m 券</div>)}
             </div>
          </div>
        </div>

        <div className={`flex gap-6 z-10 transition-all duration-300 ${isZen && isActive ? 'opacity-100' : 'opacity-100'}`}>
           {!isActive ? (
             <button onClick={toggleTimer} className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 hover:bg-gray-100 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95"><Play className="w-8 h-8 ml-1" /></button>
           ) : (
             <div className="flex gap-6">
                <button onClick={toggleTimer} className="w-20 h-20 rounded-full bg-gray-800 border-2 border-gray-600 text-white flex items-center justify-center hover:bg-gray-700 hover:border-gray-500 transition-all active:scale-95 shadow-xl"><Pause className="w-8 h-8" /></button>
                <button onClick={triggerStopTimer} className="w-20 h-20 rounded-full bg-red-950/30 border-2 border-red-900/50 text-red-500 flex items-center justify-center hover:bg-red-900/40 hover:border-red-500 transition-all active:scale-95 shadow-xl"><Square className="w-6 h-6" /></button>
             </div>
           )}
           {!isZen && (<button onClick={() => { setIsActive(false); setTimeLeft(initialTime); }} className="absolute bottom-8 right-8 md:static w-12 h-12 rounded-full bg-gray-800/50 border border-gray-700 text-gray-400 flex items-center justify-center hover:text-white hover:border-gray-500 transition-all" title="Reset Timer"><RotateCcw className="w-4 h-4" /></button>)}
        </div>
      </div>

      {/* Modals */}
      {showStopModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-red-500/30 rounded-2xl p-6 max-w-sm w-full shadow-[0_0_50px_rgba(239,68,68,0.2)]">
            <div className="flex items-center gap-4 mb-4 text-red-500"><AlertTriangle className="w-8 h-8" /><h3 className="text-xl font-bold text-white">确定要放弃吗？</h3></div>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">如果现在停止，你本次的努力将<span className="text-red-400 font-bold">不会获得任何奖励</span>。坚持就是胜利！</p>
            <div className="flex gap-3">
              <button onClick={cancelStopTimer} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-colors">继续坚持</button>
              <button onClick={confirmStopTimer} className="flex-1 bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800 font-bold py-3 rounded-xl transition-colors">放弃进度</button>
            </div>
          </div>
        </div>
      )}

      {showLogModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-emerald-500/30 rounded-2xl p-6 max-w-md w-full shadow-[0_0_50px_rgba(16,185,129,0.15)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
            <div className="flex items-center gap-4 mb-6"><div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400"><CheckCircle2 className="w-6 h-6" /></div><div><h3 className="text-xl font-bold text-white">Focus Session Complete!</h3><p className="text-xs text-gray-400">经验值已到账，请记录你的成就</p></div></div>
            <div className="space-y-4">
               <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">本次成果 (Log Content)</label><textarea value={logContent} onChange={(e) => setLogContent(e.target.value)} placeholder="做了什么？(例如：完成了660题第二章前10题，理解了泰勒公式展开...)" className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-gray-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 min-h-[120px] resize-none text-sm placeholder:text-gray-700" autoFocus /></div>
               <button onClick={saveLog} disabled={!logContent.trim()} className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"><Save className="w-4 h-4" /> 存入档案并休息 (+10m 券)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}