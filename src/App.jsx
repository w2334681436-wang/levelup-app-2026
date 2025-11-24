import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Square, RotateCcw, Gamepad2, BookOpen, Coffee, Save, 
  History, Trophy, AlertCircle, X, CheckCircle2, Download, Upload, 
  Settings, Target, Maximize2, Minimize2, AlertTriangle, Sparkles, 
  BrainCircuit, Server, Cpu, RefreshCw, List, Send, Smile, Search, 
  ChevronDown, Zap, MessageCircle, User, Info, Bell, PlusCircle, Clock,
  Home,
  BarChart3,
  TrendingUp,
  Edit,
  Image,
  Trash2,
  Calendar
} from 'lucide-react';

// --- 1. 组件：自定义通知 (Toast) ---
const Toast = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      {notifications.map((note) => (
        <div 
          key={note.id} 
          className={`
            pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-md animate-in slide-in-from-top-2 fade-in
            ${note.type === 'error' ? 'bg-red-950/80 border-red-500/50 text-red-200' : 
              note.type === 'success' ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200' : 
              'bg-gray-900/80 border-gray-700 text-gray-200'}
          `}
        >
          {note.type === 'error' ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : 
           note.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : 
           <Info className="w-5 h-5 flex-shrink-0" />}
          <p className="text-sm font-medium">{note.message}</p>
          <button onClick={() => removeNotification(note.id)} className="ml-auto hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      ))}
    </div>
  );
};

// --- 2. 组件：通用确认框 (Confirm Modal) ---
const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "确定", cancelText = "取消", isDangerous = false }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl transform transition-all scale-100">
        <div className={`flex items-center gap-3 mb-4 ${isDangerous ? 'text-red-500' : 'text-blue-500'}`}>
          {isDangerous ? <AlertTriangle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        <p className="text-gray-300 text-sm mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 rounded-lg transition-colors">
            {cancelText}
          </button>
          <button onClick={onConfirm} className={`flex-1 font-bold py-2.5 rounded-lg transition-colors ${isDangerous ? 'bg-red-900/50 hover:bg-red-800 text-red-100 border border-red-800' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 3. 工具函数 ---
const formatTime = (seconds) => {
  if (seconds < 0) return "00:00";
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

const cleanAIResponse = (text) => {
  if (!text) return '';
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
};

// Markdown 渲染组件
const MarkdownMessage = ({ content }) => {
  if (!content) return null;
  
  // 简单的 markdown 解析
  const parseMarkdown = (text) => {
    // 处理粗体 **text**
    let parsed = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // 处理标题 ### 标题
    parsed = parsed.replace(/### (.*?)(?=\n|$)/g, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>');
    // 处理 ## 标题
    parsed = parsed.replace(/## (.*?)(?=\n|$)/g, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>');
    // 处理列表项 - 或 *
    parsed = parsed.replace(/^[-*] (.*?)(?=\n|$)/gm, '<li class="ml-4">$1</li>');
    // 将连续的列表项包装在 ul 中
    parsed = parsed.replace(/(<li class="ml-4">.*?<\/li>)+/g, '<ul class="list-disc ml-4 my-2">$&</ul>');
    // 处理换行
    parsed = parsed.replace(/\n/g, '<br />');
    
    return parsed;
  };

  return (
    <div 
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  );
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

const API_PROVIDERS = [
  { id: 'siliconflow', name: '硅基流动 (SiliconFlow)', url: 'https://api.siliconflow.cn/v1', defaultModel: 'deepseek-ai/DeepSeek-R1', supportsVision: false },
  { id: 'deepseek', name: 'DeepSeek 官方', url: 'https://api.deepseek.com', defaultModel: 'deepseek-chat', supportsVision: true },
  { id: 'moonshot', name: '月之暗面 (Kimi)', url: 'https://api.moonshot.cn/v1', defaultModel: 'moonshot-v1-8k', supportsVision: false },
  { id: 'aliyun', name: '阿里云 (通义千问)', url: 'https://dashscope.aliyuncs.com/compatible-mode/v1', defaultModel: 'qwen-turbo', supportsVision: false },
  { id: 'openai', name: 'OpenAI (需要梯子)', url: 'https://api.openai.com/v1', defaultModel: 'gpt-4o', supportsVision: true },
  { id: 'doubao', name: '豆包 (字节跳动)', url: 'https://ark.cn-beijing.volces.com/api/v3', defaultModel: 'doubao-1-5-32k-pro', supportsVision: true },
  { id: 'custom', name: '自定义 (Custom)', url: '', defaultModel: '', supportsVision: false }
];

const COMMON_EMOJIS = ['👍', '🔥', '💪', '😭', '🙏', '🎉', '🤔', '💤', '📚', '☕️', '🤖', '👻'];

// 默认人设 - 已移除二次元风格
const DEFAULT_PERSONA = "你是一位专业、耐心的考研导师。请根据学生的学习数据和进度提供有针对性的建议和指导。请使用markdown格式回复，用**粗体**强调重点，用###表示小标题，用-表示列表项。";

const SUBJECT_CONFIG = {
  english: { name: "英语", color: "text-red-400", keyword: ['英语', '单词', '长难句', '语法'] },
  politics: { name: "政治", color: "text-blue-400", keyword: ['政治', '肖秀荣', '腿姐', '史纲', '思修'] },
  math: { name: "专业课一（数学）", color: "text-yellow-400", keyword: ['数学', '高数', '线代', '概统', '660', '1800'] },
  cs: { name: "专业课二（408）", color: "text-purple-400", keyword: ['408', '计组', '数据结构', '操作系统', '计算机网络'] },
};

// 学习进度现在使用 content 字段来存储详细的学习内容
const initialProgress = {
  english: { content: "目前已学习完单词书第一册，开始做长难句分析。", lastUpdate: getTodayDateString() },
  politics: { content: "未开始政治基础学习。", lastUpdate: getTodayDateString() },
  math: { content: "完成了高等数学上册的全部基础知识点梳理和练习。", lastUpdate: getTodayDateString() },
  cs: { content: "数据结构完成了链表和栈的初步学习。", lastUpdate: getTodayDateString() },
};

// --- 4. 组件：学习进度面板 ---
const LearningProgressPanel = ({ learningProgress, onProgressUpdate, isMobileView }) => {
  const [editingSubject, setEditingSubject] = useState(null);
  const [tempContent, setTempContent] = useState(''); // 修改为 tempContent

  const startEdit = (subjectKey, currentContent) => {
    setEditingSubject(subjectKey);
    setTempContent(currentContent);
  };

  const saveEdit = (subjectKey) => {
    // 这里的 onProgressUpdate 接收的是 content 字符串
    onProgressUpdate(subjectKey, tempContent, 'manual');
    setEditingSubject(null);
  };
  
  const subjects = Object.entries(SUBJECT_CONFIG);

  return (
    <div className="bg-[#1a1a20] border border-gray-700/50 rounded-xl p-4 space-y-3 relative z-10 shadow-lg">
      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-cyan-400" /> 学习进度追踪
      </h2>

      {subjects.map(([key, config]) => (
        <div key={key} className="bg-gray-900/50 p-3 rounded-lg border border-gray-800 space-y-2">
          <div className="flex justify-between items-start mb-1">
            <span className={`font-semibold ${config.color}`}>{config.name}</span>
            <button 
              onClick={() => startEdit(key, learningProgress[key].content)}
              className="text-gray-500 hover:text-cyan-400 transition flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-800/50 hover:bg-gray-700"
            >
              <Edit className="w-3 h-3 flex-shrink-0" /> 编辑
            </button>
          </div>
          
          {/* 显示具体的学习内容 */}
          <div className="text-xs text-gray-300 bg-black/30 p-2 rounded-lg max-h-24 overflow-y-auto whitespace-pre-wrap font-mono scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
             {learningProgress[key].content || '暂无详细学习记录。'}
          </div>

          <p className="text-[10px] text-gray-500 mt-1 text-right">上次更新: {learningProgress[key].lastUpdate}</p>
        </div>
      ))}

      {/* Edit Modal - 修改为文本输入 */}
      {editingSubject && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-cyan-500/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">编辑: {SUBJECT_CONFIG[editingSubject].name} 学习内容</h3>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">学习内容详情（可换行，最多 5000 字）</label>
            <textarea 
              value={tempContent} 
              onChange={(e) => setTempContent(e.target.value)}
              className="w-full bg-black/50 border border-gray-700 rounded-xl p-3 text-white font-mono mb-4 min-h-[200px] resize-none text-sm"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setEditingSubject(null)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 rounded-lg transition-colors">取消</button>
              <button onClick={() => saveEdit(editingSubject)} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 rounded-lg transition-colors">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 历史记录查看组件
const HistoryView = ({ history, isOpen, onClose }) => {
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (!isOpen) return null;

  const selectedDateData = history.find(d => d.date === selectedDate);
  const availableDates = history.map(d => d.date).sort((a, b) => new Date(b) - new Date(a));
  
  const totalPages = Math.ceil(availableDates.length / itemsPerPage);
  const paginatedDates = availableDates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#111116] w-full h-full md:max-w-4xl md:h-[85vh] md:rounded-3xl shadow-2xl flex flex-col relative overflow-hidden border border-gray-800">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-cyan-400" />
              历史学习记录
            </h2>
            <p className="text-gray-400 text-sm mt-1">查看往日的学习成果和进度</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white p-2 rounded-full hover:bg-gray-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* 日期列表 */}
          <div className="w-1/3 border-r border-gray-800 flex flex-col">
            <div className="p-4 border-b border-gray-800">
              <h3 className="font-bold text-gray-400 text-sm mb-2">选择日期</h3>
              <div className="flex gap-2 mb-4">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 py-2 rounded text-sm"
                >
                  上一页
                </button>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 py-2 rounded text-sm"
                >
                  下一页
                </button>
              </div>
              <div className="text-xs text-gray-500 text-center">
                第 {currentPage} 页，共 {totalPages} 页
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {paginatedDates.map(date => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`w-full text-left p-3 border-b border-gray-800 hover:bg-gray-800/50 transition ${
                    selectedDate === date ? 'bg-cyan-900/30 border-cyan-500/50' : ''
                  }`}
                >
                  <div className="font-medium text-white">{date}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {history.find(d => d.date === date)?.studyMinutes || 0} 分钟学习
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 详情面板 */}
          <div className="flex-1 p-6 overflow-y-auto">
            {selectedDateData ? (
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  {selectedDate}
                  <span className="text-sm font-normal bg-emerald-900/30 text-emerald-400 px-2 py-1 rounded">
                    {selectedDateData.studyMinutes} 分钟学习
                  </span>
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                    <div className="text-gray-400 text-sm">游戏券余额</div>
                    <div className="text-purple-400 font-bold text-lg">{selectedDateData.gameBank}m</div>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                    <div className="text-gray-400 text-sm">游戏时间使用</div>
                    <div className="text-blue-400 font-bold text-lg">{selectedDateData.gameUsed}m</div>
                  </div>
                </div>

                <h4 className="font-bold text-gray-400 mb-3">学习记录</h4>
                <div className="space-y-3">
                  {selectedDateData.logs && selectedDateData.logs.length > 0 ? (
                    selectedDateData.logs.map((log, index) => (
                      <div key={index} className="bg-[#1a1a20] p-4 rounded-lg border-l-2 border-emerald-500/50">
                        <div className="flex justify-between text-gray-500 text-sm mb-2">
                          <span className="font-mono text-emerald-600">{log.time}</span>
                          <span className="text-emerald-500/80">+{log.duration}m</span>
                        </div>
                        <div className="text-gray-300">{log.content}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      该日期没有学习记录
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-16">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <div>选择日期查看详细记录</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 移动端底部导航组件
const MobileNav = ({ 
  mode, 
  switchMode, 
  startAICoach, 
  showSettings, 
  setShowSettings, 
  todayStats, 
  activeView, 
  setActiveView,
  openManualLog,
  unreadAIMessages,
  showHistory,
  setShowHistory
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#111116] border-t border-gray-800 p-2 z-50">
      <div className="flex justify-around items-center">
        <button 
          onClick={() => setActiveView('timer')}
          className={`flex flex-col items-center p-2 rounded-lg ${activeView === 'timer' ? 'text-cyan-400 bg-cyan-500/20' : 'text-gray-400'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs mt-1">主页</span>
        </button>
        
        <button 
          onClick={() => setActiveView('stats')}
          className={`flex flex-col items-center p-2 rounded-lg ${activeView === 'stats' ? 'text-emerald-400 bg-emerald-500/20' : 'text-gray-400'}`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-xs mt-1">数据</span>
        </button>
        
        <button 
          onClick={() => setShowHistory(true)}
          className="flex flex-col items-center p-2 rounded-lg text-gray-400 hover:text-blue-400"
        >
          <History className="w-5 h-5" />
          <span className="text-xs mt-1">历史</span>
        </button>
        
        <button 
          onClick={openManualLog}
          className="flex flex-col items-center p-2 rounded-lg text-gray-400 hover:text-emerald-400"
        >
          <PlusCircle className="w-5 h-5" />
          <span className="text-xs mt-1">补录</span>
        </button>
        
        <button 
          onClick={startAICoach}
          className="flex flex-col items-center p-2 rounded-lg text-gray-400 hover:text-purple-400 relative"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-xs mt-1">AI导师</span>
          {unreadAIMessages > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
              {unreadAIMessages}
            </span>
          )}
        </button>
        
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="flex flex-col items-center p-2 rounded-lg text-gray-400 hover:text-white"
        >
          <Settings className="w-5 h-5" />
          <span className="text-xs mt-1">设置</span>
        </button>
      </div>
    </div>
  );
};

// --- 5. 主组件 ---
export default function LevelUpApp() {
  const [loading, setLoading] = useState(true);
  
  // 核心状态
  const [mode, setMode] = useState('focus'); 
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isActive, setIsActive] = useState(false);
  const [initialTime, setInitialTime] = useState(45 * 60);
  const [lastActiveTime, setLastActiveTime] = useState(null); // 用于持久化/后台计时
  const [stage, setStage] = useState(getStageInfo());
  const [isZen, setIsZen] = useState(false);
  const [customTargetHours, setCustomTargetHours] = useState(null); // 自定义目标时长
  const [activeView, setActiveView] = useState('timer'); // 移动端视图状态
  
  // 数据状态
  const [todayStats, setTodayStats] = useState({ studyMinutes: 0, gameBank: 0, gameUsed: 0, logs: [] });
  const [history, setHistory] = useState([]);
  const [learningProgress, setLearningProgress] = useState(initialProgress); // 新增学习进度状态
  
  // AI 设置状态
  const [apiKey, setApiKey] = useState(''); 
  const [apiBaseUrl, setApiBaseUrl] = useState('https://api.siliconflow.cn/v1'); 
  const [apiModel, setApiModel] = useState('deepseek-ai/DeepSeek-R1');
  const [selectedProvider, setSelectedProvider] = useState('siliconflow');
  const [customPersona, setCustomPersona] = useState(''); 
  const [deepThinkingMode, setDeepThinkingMode] = useState(false); // 新增：深度思考模式
  
  const [availableModels, setAvailableModels] = useState([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [isModelListOpen, setIsModelListOpen] = useState(false);
  const [modelSearch, setModelSearch] = useState('');
  
  // 聊天状态
  const [chatMessages, setChatMessages] = useState([]); 
  const [chatInput, setChatInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [unreadAIMessages, setUnreadAIMessages] = useState(0);
  const chatEndRef = useRef(null);

  // 图像识别状态
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageDescriptions, setImageDescriptions] = useState({});

  // 界面模态框状态
  const [showLogModal, setShowLogModal] = useState(false);
  const [isManualLog, setIsManualLog] = useState(false); 
  const [manualDuration, setManualDuration] = useState(45); 
  const [showStopModal, setShowStopModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false); 
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [logContent, setLogContent] = useState('');
  const [pendingStudyTime, setPendingStudyTime] = useState(0); 
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 通知与确认框状态
  const [notifications, setNotifications] = useState([]);
  const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, isDangerous: false });
  const [pendingImportData, setPendingImportData] = useState(null);

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const timerRef = useRef(null);
  const appContainerRef = useRef(null);

  // --- 通知系统逻辑 ---
  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const closeConfirm = () => {
    setConfirmState(prev => ({ ...prev, isOpen: false }));
  };

  // --- 数据加载与保存 ---
  const saveLearningProgress = (progress) => {
    setLearningProgress(progress);
    try {
      localStorage.setItem('levelup_progress', JSON.stringify(progress));
    } catch (e) {
      console.error("Progress Save Error", e);
    }
  };

  // 自动更新学习进度的核心逻辑: 从百分比修改为内容追加
  const autoUpdateProgress = (logContent, currentProgress) => {
    // 使用深拷贝来安全修改对象
    const newProgress = JSON.parse(JSON.stringify(currentProgress)); 
    const lowerLog = logContent.toLowerCase();
    const date = getTodayDateString();
    let updated = false;

    Object.entries(SUBJECT_CONFIG).forEach(([key, config]) => {
      const isMatch = config.keyword.some(kw => lowerLog.includes(kw.toLowerCase()));
      if (isMatch) {
        // 新逻辑：追加打卡内容到对应科目的 content
        const existingContent = newProgress[key].content.trim();
        const newEntry = `[${date} 打卡] ${logContent}`;
        
        // 检查打卡内容是否已经包含在现有内容中，避免重复。
        if (!existingContent.includes(newEntry.substring(0, 50))) { 
          const separator = existingContent ? "\n---\n" : "";
          // 限制内容长度，防止 localStorage 溢出
          newProgress[key].content = (existingContent + separator + newEntry).substring(0, 5000); 
          newProgress[key].lastUpdate = date;
          updated = true;
        }
      }
    });
    
    if (updated) {
      saveLearningProgress(newProgress);
    }
    return updated;
  };

  // 保存当前计时器状态 (持久化修复 1)
  const saveTimerState = (active, left, initial, currentMode) => {
    const state = {
      isActive: active,
      timeLeft: left,
      initialTime: initial,
      mode: currentMode,
      timestamp: active ? Date.now() : null, // 仅在计时器活动时记录时间戳
    };
    localStorage.setItem('levelup_timer_state', JSON.stringify(state));
  };

  // 扩展的数据加载函数
  const loadData = () => {
    try {
      const todayStr = getTodayDateString();
      const storedHistoryText = localStorage.getItem('levelup_history');
      let storedHistory = [];
      
      if (storedHistoryText) {
        try {
          storedHistory = JSON.parse(storedHistoryText);
          if (!Array.isArray(storedHistory)) storedHistory = [];
        } catch (e) {
          console.error("JSON Parse Error", e);
          storedHistory = [];
        }
      }
      
      // 加载 AI 和目标设置
      const storedKey = localStorage.getItem('ai_api_key') || '';
      const storedBaseUrl = localStorage.getItem('ai_base_url') || 'https://api.siliconflow.cn/v1';
      const storedModel = localStorage.getItem('ai_model') || 'deepseek-ai/DeepSeek-R1';
      const storedProvider = localStorage.getItem('ai_provider') || 'siliconflow';
      const storedPersona = localStorage.getItem('ai_persona') || '';
      const storedTargetHours = localStorage.getItem('target_hours') ? parseFloat(localStorage.getItem('target_hours')) : null;
      const storedDeepThinking = localStorage.getItem('deep_thinking_mode') === 'true';

      const storedModelList = JSON.parse(localStorage.getItem('ai_model_list') || '[]');
      const storedChat = JSON.parse(localStorage.getItem('ai_chat_history') || '[]');
      const storedUnread = parseInt(localStorage.getItem('ai_unread_messages') || '0');

      // 加载新的学习进度 
      const storedProgressText = localStorage.getItem('levelup_progress');
      let storedProgress = initialProgress;
      if (storedProgressText) {
        try { 
          const parsed = JSON.parse(storedProgressText);
          // 兼容旧的 progress 结构，如果发现是数字，则使用 initialProgress 默认内容
          if (parsed.english && typeof parsed.english.progress === 'number') {
             // 发现旧的进度条格式，使用默认内容
             storedProgress = initialProgress;
          } else {
             storedProgress = parsed;
          }
        } catch (e) { 
          console.error("Progress JSON Error", e); 
          storedProgress = initialProgress;
        }
      }
      
      setLearningProgress(storedProgress);
      setHistory(storedHistory);
      setApiKey(storedKey);
      setApiBaseUrl(storedBaseUrl);
      setApiModel(storedModel);
      setSelectedProvider(storedProvider);
      setCustomPersona(storedPersona);
      setCustomTargetHours(storedTargetHours);
      setDeepThinkingMode(storedDeepThinking);
      setAvailableModels(storedModelList);
      setChatMessages(storedChat);
      setUnreadAIMessages(storedUnread);

      const todayData = storedHistory.find(d => d.date === todayStr);
      if (todayData) {
        setTodayStats(todayData);
      } else {
        let lastBank = 0;
        if (storedHistory.length > 0) lastBank = storedHistory[0].gameBank || 0;
        setTodayStats({ date: todayStr, studyMinutes: 0, gameBank: lastBank > 0 ? lastBank : 0, gameUsed: 0, logs: [] });
      }

      // 检查并恢复计时器状态
      const storedTimerStateText = localStorage.getItem('levelup_timer_state');
      if (storedTimerStateText) {
        const storedTimerState = JSON.parse(storedTimerStateText);
        
        if (storedTimerState.isActive && storedTimerState.timestamp) {
          const elapsed = (Date.now() - storedTimerState.timestamp) / 1000;
          const recoveredTimeLeft = storedTimerState.timeLeft - elapsed;

          if (recoveredTimeLeft > 1) { // 至少恢复 1 秒
            setTimeLeft(Math.floor(recoveredTimeLeft));
            setInitialTime(storedTimerState.initialTime);
            setMode(storedTimerState.mode);
            // 延迟设置 isActive，让 useEffect 处理计时器启动
            setTimeout(() => {
                setIsActive(true);
                addNotification(`倒计时已从上次进度恢复: ${formatTime(Math.floor(recoveredTimeLeft))}`, "success");
            }, 100); 
            
          } else {
            // 时间已耗尽，当作完成处理 (或停止)
            addNotification("应用恢复，但计时器已超时，请重新开始或打卡。", "info");
            saveTimerState(false, 45 * 60, 45 * 60, 'focus'); // 重置状态
          }
        } else {
          // 恢复非活动状态的参数 (模式/初始时间)
          setInitialTime(storedTimerState.initialTime);
          setTimeLeft(storedTimerState.timeLeft);
          setMode(storedTimerState.mode);
        }
      }
    } catch (e) { 
      console.error("Load Error", e); 
      addNotification("数据加载遇到一些小问题，已重置为安全状态。", "error");
    }
    setLoading(false);
  };

  const saveData = (newTodayStats) => {
    try {
      const todayStr = getTodayDateString();
      let storedHistory = [...history]; 
      storedHistory = storedHistory.filter(d => d.date !== todayStr);
      storedHistory.unshift(newTodayStats);
      storedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
      localStorage.setItem('levelup_history', JSON.stringify(storedHistory));
      setTodayStats(newTodayStats);
      setHistory(storedHistory);
    } catch (e) { 
      console.error("Save Error", e);
      addNotification("保存数据失败，可能是存储空间已满。", "error");
    }
  };
  
  // 更新学习进度: 现在接收 newContent 字符串
  const handleProgressUpdate = (subjectKey, newContent, type = 'manual') => {
    setLearningProgress(prev => {
      const updated = {
        ...prev,
        [subjectKey]: {
          content: newContent,
          lastUpdate: getTodayDateString()
        }
      };
      saveLearningProgress(updated);
      if (type === 'manual') {
        addNotification(`${SUBJECT_CONFIG[subjectKey].name} 学习内容已更新`, "info");
      }
      return updated;
    });
  };

  const saveAISettings = (key, baseUrl, model, provider, persona, modelList = availableModels) => {
    setApiKey(key); setApiBaseUrl(baseUrl); setApiModel(model); setSelectedProvider(provider); setCustomPersona(persona); setAvailableModels(modelList);
    localStorage.setItem('ai_api_key', key);
    localStorage.setItem('ai_base_url', baseUrl);
    localStorage.setItem('ai_model', model);
    localStorage.setItem('ai_provider', provider);
    localStorage.setItem('ai_persona', persona);
    localStorage.setItem('ai_model_list', JSON.stringify(modelList));
  };

  const saveTargetHours = (hours) => {
    setCustomTargetHours(hours);
    if (hours) {
      localStorage.setItem('target_hours', hours);
    } else {
      localStorage.removeItem('target_hours');
    }
  }

  // 保存深度思考模式设置
  const saveDeepThinkingMode = (enabled) => {
    setDeepThinkingMode(enabled);
    localStorage.setItem('deep_thinking_mode', enabled.toString());
  };

  // 保存未读消息数
  const saveUnreadMessages = (count) => {
    setUnreadAIMessages(count);
    localStorage.setItem('ai_unread_messages', count.toString());
  };

  useEffect(() => {
    if (chatMessages.length > 0) {
      const recent = chatMessages.slice(-50);
      localStorage.setItem('ai_chat_history', JSON.stringify(recent));
    }
  }, [chatMessages]);

  useEffect(() => { loadData(); }, []);

  // 计时器核心逻辑 - 修复游戏模式防刷时长
  useEffect(() => {
    const handleVisibilityChange = () => {
      const storedTimerStateText = localStorage.getItem('levelup_timer_state');
      if (!storedTimerStateText) return;
      const storedTimerState = JSON.parse(storedTimerStateText);

      if (document.visibilityState === 'hidden' && isActive) {
        // Tab hidden: Save state
        saveTimerState(true, timeLeft, initialTime, mode);
        // Pause interval immediately
        clearInterval(timerRef.current);
        timerRef.current = null;
        
      } else if (document.visibilityState === 'visible' && storedTimerState.isActive) {
        // Tab visible: Recalculate and resume
        const now = Date.now();
        const elapsed = (now - storedTimerState.timestamp) / 1000;
        const recoveredTimeLeft = storedTimerState.timeLeft - elapsed;

        if (recoveredTimeLeft > 1) {
          setTimeLeft(Math.floor(recoveredTimeLeft));
          setIsActive(true); 
          addNotification("屏幕/切屏恢复，计时器继续！", "info");
        } else {
          // 超时了
          handleTimerComplete();
        }
      }
    };
    
    // 添加事件监听器
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Timer Interval logic
    if (isActive && timeLeft > 0) {
      // 在启动计时器时，保存状态以确保持久化
      saveTimerState(true, timeLeft, initialTime, mode); 
      timerRef.current = setInterval(() => { 
        setTimeLeft((prev) => {
          const newTime = Math.max(0, prev - 1);
          // 每秒更新持久化状态的时间
          saveTimerState(true, newTime, initialTime, mode); 
          return newTime;
        }); 
      }, 1000);
    } else if (timeLeft <= 0 && isActive) {
      handleTimerComplete();
    } else if (!isActive) {
      // 停止时保存非活动状态的参数
      saveTimerState(false, timeLeft, initialTime, mode);
    }
    
    // 清理函数
    return () => {
      clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, timeLeft, initialTime, mode]);

  // 自动复盘逻辑
  useEffect(() => {
    const checkDailyReview = () => {
      const lastReviewDate = localStorage.getItem('last_ai_review_date');
      const today = getTodayDateString();
      
      if (lastReviewDate !== today) {
        const yesterday = getYesterdayDateString();
        const yesterdayData = history.find(d => d.date === yesterday);
        
        if (yesterdayData && yesterdayData.studyMinutes > 0) {
          // 自动发送复盘消息
          const reviewMessage = {
            role: 'assistant',
            content: `📊 昨日学习复盘提醒\n\n昨天（${yesterday}）你学习了 ${(yesterdayData.studyMinutes/60).toFixed(1)} 小时，完成了 ${yesterdayData.logs.length} 个学习任务。需要我帮你分析一下学习效果和制定今日计划吗？`
          };
          
          setChatMessages(prev => [...prev, reviewMessage]);
          saveUnreadMessages(unreadAIMessages + 1);
          localStorage.setItem('last_ai_review_date', today);
        }
      }
    };

    // 每天检查一次
    const now = new Date();
    const timeUntilNextCheck = (24 * 60 * 60 * 1000) - (now.getHours() * 60 * 60 * 1000 + now.getMinutes() * 60 * 1000 + now.getSeconds() * 1000);
    
    const timer = setTimeout(() => {
      checkDailyReview();
      // 之后每天检查一次
      setInterval(checkDailyReview, 24 * 60 * 60 * 1000);
    }, timeUntilNextCheck);

    return () => clearTimeout(timer);
  }, [history, unreadAIMessages]);

  useEffect(() => { 
    if (showChatModal) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, showChatModal, aiThinking]);

  useEffect(() => {
    const handleFsChange = () => { setIsFullscreen(!!document.fullscreenElement); };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // --- 逻辑处理 ---
  const updateStudyStats = (seconds, log) => {
    const m = Math.floor(seconds / 60);
    const g = Math.floor(m / 4.5); 
    const newStats = { 
      ...todayStats, 
      studyMinutes: todayStats.studyMinutes + m, 
      gameBank: todayStats.gameBank + g, 
      logs: [...todayStats.logs, { time: new Date().toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit'}), content: log, duration: m }] 
    };
    saveData(newStats);
    // 自动更新进度 (从 log content 提取信息并追加)
    autoUpdateProgress(log, learningProgress); 
  };

  const updateGameStats = (seconds) => {
    const m = Math.floor(seconds / 60);
    saveData({ ...todayStats, gameUsed: todayStats.gameUsed + m, gameBank: Math.max(0, todayStats.gameBank - m) });
  };

  const switchMode = (newMode) => {
    setIsActive(false);
    setIsZen(false);
    
    if (newMode === 'gaming') {
      if (todayStats.gameBank <= 0) {
        addNotification("⛔ 你的游戏券余额为0！请先去专注学习！", "error");
        setMode('focus');
        setInitialTime(45 * 60);
        setTimeLeft(45 * 60);
        return;
      }
      const availableSeconds = todayStats.gameBank * 60;
      setMode(newMode);
      setInitialTime(availableSeconds);
      setTimeLeft(availableSeconds);
    } else {
      setMode(newMode);
      if (newMode === 'focus') {
        const defaultFocusTime = 45 * 60;
        setInitialTime(defaultFocusTime);
        setTimeLeft(defaultFocusTime);
      } else if (newMode === 'break') {
        const defaultBreakTime = 10 * 60;
        setInitialTime(defaultBreakTime); 
        setTimeLeft(defaultBreakTime);
      }
    }
    // 切换模式时立即保存状态
    saveTimerState(false, timeLeft, initialTime, newMode);
  };

  // 打开手动打卡
  const openManualLog = () => {
    setIsManualLog(true);
    setManualDuration(45); 
    setLogContent('');
    setShowLogModal(true);
  };

  const saveLog = () => { 
    if(logContent.trim()){ 
      const durationToSave = isManualLog ? (manualDuration * 60) : pendingStudyTime;
      
      updateStudyStats(durationToSave, logContent); 
      setShowLogModal(false); 
      setLogContent(''); 
      setIsManualLog(false);
      
      if (isManualLog) {
          addNotification(`成功补录 ${manualDuration} 分钟学习记录！`, "success");
      } else {
          addNotification("学习记录已保存，休息一下吧！", "success");
          switchMode('break'); 
      }
      // 成功保存日志后，重置持久化计时器状态
      saveTimerState(false, 45 * 60, 45 * 60, 'focus'); 
    }
  };

  const handleTimerComplete = () => {
    setIsActive(false); 
    setIsZen(false);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    clearInterval(timerRef.current);
    
    // 完成后清除持久化计时状态
    localStorage.removeItem('levelup_timer_state');
    
    if (mode === 'focus') {
      setPendingStudyTime(initialTime); 
      setIsManualLog(false); 
      setShowLogModal(true);
    } else if (mode === 'gaming') {
      updateGameStats(initialTime); 
      addNotification("⚠️ 游戏时间耗尽！该回去学习了！", "error");
      switchMode('focus');
    } else { 
      addNotification("🔔 休息结束！开始专注吧。", "info");
      switchMode('focus');
    }
  };

  const toggleFullScreen = async () => {
    if (!appContainerRef.current) return;
    const isFullscreenAvailable = document.fullscreenEnabled || document.webkitFullscreenEnabled;
    if (!isFullscreenAvailable) {
      addNotification("您的浏览器不支持全屏模式", "error");
      return;
    }

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
      addNotification("余额不足，无法开始游戏！", "error");
      return;
    }
    
    // 如果是从非活动状态切换到活动状态
    if (!isActive) {
      // 确保在启动前保存最新的 `timeLeft` 和 `initialTime`
      saveTimerState(true, timeLeft, initialTime, mode);
      setIsActive(true);
      if (mode === 'focus') {
        setIsZen(true);
        if (appContainerRef.current && document.fullscreenEnabled) {
             appContainerRef.current.requestFullscreen().catch(() => {});
        }
      }
    } else {
      // 如果是从活动状态切换到暂停
      saveTimerState(false, timeLeft, initialTime, mode);
      setIsActive(false);
    }
  };

  const triggerStopTimer = () => setShowStopModal(true);
  
  const confirmStopTimer = () => { 
    setShowStopModal(false); 
    setIsActive(false); 
    setIsZen(false); 
    
    // 重置并保存非活动状态
    const newTimeLeft = initialTime;
    setTimeLeft(newTimeLeft); 
    saveTimerState(false, newTimeLeft, initialTime, mode);

    if(document.fullscreenElement) document.exitFullscreen().catch(()=>{}); 
    if(mode==='gaming') updateGameStats(initialTime-timeLeft); 
    addNotification("计时已取消", "info");
  };
  
  const cancelStopTimer = () => setShowStopModal(false);

  // 扩展的导入导出函数
  const handleExportData = () => {
    try {
      const exportData = {
        version: '2.0',
        exportDate: new Date().toISOString(),
        history: history,
        progress: learningProgress,
        settings: {
          customTargetHours: customTargetHours,
          customPersona: customPersona,
          selectedProvider: selectedProvider,
          apiBaseUrl: apiBaseUrl,
          apiModel: apiModel
          // 注意：不导出 API Key 出于安全考虑
        }
      };
      const str = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const a = document.createElement('a'); 
      a.href = str; 
      a.download = `LevelUp_Backup_${getTodayDateString()}.json`; 
      document.body.appendChild(a); 
      a.click(); 
      document.body.removeChild(a);
      addNotification("完整数据导出成功！", "success");
    } catch(err) {
      addNotification("导出失败，请重试。", "error");
    }
  };
  
  const handleImportData = (e) => {
    const f = e.target.files[0]; 
    if(!f) return; 
    
    const r = new FileReader();
    r.onload = (ev) => { 
      try { 
        const d = JSON.parse(ev.target.result); 
        
        // 版本兼容性处理
        if (d.version === '2.0') {
          // 新版本格式
          setPendingImportData(d);
          setConfirmState({
            isOpen: true,
            title: "导入完整备份",
            message: `检测到完整备份文件（版本 ${d.version}）。导入将覆盖当前的所有学习数据、进度和设置（除API Key外）。确定继续吗？`,
            onConfirm: () => confirmImportData(d),
            isDangerous: true,
            confirmText: "覆盖并导入"
          });
        } else if (Array.isArray(d)) {
          // 旧版本格式（只有历史记录）
          setPendingImportData({ history: d, progress: initialProgress });
          setConfirmState({
            isOpen: true,
            title: "导入旧版备份",
            message: `检测到旧版备份文件（${d.length} 条历史记录）。导入将覆盖当前的历史记录。确定继续吗？`,
            onConfirm: () => confirmImportData({ history: d, progress: initialProgress }),
            isDangerous: true,
            confirmText: "覆盖并导入"
          });
        } else if (d.history) {
          // 兼容旧版对象格式
          setPendingImportData(d);
          setConfirmState({
            isOpen: true,
            title: "导入备份",
            message: `解析到 ${d.history.length} 条历史记录。导入将覆盖当前的历史记录和学习进度，确定继续吗？`,
            onConfirm: () => confirmImportData(d),
            isDangerous: true,
            confirmText: "覆盖并导入"
          });
        } else {
          addNotification("文件格式错误：必须是有效的备份文件。", "error");
        }
      } catch(err){
        addNotification("文件解析失败，请检查文件是否损坏。", "error");
      } 
    };
    r.readAsText(f);
    e.target.value = '';
  };

  const confirmImportData = (data) => {
    try {
      // 导入历史记录和学习进度
      localStorage.setItem('levelup_history', JSON.stringify(data.history));
      localStorage.setItem('levelup_progress', JSON.stringify(data.progress || initialProgress));
      
      // 如果是新版本格式，导入设置
      if (data.version === '2.0' && data.settings) {
        const settings = data.settings;
        if (settings.customTargetHours !== undefined) {
          localStorage.setItem('target_hours', settings.customTargetHours);
        }
        if (settings.customPersona) {
          localStorage.setItem('ai_persona', settings.customPersona);
        }
        if (settings.selectedProvider) {
          localStorage.setItem('ai_provider', settings.selectedProvider);
        }
        if (settings.apiBaseUrl) {
          localStorage.setItem('ai_base_url', settings.apiBaseUrl);
        }
        if (settings.apiModel) {
          localStorage.setItem('ai_model', settings.apiModel);
        }
      }
      
      loadData();
      closeConfirm();
      addNotification("数据导入成功！", "success");
      setPendingImportData(null);
    } catch (error) {
      addNotification("导入过程中出现错误: " + error.message, "error");
    }
  };

  // AI 相关函数
  const fetchAvailableModels = async () => {
    if (!apiKey) return addNotification("请先输入 API Key！", "error");
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
        saveAISettings(apiKey, apiBaseUrl, apiModel, selectedProvider, customPersona, models);
        setIsModelListOpen(true); 
        addNotification(`成功获取 ${models.length} 个模型`, "success");
      } else {
        addNotification("获取成功，但返回格式无法解析。", "error");
      }
    } catch (error) {
      addNotification(`获取失败: ${error.message}`, "error");
    } finally {
      setIsFetchingModels(false);
    }
  };

  // 图像处理函数
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedImages.length > 5) {
      addNotification("最多只能上传5张图片", "error");
      return;
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }));

    setSelectedImages(prev => [...prev, ...newImages]);
    e.target.value = '';
  };

  const removeImage = (id) => {
    setSelectedImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  // 图像识别函数
  const analyzeImage = async (imageFile, provider) => {
    if (provider === 'deepseek') {
      // DeepSeek 多模态API
      const formData = new FormData();
      formData.append('model', 'deepseek-chat');
      formData.append('messages', JSON.stringify([{
        role: 'user',
        content: [
          { type: 'text', text: '请分析这张图片中的内容，特别是如果包含题目，请详细解答。' },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${await fileToBase64(imageFile)}` } }
        ]
      }]));
      
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: '请分析这张图片中的内容，特别是如果包含题目，请详细解答。' },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${await fileToBase64(imageFile)}` } }
            ]
          }]
        })
      });

      if (!response.ok) throw new Error('DeepSeek API 调用失败');
      const data = await response.json();
      return data.choices[0].message.content;
    } else if (provider === 'doubao') {
      // 豆包多模态API
      const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'doubao-1-5-32k-pro-vision',
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: '请分析这张图片中的内容' },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${await fileToBase64(imageFile)}` } }
            ]
          }]
        })
      });

      if (!response.ok) throw new Error('豆包 API 调用失败');
      const data = await response.json();
      return data.choices[0].message.content;
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  // 修改后的 AI 发送函数，支持深度思考模式
  const sendToAI = async (newMessages, images = []) => {
    setAiThinking(true);
    try {
      const cleanBaseUrl = apiBaseUrl.replace(/\/$/, '');
      const endpoint = `${cleanBaseUrl}/chat/completions`;
      
      // 构建消息内容
      let messages = [...newMessages];
      
      // 如果有图片，添加到最后一条用户消息
      if (images.length > 0 && (selectedProvider === 'deepseek' || selectedProvider === 'doubao')) {
        const lastUserMessage = messages[messages.length - 1];
        if (lastUserMessage.role === 'user') {
          // 对于支持多模态的API，构建包含图片的消息
          lastUserMessage.content = [
            { type: 'text', text: lastUserMessage.content },
            ...images.map(img => ({
              type: 'image_url',
              image_url: { url: img.preview }
            }))
          ];
        }
      }
      
      // 根据深度思考模式调整参数
      const requestBody = {
        model: apiModel,
        messages: messages,
        temperature: deepThinkingMode ? 0.3 : 0.7, // 深度思考模式温度更低，更确定
        max_tokens: deepThinkingMode ? 4000 : 2000, // 深度思考模式允许更多token
        stream: false
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || JSON.stringify(data));

      if (data.choices && data.choices.length > 0) {
        const rawReply = data.choices[0].message.content;
        const cleanReply = cleanAIResponse(rawReply);
        setChatMessages(prev => [...prev, { role: 'assistant', content: cleanReply }]);
        
        // 如果不是在聊天窗口中，增加未读消息计数
        if (!showChatModal) {
          saveUnreadMessages(unreadAIMessages + 1);
        }
      }
    } catch (error) {
      const errorMessage = `⚠️ 连接失败: ${error.message}`;
      setChatMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
      
      if (!showChatModal) {
        saveUnreadMessages(unreadAIMessages + 1);
      }
    } finally {
      setAiThinking(false);
    }
  };

  // AI 导师启动逻辑 (修复人设bug)
  const startAICoach = () => {
    if (!apiKey) {
      addNotification("请先在设置中输入 API Key！", "error");
      setShowSettings(true);
      return;
    }
    setShowChatModal(true);
    saveUnreadMessages(0); // 清除未读消息
    
    // 使用最新的人设设置
    const currentPersona = customPersona.trim() || DEFAULT_PERSONA;
    
    // 如果是新对话，生成系统上下文
    if (chatMessages.length === 0 || chatMessages.length === 1 && chatMessages[0].role === 'system') {
      const yesterdayStr = getYesterdayDateString();
      const yesterdayData = history.find(d => d.date === yesterdayStr);
      
      const target = customTargetHours || stage.targetHours;

      // 组装实时数据上下文
      let dataContext = `
        --- 实时学习数据 ---
        1. 考研目标: 上海交大/中科大AI硕士(2026)。
        2. 每日目标学习时长: ${target}小时。
        3. 今日(${getTodayDateString()})统计: 已学习 ${(todayStats.studyMinutes / 60).toFixed(1)}h, 游戏券余额 ${todayStats.gameBank}m。
        4. 学习进度板 (最新的学习内容和状态):
           - 英语: ${learningProgress.english.content || '暂无记录'} (更新于 ${learningProgress.english.lastUpdate})
           - 政治: ${learningProgress.politics.content || '暂无记录'} (更新于 ${learningProgress.politics.lastUpdate})
           - 数学: ${learningProgress.math.content || '暂无记录'} (更新于 ${learningProgress.math.lastUpdate})
           - 408: ${learningProgress.cs.content || '暂无记录'} (更新于 ${learningProgress.cs.lastUpdate})
      `;

      if (yesterdayData) {
        const studyHours = (yesterdayData.studyMinutes / 60).toFixed(1);
        dataContext += `\n5. 昨日(${yesterdayStr})统计: 学习 ${studyHours}h (目标 ${target}h), 玩 ${yesterdayData.gameUsed}m。昨日日志摘要: ${yesterdayData.logs.map(l => typeof l.content === 'string' ? l.content : '日志').join('; ')}`;
      } else {
        dataContext += `\n5. 昨日(${yesterdayStr})无学习记录。`;
      }

      // 提示 AI 导师根据学习内容评估进度
      const systemContext = `${currentPersona}\n\n${dataContext}\n\n根据以上学习内容和你的专业知识，评估用户当前学习阶段（${stage.name}）的进度是落后、正常还是超前，并用你的人设给出简洁的分析、建议或鼓励。请使用markdown格式回复，用**粗体**强调重点，用###表示小标题，用-表示列表项。`;

      const initialMsg = { role: 'system', content: systemContext };
      const triggerMsg = { role: 'user', content: "导师，请评估我当前的整体学习情况和进度。" };
      
      const newHistory = [initialMsg, triggerMsg];
      setChatMessages(newHistory); 
      sendToAI(newHistory);
    }
  };

  // 新对话功能
  const startNewChat = () => {
    setChatMessages([]);
    addNotification("已开始新的对话", "info");
  };

  // 清除聊天记录
  const clearChatHistory = () => {
    setConfirmState({
      isOpen: true,
      title: "清除聊天记录",
      message: "确定要清除所有聊天记录吗？此操作不可撤销。",
      onConfirm: () => {
        setChatMessages([]);
        localStorage.removeItem('ai_chat_history');
        closeConfirm();
        addNotification("聊天记录已清除", "success");
      },
      isDangerous: true,
      confirmText: "确定清除"
    });
  };

  // 修改 handleUserSend 中的上下文快照 (修复人设bug)
  const handleUserSend = () => {
    if (!chatInput.trim() && selectedImages.length === 0) return;
    
    // 使用最新的人设设置
    const currentPersona = customPersona.trim() || DEFAULT_PERSONA;
    
    // 创建用户消息，包含图片信息
    const userMessage = { 
      role: 'user', 
      content: chatInput,
      images: selectedImages.length > 0 ? [...selectedImages] : undefined
    };
    
    // 每次发送用户消息时，携带最新的进度板快照（摘要形式）
    // 截取前50个字符作为摘要，以减少 token 消耗
    const getSummary = (content) => content ? content.trim().substring(0, 50) + (content.length > 50 ? '...' : '') : '暂无记录';

    const progressSummary = `
      英语: ${getSummary(learningProgress.english.content)} | 
      数学: ${getSummary(learningProgress.math.content)} | 
      政治: ${getSummary(learningProgress.politics.content)} |
      408: ${getSummary(learningProgress.cs.content)}
    `;
    
    const currentContext = { 
      role: 'system', 
      content: `${currentPersona}\n\n[实时数据快照 - 关键进度摘要: ${progressSummary.trim().replace(/\s+/g, ' ')}。今日已学: ${(todayStats.studyMinutes / 60).toFixed(1)}h。]`
    };

    const updatedHistory = [...chatMessages, currentContext, userMessage];
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setShowEmojiPicker(false);
    sendToAI(updatedHistory, selectedImages);
    setSelectedImages([]); // 发送后清空图片
  };

  const handleEmojiClick = (emoji) => {
    setChatInput(prev => prev + emoji);
  };

  // --- 变量计算 (Render Before Return) ---
  const progress = initialTime > 0 ? ((initialTime - timeLeft) / initialTime) * 100 : 0;
  const currentTargetHours = customTargetHours || stage.targetHours;
  const dailyProgressPercent = currentTargetHours > 0 ? Math.min((todayStats.studyMinutes / (currentTargetHours*60)) * 100, 100) : 0;

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

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center font-mono animate-pulse">正在载入系统...</div>;

  return (
    <div ref={appContainerRef} className={`h-[100dvh] w-full bg-[#0a0a0a] text-gray-100 font-sans flex flex-col md:flex-row overflow-hidden relative selection:bg-cyan-500/30`}>
      {/* Toast Notification Layer */}
      <Toast notifications={notifications} removeNotification={removeNotification} />
      
      {/* Confirm Dialog Layer */}
      <ConfirmDialog 
        isOpen={confirmState.isOpen} 
        title={confirmState.title} 
        message={confirmState.message} 
        onConfirm={confirmState.onConfirm} 
        onCancel={closeConfirm}
        isDangerous={confirmState.isDangerous}
        confirmText={confirmState.confirmText}
      />

      {/* 历史记录查看模态框 */}
      <HistoryView 
        history={history}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />

      {/* 背景纹理 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,20,40,0.4),transparent_70%)] pointer-events-none"></div>
      <div className="absolute inset-0 opacity-5 pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>

      {/* 桌面端侧边栏 - 已设置 h-full 和 overflow-y-auto 实现滚动 */}
      <div className={`hidden md:flex flex-col w-96 bg-[#111116] border-r border-gray-800 p-6 gap-4 overflow-y-auto z-20 h-full relative group scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        <div className="flex justify-between items-start relative z-10 flex-shrink-0">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">LEVEL UP!</h1>
            <p className="text-[10px] text-gray-500 font-mono flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-500"/> CHAT COACH EDITION</p>
          </div>
          <button onClick={() => setShowSettings(!showSettings)} className="text-gray-500 hover:text-white transition p-1 hover:bg-gray-800 rounded-full"><Settings className="w-5 h-5" /></button>
        </div>

        <button onClick={startAICoach} className="w-full relative overflow-hidden group bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 hover:border-purple-400 text-white font-bold py-3 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.2)] flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <MessageCircle className="w-5 h-5 text-purple-400 group-hover:text-white transition-colors" /> 
          <span className="relative z-10">进入 AI 导师通信终端</span>
          {unreadAIMessages > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              {unreadAIMessages}
            </span>
          )}
        </button>

        <button 
          onClick={() => setShowHistory(true)}
          className="w-full bg-blue-900/30 border border-blue-500/30 hover:border-blue-400 text-blue-400 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          <History className="w-5 h-5" />
          查看历史记录
        </button>

        {showSettings && (
          <div className="bg-[#1a1a20] border border-gray-700 rounded-lg p-4 text-xs animate-in fade-in slide-in-from-top-2 space-y-4 relative z-50 flex-shrink-0">
            {/* AI Settings - 桌面端侧边栏已包含配置 */}
          </div>
        )}
        
        {/* 新增：学习进度面板 (内容已修改) */}
        <LearningProgressPanel 
          learningProgress={learningProgress} 
          onProgressUpdate={handleProgressUpdate}
          isMobileView={false}
        />

        {/* 状态卡片 */}
        <div className={`rounded-xl p-3 md:p-4 border-l-4 ${stage.borderColor} ${stage.bg} relative overflow-hidden z-0 flex-shrink-0`}>
          <div className="flex items-center gap-2 mb-1 relative z-10"><Target className={`w-4 h-4 ${stage.color}`} /><span className={`text-xs font-bold ${stage.color} tracking-widest uppercase`}>STAGE: {stage.name}</span></div>
          <div className="pl-6 relative z-10">
            <div className="flex justify-between text-xs mb-1 text-gray-400">
               <span>DAILY TARGET</span>
               <span className="font-mono flex items-center gap-1">
                 {customTargetHours && <span className="text-[10px] bg-gray-700 px-1 rounded text-white" title="自定义目标">自定义</span>}
                 {currentTargetHours}h
               </span>
            </div>
            <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden"><div className={`h-full ${stage.color.replace('text', 'bg')} transition-all duration-1000 shadow-[0_0_10px_currentColor]`} style={{ width: `${dailyProgressPercent}%` }}></div></div>
            <div className="text-[10px] text-gray-500 mt-1 text-right font-mono">{(todayStats.studyMinutes/60).toFixed(1)}h / {currentTargetHours}h</div>
          </div>
        </div>
        
        {/* 日志列表 + 手动补录按钮 */}
        <div className="flex items-center justify-between px-1 mt-2 mb-1 relative z-0 flex-shrink-0">
            <span className="text-xs font-bold text-gray-500">TODAY'S LOGS</span>
            <button 
              onClick={openManualLog}
              className="text-[10px] flex items-center gap-1 bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded hover:bg-emerald-800/50 transition-colors"
            >
              <PlusCircle className="w-3 h-3" /> 补录
            </button>
        </div>

        {/* 日志列表容器 - flex-1 确保它占据剩余空间并可滚动 */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-1 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent relative z-0">
           {todayStats.logs && todayStats.logs.slice().reverse().map((log, i) => (
             <div key={i} className="bg-[#1a1a20] p-3 rounded border-l-2 border-emerald-500/50 text-xs text-gray-300 relative group hover:bg-[#222228] transition-colors">
               <div className="flex justify-between text-gray-500 mb-1"><span className="font-mono text-emerald-600">{log.time}</span><span className="text-emerald-500/80">+{log.duration}m XP</span></div>
               <div className="truncate">{typeof log.content === 'string' ? log.content : 'Log Entry'}</div>
             </div>
           ))}
        </div>
      </div>

      {/* 移动端底部导航 */}
      <MobileNav 
        mode={mode}
        switchMode={switchMode}
        startAICoach={startAICoach}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        todayStats={todayStats}
        activeView={activeView}
        setActiveView={setActiveView}
        openManualLog={openManualLog}
        unreadAIMessages={unreadAIMessages}
        showHistory={showHistory}
        setShowHistory={setShowHistory}
      />

      {/* Main Timer Area */}
      <div className={`flex-1 flex flex-col items-center justify-center p-4 relative bg-gradient-to-br ${getBgColor()} transition-colors duration-1000 overflow-hidden pb-20 md:pb-4`}>
        
        {/* 移动端视图切换 (主页) */}
        <div className={`md:hidden w-full mb-4 ${activeView !== 'timer' ? 'hidden' : ''}`}>
          <div className="flex gap-2 bg-gray-900/80 backdrop-blur-md p-2 rounded-2xl border border-gray-700/50 shadow-2xl z-10">
            <button 
              onClick={() => switchMode('focus')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'focus' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <BookOpen className="w-4 h-4" /> <span>学习</span>
            </button>
            <button 
              onClick={() => switchMode('break')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'break' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Coffee className="w-4 h-4" /> <span>休息</span>
            </button>
            <button 
              onClick={() => switchMode('gaming')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'gaming' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Gamepad2 className="w-4 h-4" /> <span>游戏</span>
            </button>
          </div>
        </div>

        {/* 移动端数据视图 */}
        <div className={`md:hidden w-full space-y-4 pt-4 overflow-y-auto ${activeView !== 'stats' ? 'hidden' : ''}`}>
          <div className="bg-[#111116] rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">今日学习数据</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">学习时长</span>
                <span className="text-white font-mono">{(todayStats.studyMinutes/60).toFixed(1)}h</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">游戏余额</span>
                <span className="text-purple-400 font-mono">{todayStats.gameBank}m</span>
              </div>
              
              <div className="pt-2 border-t border-gray-800">
                <div className="flex justify-between text-xs mb-1 text-gray-400">
                  <span>目标进度</span>
                  <span className="font-mono">{currentTargetHours}h</span>
                </div>
                <div className="h-2 w-full bg-black/30 rounded-full overflow-hidden">
                  <div className={`h-full bg-emerald-500 transition-all duration-1000`} style={{ width: `${dailyProgressPercent}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <LearningProgressPanel 
            learningProgress={learningProgress} 
            onProgressUpdate={handleProgressUpdate}
            isMobileView={true}
          />
          
          <div className="bg-[#111116] rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <History className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">学习记录</h2>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {todayStats.logs && todayStats.logs.slice().reverse().map((log, i) => (
                <div key={i} className="bg-[#1a1a20] p-3 rounded border-l-2 border-emerald-500/50 text-xs text-gray-300">
                  <div className="flex justify-between text-gray-500 mb-1">
                    <span className="font-mono text-emerald-600">{log.time}</span>
                    <span className="text-emerald-500/80">+{log.duration}m</span>
                  </div>
                  <div>{typeof log.content === 'string' ? log.content : 'Log Entry'}</div>
                </div>
              ))}
              {(!todayStats.logs || todayStats.logs.length === 0) && (
                <div className="text-center text-gray-500 py-4">暂无学习记录</div>
              )}
            </div>
          </div>
        </div>

        {/* 计时器视图 */}
        <div className={`${activeView === 'timer' ? 'flex' : 'hidden md:flex'} flex-col items-center w-full`}>
          <div className={`absolute top-4 right-4 z-30 transition-opacity duration-300 flex items-center gap-4 ${isZen && isActive ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
            {isZen && <button onClick={() => setIsZen(false)} className="bg-gray-800/50 hover:bg-gray-700 text-gray-400 hover:text-white px-3 py-2 rounded text-xs transition">
                  退出禅模式
                </button>
            }
            <button 
              onClick={toggleFullScreen}
              className="bg-gray-800/50 hover:bg-gray-700 text-white p-2 rounded-lg backdrop-blur-sm transition-all shadow-lg"
              title="全屏显示"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>

          {/* 桌面端模式切换 */}
          <div className={`hidden md:flex gap-4 mb-8 md:mb-12 bg-gray-900/80 backdrop-blur-md p-2 rounded-2xl border border-gray-700/50 shadow-2xl z-10 transition-all duration-500 ${isZen ? '-translate-y-40 opacity-0 scale-75 absolute pointer-events-none' : 'translate-y-0 opacity-100 scale-100 pointer-events-auto'}`}>
            <button 
              onClick={() => switchMode('focus')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'focus' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <BookOpen className="w-4 h-4" /> <span>专注学习</span>
            </button>
            <button 
              onClick={() => switchMode('break')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'break' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Coffee className="w-4 h-4" /> <span>休息</span>
            </button>
            <button 
              onClick={() => switchMode('gaming')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'gaming' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Gamepad2 className="w-4 h-4" /> <span>奖励时刻</span>
            </button>
          </div>

          <div className={`relative mb-8 md:mb-12 group transition-all duration-700 ease-in-out ${isZen ? 'scale-125 md:scale-[2.5]' : 'scale-90 md:scale-100'}`}>
            {/* Zen Mode Decorative Elements */}
            {!isZen && (
              <>
                <div className={`absolute inset-0 rounded-full border-4 border-gray-800/50 scale-110`}></div>
                <div className={`absolute inset-0 rounded-full border-4 opacity-20 blur-md transition-all duration-500 ${getThemeColor().split(' ')[0].replace('text', 'border')}`}></div>
              </>
            )}
            
            <div className={`
               rounded-full flex items-center justify-center relative transition-all duration-500 
               ${isZen ? 'w-56 h-56 border-0' : `w-64 h-64 md:w-80 md:h-80 border-8 bg-gray-900 shadow-[0_0_60px_-15px_rgba(0,0,0,0.6)] ${getThemeColor()}`}
            `}>
               
               {/* Progress Circle */}
               <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                 {!isZen && <circle cx="50" cy="50" r="44" fill="none" stroke="#1f2937" strokeWidth="4" />}
                 <circle 
                   cx="50" cy="50" r="44" fill="none" 
                   stroke="currentColor" 
                   strokeWidth={isZen ? "2" : "4"} 
                   strokeLinecap="round"
                   strokeDasharray="276"
                   strokeDashoffset={276 - (276 * progress) / 100}
                   className={`transition-all duration-1000 ease-linear ${isZen ? 'text-white/20' : ''}`}
                 />
               </svg>

               <div className="flex flex-col items-center z-10 select-none">
                 <div className={`font-mono font-bold tracking-tighter tabular-nums text-white drop-shadow-2xl transition-all duration-500 ${isZen ? 'text-6xl' : 'text-5xl md:text-7xl'}`}>
                   {formatTime(timeLeft)}
                 </div>
                 
                 <div className={`text-sm mt-4 font-bold tracking-widest uppercase transition-all duration-500 ${mode === 'focus' ? 'text-emerald-400' : mode === 'break' ? 'text-blue-400' : 'text-purple-400'} ${isZen ? 'opacity-50' : 'opacity-100'}`}>
                   {mode === 'focus' ? 'DEEP WORK' : mode === 'break' ? 'RECHARGE' : 'GAME ON'}
                 </div>
                 
                 {!isZen && mode === 'focus' && isActive && (
                    <div className="text-[10px] text-gray-500 mt-2 bg-gray-800 px-2 py-1 rounded-full animate-pulse border border-gray-700">
                      预计收益: +{Math.floor(initialTime / 60 / 4.5)}m 券
                    </div>
                 )}
               </div>
            </div>
          </div>

          {/* Controls */}
          <div className={`flex gap-4 md:gap-6 z-10 transition-all duration-300 ${isZen && isActive ? 'opacity-30 hover:opacity-100' : 'opacity-100'}`}>
            {!isActive ? (
              <button 
                onClick={toggleTimer}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 hover:bg-gray-100 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95 touch-manipulation"
              >
                <Play className="w-6 h-6 md:w-8 md:h-8 ml-0.5" />
              </button>
            ) : (
              <div className="flex gap-4 md:gap-6">
                 <button 
                   onClick={toggleTimer}
                   className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-800 border-2 border-gray-600 text-white flex items-center justify-center hover:bg-gray-700 hover:border-gray-500 transition-all active:scale-95 shadow-xl touch-manipulation"
                 >
                   <Pause className="w-6 h-6 md:w-8 md:h-8" />
                 </button>
                 <button 
                   onClick={triggerStopTimer}
                   className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-950/30 border-2 border-red-900/50 text-red-500 flex items-center justify-center hover:bg-red-900/40 hover:border-red-500 transition-all active:scale-95 shadow-xl touch-manipulation"
                 >
                   <Square className="w-5 h-5 md:w-6 md:h-6" />
                 </button>
              </div>
            )}
            
            {/* 修复：游戏模式下禁用重置按钮 */}
            {!isZen && (
             <button 
               onClick={() => {
                   setIsActive(false);
                   const newTimeLeft = initialTime;
                   setTimeLeft(newTimeLeft);
                   saveTimerState(false, newTimeLeft, initialTime, mode);
               }}
               disabled={mode === 'gaming'}
               className={`absolute bottom-4 right-4 md:static w-12 h-12 rounded-full border flex items-center justify-center transition-all touch-manipulation ${
                 mode === 'gaming' 
                   ? 'bg-gray-800/30 border-gray-700 text-gray-600 cursor-not-allowed' 
                   : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
               }`}
               title={mode === 'gaming' ? "游戏模式下不可重置" : "重置计时"}
             >
               <RotateCcw className="w-4 h-4" />
             </button>
            )}
          </div>
        </div>
      </div>

      {/* Stop Confirmation Modal */}
      {showStopModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-red-500/30 rounded-2xl p-6 max-w-sm w-full shadow-[0_0_50px_rgba(239,68,68,0.2)]">
            <div className="flex items-center gap-4 mb-4 text-red-500">
               <AlertTriangle className="w-8 h-8" />
               <h3 className="text-xl font-bold text-white">确定要放弃吗？</h3>
            </div>
            
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              如果现在停止，你本次的努力将<span className="text-red-400 font-bold">不会获得任何奖励</span>。坚持就是胜利！
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={cancelStopTimer}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-colors"
              >
                继续坚持
              </button>
              <button 
                onClick={confirmStopTimer}
                className="flex-1 bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800 font-bold py-3 rounded-xl transition-colors"
              >
                放弃进度
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Chat Modal (增强版) */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-0 md:p-4 animate-in fade-in zoom-in duration-200">
          {/* 修改：响应式宽度调整 */}
          <div className="bg-[#111116] w-full h-full md:max-w-2xl lg:max-w-4xl xl:max-w-5xl md:h-[85vh] md:rounded-3xl shadow-2xl flex flex-col relative overflow-hidden border border-gray-800">
            {/* Chat Header (增强版) */}
            <div className="p-4 bg-[#16161c] border-b border-gray-800 flex justify-between items-center z-10 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg"><Sparkles className="w-5 h-5 text-white" /></div>
                <div>
                  <h3 className="font-bold text-white text-sm">AI 导师</h3>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> 
                    Online
                    {deepThinkingMode && <span className="ml-2 bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded text-[8px]">深度思考模式</span>}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {/* 深度思考模式切换按钮 */}
                <button 
                  onClick={() => saveDeepThinkingMode(!deepThinkingMode)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                    deepThinkingMode 
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' 
                      : 'bg-gray-800 text-gray-400 hover:text-blue-400 hover:bg-gray-700'
                  }`}
                  title={deepThinkingMode ? "切换到快速模式" : "切换到深度思考模式"}
                >
                  <BrainCircuit className="w-4 h-4"/>
                </button>
                <button 
                  onClick={startNewChat}
                  className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-gray-700 transition"
                  title="新对话"
                >
                  <RefreshCw className="w-4 h-4"/>
                </button>
                <button 
                  onClick={clearChatHistory}
                  className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-gray-700 transition"
                  title="清除记录"
                >
                  <Trash2 className="w-4 h-4"/>
                </button>
                <button onClick={() => setShowChatModal(false)} className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition"><X className="w-4 h-4"/></button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a]">
              {chatMessages.filter(m => m.role !== 'system').map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex-shrink-0 flex items-center justify-center mr-2 self-start mt-1">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className={`max-w-[75%] lg:max-w-[80%] p-3.5 text-sm leading-relaxed shadow-md relative overflow-x-auto ${
                    msg.role === 'user' 
                      ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-none' 
                      : 'bg-white text-gray-900 rounded-2xl rounded-tl-none'
                  }`}>
                    {/* 用户消息显示图片 */}
                    {msg.role === 'user' && msg.images && msg.images.length > 0 && (
                      <div className="mb-2">
                        <div className="text-white/80 text-xs mb-1">上传的图片:</div>
                        <div className="flex gap-2 flex-wrap">
                          {msg.images.map((img, imgIdx) => (
                            <div key={imgIdx} className="relative">
                              <img src={img.preview} alt="已发送的图片" className="w-16 h-16 object-cover rounded border border-white/20" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {msg.role === 'assistant' ? (
                      <MarkdownMessage content={msg.content} />
                    ) : (
                      <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center ml-2 self-start mt-1">
                      <User className="w-4 h-4 text-gray-300" />
                    </div>
                  )}
                </div>
              ))}
              
              {/* 图片预览区域 - 发送前显示 */}
              {selectedImages.length > 0 && (
                <div className="flex justify-end">
                  <div className="max-w-[75%] bg-emerald-600 p-3 rounded-2xl rounded-tr-none">
                    <div className="text-white text-xs mb-2">准备发送的图片:</div>
                    <div className="flex gap-2 flex-wrap">
                      {selectedImages.map(img => (
                        <div key={img.id} className="relative">
                          <img src={img.preview} alt="预览" className="w-16 h-16 object-cover rounded border border-white/20" />
                          <button 
                            onClick={() => removeImage(img.id)}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Typing Indicator */}
              {aiThinking && (
                <div className="flex justify-start animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex-shrink-0 flex items-center justify-center mr-2">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                    <span className="text-gray-500 text-xs ml-2">{deepThinkingMode ? "深度思考中..." : "思考中..."}</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area (增强版) */}
            <div className="p-3 bg-[#16161c] border-t border-gray-800 flex flex-col gap-2">
              {showEmojiPicker && (
                <div className="bg-[#1f1f27] p-3 rounded-xl grid grid-cols-6 gap-2 mb-2 absolute bottom-20 left-4 shadow-xl border border-gray-700 z-50 animate-in zoom-in duration-200 origin-bottom-left">
                  {COMMON_EMOJIS.map(e => <button key={e} onClick={() => handleEmojiClick(e)} className="text-2xl hover:bg-white/10 p-2 rounded transition">{e}</button>)}
                </div>
              )}
              
              {/* 图片上传区域 */}
              {selectedImages.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {selectedImages.map(img => (
                    <div key={img.id} className="relative flex-shrink-0">
                      <img src={img.preview} alt="预览" className="w-12 h-12 object-cover rounded border border-gray-600" />
                      <button 
                        onClick={() => removeImage(img.id)}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-2 bg-[#0a0a0a] p-1.5 rounded-full border border-gray-800 focus-within:border-purple-500/50 transition-colors">
                <button 
                  onClick={() => imageInputRef.current?.click()} 
                  className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-white/5 transition"
                  title="上传图片"
                >
                  <Image className="w-5 h-5"/>
                </button>
                <input 
                  type="file" 
                  ref={imageInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                
                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-yellow-400 hover:bg-white/5 transition"><Smile className="w-5 h-5"/></button>
                <input 
                  type="text" 
                  value={chatInput} 
                  onChange={(e) => setChatInput(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleUserSend()} 
                  placeholder={selectedProvider === 'deepseek' || selectedProvider === 'doubao' ? "输入消息或上传图片..." : "输入消息..."}
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-gray-600"
                />
                <button 
                  onClick={handleUserSend} 
                  disabled={(!chatInput.trim() && selectedImages.length === 0) || aiThinking} 
                  className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
              
              {/* 多模态支持提示 */}
              {(selectedProvider === 'deepseek' || selectedProvider === 'doubao') && (
                <div className="text-[10px] text-gray-500 text-center">
                  支持图片识别分析 {selectedProvider === 'deepseek' ? '(DeepSeek-Vision)' : '(豆包多模态)'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Log Modal (Supports Both Timer Finish and Manual Entry) */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-emerald-500/30 rounded-2xl p-6 max-w-md w-full shadow-[0_0_50px_rgba(16,185,129,0.15)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
            <div className="flex items-center gap-4 mb-6">
               <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                 {isManualLog ? <PlusCircle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
               </div>
               <div>
                 <h3 className="text-xl font-bold text-white">{isManualLog ? '补录学习记录' : 'Focus Session Complete!'}</h3>
                 <p className="text-xs text-gray-400">经验值已到账，请记录你的成就</p>
               </div>
            </div>
            
            <div className="space-y-4">
               {/* 补录时显示时长输入 */}
               {isManualLog && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">时长 (分钟)</label>
                    <input 
                      type="number" 
                      value={manualDuration} 
                      onChange={(e) => setManualDuration(Number(e.target.value))}
                      className="w-full bg-black/50 border border-gray-700 rounded-xl p-3 text-white font-mono"
                    />
                  </div>
               )}

               <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">本次成果 (Log Content)</label><textarea value={logContent} onChange={(e) => setLogContent(e.target.value)} placeholder="做了什么？(例如：完成了660题第二章前10题，理解了泰勒公式展开...)" className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-gray-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 min-h-[120px] resize-none text-sm placeholder:text-gray-700" autoFocus /></div>
               <button onClick={saveLog} disabled={!logContent.trim()} className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"><Save className="w-4 h-4" /> 存入档案并休息 (+{isManualLog ? Math.floor(manualDuration/4.5) : Math.floor(pendingStudyTime/60/4.5)}m 券)</button>
            </div>
            
            <button onClick={() => setShowLogModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X className="w-5 h-5"/></button>
          </div>
        </div>
      )}

      {/* Settings Modal (增强版) */}
      {showSettings && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-0 md:p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-[#111116] w-full h-full md:max-w-xl md:h-[85vh] md:rounded-3xl shadow-2xl flex flex-col relative overflow-hidden border border-gray-800 p-6 md:p-8">
               <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Settings className="w-6 h-6 text-cyan-400"/> 系统设置与配置</h2>
               <div className="flex-1 overflow-y-auto space-y-6">
                  {/* AI 人设设置 */}
                  <div className="bg-purple-900/20 p-4 rounded-xl border border-purple-500/30">
                    <h3 className="text-purple-400 font-bold mb-3 flex items-center gap-2 text-sm"><Sparkles className="w-4 h-4"/> AI 导师人设定制</h3>
                    <textarea 
                      value={customPersona}
                      onChange={(e) => saveAISettings(apiKey, apiBaseUrl, apiModel, selectedProvider, e.target.value)}
                      placeholder={DEFAULT_PERSONA}
                      className="w-full bg-black/50 border border-purple-500/30 rounded-lg p-3 text-white outline-none focus:border-purple-500 text-sm min-h-[80px] resize-none"
                    />
                  </div>

                  {/* 深度思考模式设置 */}
                  <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/30">
                    <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2 text-sm"><BrainCircuit className="w-4 h-4"/> 回复模式</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white text-sm">深度思考模式</div>
                        <div className="text-gray-400 text-xs">开启后回复更详细准确，但速度较慢</div>
                      </div>
                      <button 
                        onClick={() => saveDeepThinkingMode(!deepThinkingMode)}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          deepThinkingMode ? 'bg-blue-500' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                          deepThinkingMode ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>

                  {/* 每日目标时长设置 */}
                  <div className="bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/30">
                     <div className="flex justify-between items-center mb-2">
                       <h3 className="text-emerald-400 font-bold flex items-center gap-2 text-sm"><Clock className="w-4 h-4"/> 每日目标时长 (小时)</h3>
                       {customTargetHours && <button onClick={() => saveTargetHours(null)} className="text-xs text-gray-400 underline hover:text-white transition">恢复默认</button>}
                     </div>
                     <input 
                       type="range" 
                       min="1" max="16" step="0.5"
                       value={customTargetHours || stage.targetHours}
                       onChange={(e) => saveTargetHours(parseFloat(e.target.value))}
                       className="w-full accent-emerald-500 cursor-pointer h-2 bg-gray-700 rounded-lg appearance-none"
                     />
                     <div className="flex justify-between text-gray-500 text-xs mt-2 font-mono">
                       <span>1h</span>
                       <span className="text-emerald-400 font-bold">{customTargetHours || stage.targetHours}h</span>
                       <span>16h</span>
                     </div>
                  </div>

                  {/* AI 模型配置 */}
                  <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                    <h3 className="text-gray-400 font-bold mb-3 flex items-center gap-2 text-sm"><BrainCircuit className="w-4 h-4 text-cyan-500"/> AI 模型配置</h3>
                    <div className="space-y-3 text-sm">
                      <div className="mb-2">
                        <label className="text-gray-500 block mb-1">服务商</label>
                        <div className="flex items-center bg-black/50 border border-gray-600 rounded-lg px-3 relative">
                          <select value={selectedProvider} onChange={(e) => {
                            const p = API_PROVIDERS.find(x => x.id === e.target.value);
                            if (p) saveAISettings(apiKey, p.url, p.defaultModel, p.id, customPersona);
                            else setSelectedProvider('custom');
                          }} className="w-full bg-transparent py-3 text-white outline-none border-none appearance-none z-10 font-mono">
                            {API_PROVIDERS.map(p => (
                              <option key={p.id} value={p.id} className="bg-gray-900">
                                {p.name} {p.supportsVision ? '📷' : ''}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3" />
                        </div>
                        {API_PROVIDERS.find(p => p.id === selectedProvider)?.supportsVision && (
                          <div className="text-[10px] text-green-400 mt-1 flex items-center gap-1">
                            <Image className="w-3 h-3" /> 支持图片识别功能
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label className="text-gray-500 block mb-1">API Key</label>
                        <input type="password" placeholder="sk-..." value={apiKey} onChange={(e) => saveAISettings(e.target.value, apiBaseUrl, apiModel, selectedProvider, customPersona)} className="w-full bg-black/50 border border-gray-600 rounded-lg p-3 text-white outline-none focus:border-cyan-500 font-mono"/>
                      </div>
                      <div className="mb-2 relative">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-gray-500">模型名称</label>
                          <button onClick={fetchAvailableModels} disabled={isFetchingModels} className="text-[10px] bg-cyan-900/30 text-cyan-300 border border-cyan-800/50 px-2 py-1 rounded flex items-center gap-1 hover:bg-cyan-800/50 transition-colors">{isFetchingModels ? <RefreshCw className="w-3 h-3 animate-spin"/> : <List className="w-3 h-3"/>} 获取列表</button>
                        </div>
                        <div className="flex items-center bg-black/50 border border-gray-600 rounded-lg px-3 relative z-50">
                          <Cpu className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                          <input type="text" value={apiModel} onChange={(e) => { setApiModel(e.target.value); setIsModelListOpen(true); setModelSearch(e.target.value); }} onFocus={() => setIsModelListOpen(true)} className="w-full bg-transparent py-3 text-white outline-none font-mono" placeholder="输入或选择模型"/>
                          <button onClick={() => setIsModelListOpen(!isModelListOpen)}><ChevronDown className="w-4 h-4 text-gray-500" /></button>
                        </div>
                        
                        {/* Custom Dropdown for Models */}
                        {isModelListOpen && availableModels.length > 0 && (
                          <div className="absolute top-full left-0 w-full bg-[#1a1a20] border border-gray-700 rounded-b-lg shadow-xl max-h-40 overflow-y-auto z-[100] mt-1 font-mono">
                            <div className="sticky top-0 bg-[#1a1a20] p-2 border-b border-gray-700 flex items-center gap-2">
                              <Search className="w-3 h-3 text-gray-500" />
                              <input type="text" value={modelSearch} onChange={(e) => setModelSearch(e.target.value)} placeholder="搜索..." className="w-full bg-transparent text-white outline-none text-xs"/>
                            </div>
                            {availableModels.filter(m => m.toLowerCase().includes(modelSearch.toLowerCase())).map(m => (
                              <div key={m} onClick={() => { setApiModel(m); saveAISettings(apiKey, apiBaseUrl, m, selectedProvider, customPersona); setIsModelListOpen(false); }} className="px-3 py-2 hover:bg-cyan-900/30 cursor-pointer truncate text-gray-300 hover:text-cyan-400 transition-colors text-xs">{m}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* 数据备份与恢复 */}
                  <div className="bg-red-900/20 p-4 rounded-xl border border-red-700/30">
                     <h3 className="text-red-400 font-bold mb-3 flex items-center gap-2 text-sm"><AlertTriangle className="w-4 h-4"/> 数据备份与恢复 (DATA BACKUP)</h3>
                     <div className="flex gap-2">
                       <button onClick={handleExportData} className="flex-1 bg-gray-800 hover:bg-gray-700 p-3 rounded-lg flex justify-center gap-2 transition-colors text-gray-400 hover:text-white text-sm"><Download className="w-4 h-4"/> 导出备份</button>
                       <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-gray-800 hover:bg-gray-700 p-3 rounded-lg flex justify-center gap-2 transition-colors text-gray-400 hover:text-white text-sm"><Upload className="w-4 h-4"/> 导入覆盖</button>
                       <input type="file" ref={fileInputRef} onChange={handleImportData} className="hidden" accept=".json" />
                     </div>
                     <p className="text-[10px] text-gray-500 mt-2">导出包含：历史记录、学习进度、个性化设置（不含API Key）</p>
                  </div>
               </div>
              
              <div className="mt-4 pt-4 border-t border-gray-800">
                 <button onClick={() => setShowSettings(false)} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors">关闭设置</button>
              </div>
            </div>
          </div>
      )}
    </div>
  );
}