
import React, { useState, useEffect } from 'react';
import { View, User } from './types';
import { 
  LayoutDashboard, 
  Code, 
  MessageSquare, 
  Image as ImageIcon, 
  Mic, 
  Menu, 
  X,
  LogOut,
  LogIn,
  Kanban,
  Sun,
  Moon,
  Home as HomeIcon,
  Settings,
  Terminal
} from 'lucide-react';

// Components
import Home from './components/Home';
import Builder from './components/Builder';
import ChatInterface from './components/ChatInterface';
import ImageStudio from './components/ImageStudio';
import AudioStudio from './components/AudioStudio';
import TaskBoard from './components/TaskBoard';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import LegalDocs from './components/LegalDocs';
import Developers from './components/Developers';
import { usageService } from './services/usageService';

// Zee Logo Component (The "Zen Z")
const ZeeLogo = () => (
  <svg viewBox="0 0 100 100" className="w-10 h-10 text-slate-900 dark:text-white transition-colors duration-300" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="zeeGradient" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
    <path 
        d="M 25 32 C 25 28 28 25 32 25 L 75 25 C 82 25 85 30 80 35 L 45 70" 
        stroke="url(#zeeGradient)" 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="drop-shadow-sm"
    />
    <path 
        d="M 75 68 C 75 72 72 75 68 75 L 25 75 C 18 75 15 70 20 65 L 55 30" 
        stroke="currentColor" 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        strokeOpacity="0.9"
    />
    <circle cx="82" cy="75" r="5" fill="url(#zeeGradient)" />
  </svg>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [pendingView, setPendingView] = useState<View | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('zee_theme');
    if (savedTheme) {
        setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('zee_theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('zee_theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const storedUser = localStorage.getItem('zee_user');
    if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        usageService.init(parsedUser.email);
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('zee_user');
    setCurrentView(View.HOME);
  };

  const handleNavigation = (view: View) => {
      const protectedViews = [
          View.DASHBOARD, 
          View.BUILDER, 
          View.TASKS, 
          View.PROFILE, 
          View.DEVELOPERS,
          View.CHAT,
          View.IMAGE_STUDIO,
          View.AUDIO_STUDIO
      ];

      if (protectedViews.includes(view) && !user) {
          setPendingView(view);
          setShowAuth(true);
      } else {
          setCurrentView(view);
      }
      setIsSidebarOpen(false);
      window.scrollTo(0,0);
  };

  const NavItem = ({ view, icon: Icon, label }: { view: View, icon: any, label: string }) => (
    <button
      onClick={() => handleNavigation(view)}
      className={`flex items-center w-full px-4 py-3 mb-1 rounded-lg transition-all duration-200 ${
        currentView === view 
          ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border-l-4 border-blue-500' 
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      <Icon className={`w-5 h-5 mr-3 ${currentView === view ? 'text-blue-600 dark:text-blue-400' : ''}`} />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );

  const NavCategory = ({ label }: { label: string }) => (
      <div className="px-4 mt-6 mb-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-600 uppercase tracking-wider">{label}</span>
      </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 overflow-hidden font-sans selection:bg-blue-500/30 transition-colors duration-300">
      
      {showAuth && (
        <AuthModal 
          onLogin={(u) => {
            setUser(u);
            localStorage.setItem('zee_user', JSON.stringify(u));
            usageService.init(u.email);
            setShowAuth(false);
            if (pendingView) {
                setCurrentView(pendingView);
                setPendingView(null);
            } else {
                setCurrentView(View.DASHBOARD);
            }
          }} 
          onClose={() => {
              setShowAuth(false);
              setPendingView(null);
          }}
        />
      )}

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white/80 dark:bg-slate-900/50 border-r border-gray-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out backdrop-blur-xl ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } flex flex-col shadow-xl lg:shadow-none`}
      >
        <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between h-20">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView(View.HOME)}>
                <ZeeLogo />
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Zee<span className="text-blue-600">Builder</span></span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400">
                <X className="w-6 h-6" />
            </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 custom-scrollbar">
            <NavItem view={View.HOME} icon={HomeIcon} label="Home" />
            <NavItem view={View.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
            <NavCategory label="Development" />
            <NavItem view={View.BUILDER} icon={Code} label="App Builder" />
            <NavItem view={View.TASKS} icon={Kanban} label="Task Board" />
            <NavItem view={View.DEVELOPERS} icon={Terminal} label="API & Developers" />
            <NavCategory label="AI Studios" />
            <NavItem view={View.CHAT} icon={MessageSquare} label="AI Assistant" />
            <NavItem view={View.IMAGE_STUDIO} icon={ImageIcon} label="Image Studio" />
            <NavItem view={View.AUDIO_STUDIO} icon={Mic} label="Voice & Audio" />
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/30">
            <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="flex items-center justify-center w-full px-4 py-2 mb-4 text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
                {isDarkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>

            {user ? (
                <>
                    <button 
                        onClick={() => handleNavigation(View.PROFILE)}
                        className="flex items-center mb-4 px-2 p-2 rounded-lg bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 w-full hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                        <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-700 mr-3" />
                        <div className="flex-1 overflow-hidden">
                            <div className="flex items-center">
                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.username}</p>
                                {user.isAdmin && <span className="ml-1 w-2 h-2 bg-red-500 rounded-full" title="Super Admin"></span>}
                            </div>
                            <p className="text-xs text-slate-500 truncate flex items-center">
                                <Settings className="w-3 h-3 mr-1" /> Settings
                            </p>
                        </div>
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                    </button>
                </>
            ) : (
                <button 
                    onClick={() => setShowAuth(true)}
                    className="flex items-center w-full px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-lg shadow-blue-900/30"
                >
                    <LogIn className="w-4 h-4 mr-3" />
                    Sign In
                </button>
            )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen overflow-hidden relative bg-gray-50 dark:bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-20 shrink-0">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView(View.HOME)}>
                <ZeeLogo />
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Zee<span className="text-blue-600">Builder</span></span>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-lg text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                {user ? (
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Hi, {user.username}</span>
                        <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-700" />
                    </div>
                ) : (
                    <button onClick={() => setShowAuth(true)} className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-lg hover:opacity-90 transition-opacity">
                        Get Started
                    </button>
                )}
            </div>
        </div>

        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 z-30 shrink-0">
            <button onClick={() => setIsSidebarOpen(true)} className="text-slate-900 dark:text-white p-2">
                <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentView(View.HOME)}>
                <ZeeLogo />
                <span className="font-black text-lg text-slate-900 dark:text-white">Zee<span className="text-blue-600">Builder</span></span>
            </div>
            <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
        </header>

        {/* View Content & Footer Wrapper */}
        <div className="flex-1 overflow-y-auto flex flex-col w-full relative scroll-smooth">
            <div className="flex-1 p-4 lg:p-8 w-full max-w-7xl mx-auto min-h-full">
                {currentView === View.HOME && <Home onNavigate={handleNavigation} />}
                {currentView === View.DASHBOARD && <Dashboard user={user} onNavigate={handleNavigation} />}
                {currentView === View.BUILDER && <Builder user={user} />}
                {currentView === View.TASKS && <TaskBoard />}
                {currentView === View.CHAT && <ChatInterface />}
                {currentView === View.IMAGE_STUDIO && <ImageStudio />}
                {currentView === View.AUDIO_STUDIO && <AudioStudio onNavigate={handleNavigation} />}
                {currentView === View.PROFILE && <Profile user={user} onUpdateUser={setUser} />}
                {currentView === View.DEVELOPERS && <Developers user={user} />}
                {(currentView === View.POLICY || currentView === View.TERMS || currentView === View.DOCS) && (
                    <LegalDocs view={currentView} onNavigate={handleNavigation} />
                )}
            </div>

            {/* Global Footer */}
            <footer className="bg-white dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 py-12 px-6 text-center text-xs text-slate-500 relative shrink-0 z-10 mt-auto">
                 {/* Neural Flow Background */}
                 <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                     <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                         <defs>
                             <pattern id="neural-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                                 <circle cx="2" cy="2" r="1" className="text-blue-500" fill="currentColor" />
                                 <path d="M2 2 L40 40 M-10 10 L 20 20" stroke="currentColor" className="text-slate-400" strokeWidth="0.5" />
                             </pattern>
                         </defs>
                         <rect width="100%" height="100%" fill="url(#neural-pattern)" />
                     </svg>
                 </div>

                 <div className="flex flex-col items-center justify-center gap-6 max-w-7xl mx-auto relative z-10">
                     {/* Text Branding (No Logo) */}
                     <div className="mb-2 transform hover:scale-105 transition-transform duration-300">
                        <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Zee<span className="text-blue-600">Builder</span></span>
                     </div>

                     {/* Links */}
                     <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                         <button onClick={() => handleNavigation(View.HOME)} className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors">Home</button>
                         <button onClick={() => handleNavigation(View.POLICY)} className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors">Privacy Policy</button>
                         <button onClick={() => handleNavigation(View.TERMS)} className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors">Terms of Service</button>
                         <button onClick={() => handleNavigation(View.DOCS)} className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors">Documentation</button>
                         <button onClick={() => handleNavigation(View.DEVELOPERS)} className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors">API & Developers</button>
                     </div>

                     <div className="w-32 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30 rounded-full"></div>

                     {/* Credits */}
                     <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                            Built with <span className="text-red-500 mx-1 animate-pulse">❤️</span> by 
                            <a href="https://x.com/mikaelkraft" target="_blank" rel="noopener noreferrer" className="ml-1 font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors">
                                Mikael Kraft
                            </a>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-600 uppercase tracking-widest">© {new Date().getFullYear()} Zee Builder Inc.</span>
                     </div>
                </div>
            </footer>
        </div>
      </main>
    </div>
  );
};

export default App;
