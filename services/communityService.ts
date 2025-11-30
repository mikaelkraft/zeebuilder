
import { CommunityProject, SavedProject, Stack } from '../types';

const COMMUNITY_STORAGE_KEY = 'zee_community_projects';

// Featured showcase projects (pre-built examples)
const FEATURED_PROJECTS: CommunityProject[] = [
    {
        id: 'showcase-1',
        projectId: 'showcase-1',
        name: 'SaaS Dashboard Pro',
        description: 'A complete admin dashboard with charts, user management, and real-time analytics. Built with React and Tailwind CSS.',
        stack: 'react-ts',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
        authorName: 'Zee AI',
        authorAvatar: '',
        files: [
            {
                name: 'App.tsx',
                language: 'typescript',
                content: `import React, { useState } from 'react';
import { BarChart3, Users, DollarSign, TrendingUp, Bell, Settings, LogOut, Menu } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, change, color }: any) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between">
      <div className={\`p-3 rounded-lg \${color}\`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <span className={\`text-sm font-medium \${change >= 0 ? 'text-green-600' : 'text-red-600'}\`}>
        {change >= 0 ? '+' : ''}{change}%
      </span>
    </div>
    <h3 className="mt-4 text-2xl font-bold text-gray-900">{value}</h3>
    <p className="text-gray-500 text-sm">{label}</p>
  </div>
);

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const stats = [
    { icon: DollarSign, label: 'Total Revenue', value: '$54,239', change: 12.5, color: 'bg-blue-600' },
    { icon: Users, label: 'Active Users', value: '2,543', change: 8.2, color: 'bg-emerald-600' },
    { icon: BarChart3, label: 'Conversion Rate', value: '3.24%', change: -2.1, color: 'bg-purple-600' },
    { icon: TrendingUp, label: 'Growth', value: '+23.5%', change: 15.3, color: 'bg-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={\`\${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300\`}>
        <div className="p-6">
          <h1 className={\`font-bold text-xl \${!sidebarOpen && 'text-center'}\`}>
            {sidebarOpen ? '📊 Dashboard' : '📊'}
          </h1>
        </div>
        <nav className="mt-6">
          {['Overview', 'Analytics', 'Users', 'Settings'].map((item, i) => (
            <a key={i} href="#" className="flex items-center gap-3 px-6 py-3 hover:bg-slate-800 transition-colors">
              <BarChart3 className="w-5 h-5" />
              {sidebarOpen && <span>{item}</span>}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Welcome back, Admin!</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <img src="https://i.pravatar.cc/40" alt="Avatar" className="w-10 h-10 rounded-full" />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => <StatCard key={i} {...stat} />)}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <img src={\`https://i.pravatar.cc/32?img=\${i}\`} alt="" className="w-8 h-8 rounded-full" />
                  <div>
                    <p className="font-medium text-gray-900">User {i} completed a purchase</p>
                    <p className="text-sm text-gray-500">{i * 5} minutes ago</p>
                  </div>
                </div>
                <span className="text-green-600 font-medium">+$\{(i * 49).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;`
            },
            {
                name: 'index.html',
                language: 'html',
                content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SaaS Dashboard Pro</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div id="root"></div>
</body>
</html>`
            }
        ],
        likes: 234,
        views: 1520,
        publishedAt: Date.now() - 86400000 * 3,
        featured: true
    },
    {
        id: 'showcase-2',
        projectId: 'showcase-2',
        name: 'AI Chat Interface',
        description: 'A sleek chat UI with typing indicators, message bubbles, and dark mode support. Perfect for chatbot interfaces.',
        stack: 'react',
        thumbnail: 'https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=400&h=300&fit=crop',
        authorName: 'Zee AI',
        authorAvatar: '',
        files: [
            {
                name: 'App.jsx',
                language: 'javascript',
                content: `import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Moon, Sun } from 'lucide-react';

const ChatBubble = ({ message, isBot }) => (
  <div className={\`flex gap-3 \${isBot ? '' : 'flex-row-reverse'}\`}>
    <div className={\`w-8 h-8 rounded-full flex items-center justify-center \${isBot ? 'bg-blue-600' : 'bg-emerald-600'}\`}>
      {isBot ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
    </div>
    <div className={\`max-w-xs px-4 py-2 rounded-2xl \${isBot ? 'bg-gray-100 dark:bg-gray-800 rounded-tl-none' : 'bg-blue-600 text-white rounded-tr-none'}\`}>
      <p className="text-sm">{message}</p>
    </div>
  </div>
);

const TypingIndicator = () => (
  <div className="flex gap-3">
    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
      <Bot className="w-4 h-4 text-white" />
    </div>
    <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-none">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: \`\${i * 0.15}s\` }} />
        ))}
      </div>
    </div>
  </div>
);

export default function App() {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your AI assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const messagesEnd = useRef(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { text: input, isBot: false }]);
    setInput('');
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        text: "Thanks for your message! This is a demo response from the AI assistant.",
        isBot: true 
      }]);
    }, 1500);
  };

  return (
    <div className={\`min-h-screen transition-colors \${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}\`}>
      <div className="max-w-md mx-auto h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white">AI Assistant</h1>
              <p className="text-xs text-green-500">● Online</p>
            </div>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => <ChatBubble key={i} message={msg.text} isBot={msg.isBot} />)}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEnd} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full outline-none text-gray-900 dark:text-white text-sm"
            />
            <button type="submit" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}`
            }
        ],
        likes: 189,
        views: 1234,
        publishedAt: Date.now() - 86400000 * 5,
        featured: true
    },
    {
        id: 'showcase-3',
        projectId: 'showcase-3',
        name: 'E-commerce Product Card',
        description: 'Beautiful product cards with hover effects, ratings, and add-to-cart functionality. Fully responsive.',
        stack: 'react',
        thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
        authorName: 'Zee AI',
        authorAvatar: '',
        files: [
            {
                name: 'App.jsx',
                language: 'javascript',
                content: `import React, { useState } from 'react';
import { ShoppingCart, Heart, Star, Check } from 'lucide-react';

const products = [
  { id: 1, name: 'Premium Headphones', price: 299, rating: 4.8, reviews: 234, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop', category: 'Electronics' },
  { id: 2, name: 'Smart Watch Pro', price: 449, rating: 4.9, reviews: 567, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop', category: 'Wearables' },
  { id: 3, name: 'Wireless Earbuds', price: 149, rating: 4.7, reviews: 892, image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=300&h=300&fit=crop', category: 'Audio' },
  { id: 4, name: 'Portable Speaker', price: 199, rating: 4.6, reviews: 123, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop', category: 'Audio' },
];

const ProductCard = ({ product }) => {
  const [liked, setLiked] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <button 
          onClick={() => setLiked(!liked)}
          className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform"
        >
          <Heart className={\`w-5 h-5 \${liked ? 'fill-red-500 text-red-500' : 'text-gray-400'}\`} />
        </button>
        <span className="absolute top-4 left-4 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
          {product.category}
        </span>
      </div>
      
      <div className="p-5">
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={\`w-4 h-4 \${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}\`} />
          ))}
          <span className="text-sm text-gray-500 ml-1">({product.reviews})</span>
        </div>
        
        <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mt-4">
          <span className="text-2xl font-bold text-gray-900">\${product.price}</span>
          <button 
            onClick={handleAddToCart}
            className={\`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all \${
              added 
                ? 'bg-green-600 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }\`}
          >
            {added ? (
              <><Check className="w-4 h-4" /> Added</>
            ) : (
              <><ShoppingCart className="w-4 h-4" /> Add</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Featured Products</h1>
          <p className="text-gray-500">Discover our best-selling items</p>
        </header>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}`
            }
        ],
        likes: 312,
        views: 2156,
        publishedAt: Date.now() - 86400000 * 2,
        featured: true
    },
    {
        id: 'showcase-4',
        projectId: 'showcase-4',
        name: 'Task Manager App',
        description: 'Drag-and-drop Kanban board with task priorities, due dates, and progress tracking.',
        stack: 'react-ts',
        thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop',
        authorName: 'Zee AI',
        authorAvatar: '',
        files: [
            {
                name: 'App.tsx',
                language: 'typescript',
                content: `import React, { useState } from 'react';
import { Plus, Check, Clock, AlertCircle, MoreVertical } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'progress' | 'done';
}

const initialTasks: Task[] = [
  { id: '1', title: 'Design new landing page', priority: 'high', status: 'todo' },
  { id: '2', title: 'Fix authentication bug', priority: 'high', status: 'progress' },
  { id: '3', title: 'Write API documentation', priority: 'medium', status: 'todo' },
  { id: '4', title: 'Update dependencies', priority: 'low', status: 'done' },
  { id: '5', title: 'Review pull requests', priority: 'medium', status: 'progress' },
];

const priorityColors = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

const TaskCard = ({ task }: { task: Task }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <span className={\`text-xs px-2 py-1 rounded-full font-medium \${priorityColors[task.priority]}\`}>
          {task.priority}
        </span>
        <h4 className="font-medium text-gray-900 mt-2 group-hover:text-blue-600 transition-colors">
          {task.title}
        </h4>
      </div>
      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded">
        <MoreVertical className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  </div>
);

const Column = ({ title, icon: Icon, tasks, color }: any) => (
  <div className="flex-1 min-w-[280px]">
    <div className={\`flex items-center gap-2 mb-4 pb-3 border-b-2 \${color}\`}>
      <Icon className="w-5 h-5" />
      <h3 className="font-bold text-gray-900">{title}</h3>
      <span className="ml-auto bg-gray-100 text-gray-600 text-sm px-2 py-0.5 rounded-full">
        {tasks.length}
      </span>
    </div>
    <div className="space-y-3">
      {tasks.map((task: Task) => <TaskCard key={task.id} task={task} />)}
      <button className="w-full py-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" /> Add Task
      </button>
    </div>
  </div>
);

export default function App() {
  const [tasks] = useState<Task[]>(initialTasks);
  
  const columns = [
    { title: 'To Do', icon: AlertCircle, status: 'todo', color: 'border-gray-400' },
    { title: 'In Progress', icon: Clock, status: 'progress', color: 'border-blue-500' },
    { title: 'Done', icon: Check, status: 'done', color: 'border-green-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📋 Task Board</h1>
            <p className="text-gray-500 text-sm">Manage your project tasks</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Task
          </button>
        </div>
      </header>
      
      <main className="p-8">
        <div className="flex gap-6 overflow-x-auto pb-4">
          {columns.map(col => (
            <Column 
              key={col.status}
              {...col}
              tasks={tasks.filter(t => t.status === col.status)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}`
            }
        ],
        likes: 156,
        views: 987,
        publishedAt: Date.now() - 86400000 * 7,
        featured: true
    }
];

// Get all community projects (featured + user published)
export const getCommunityProjects = (): CommunityProject[] => {
    const stored = localStorage.getItem(COMMUNITY_STORAGE_KEY);
    const userProjects: CommunityProject[] = stored ? JSON.parse(stored) : [];
    return [...FEATURED_PROJECTS, ...userProjects].sort((a, b) => b.publishedAt - a.publishedAt);
};

// Get only featured projects
export const getFeaturedProjects = (): CommunityProject[] => {
    return getCommunityProjects().filter(p => p.featured || p.likes > 50);
};

// Publish a project to community
export const publishToCommmunity = (
    project: SavedProject,
    description: string,
    authorName: string,
    authorAvatar?: string
): CommunityProject => {
    const stored = localStorage.getItem(COMMUNITY_STORAGE_KEY);
    const userProjects: CommunityProject[] = stored ? JSON.parse(stored) : [];
    
    // Check if already published
    const existingIndex = userProjects.findIndex(p => p.projectId === project.id);
    
    const communityProject: CommunityProject = {
        id: `community-${project.id}`,
        projectId: project.id,
        name: project.name,
        description,
        stack: project.stack,
        thumbnail: project.thumbnail,
        authorName,
        authorAvatar,
        files: project.files,
        likes: existingIndex >= 0 ? userProjects[existingIndex].likes : 0,
        views: existingIndex >= 0 ? userProjects[existingIndex].views : 0,
        publishedAt: Date.now(),
        featured: false
    };
    
    if (existingIndex >= 0) {
        userProjects[existingIndex] = communityProject;
    } else {
        userProjects.push(communityProject);
    }
    
    localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(userProjects));
    return communityProject;
};

// Unpublish a project
export const unpublishFromCommunity = (projectId: string): boolean => {
    const stored = localStorage.getItem(COMMUNITY_STORAGE_KEY);
    if (!stored) return false;
    
    const userProjects: CommunityProject[] = JSON.parse(stored);
    const filtered = userProjects.filter(p => p.projectId !== projectId);
    localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(filtered));
    return filtered.length < userProjects.length;
};

// Like a project
export const likeProject = (projectId: string): void => {
    const stored = localStorage.getItem(COMMUNITY_STORAGE_KEY);
    if (!stored) return;
    
    const userProjects: CommunityProject[] = JSON.parse(stored);
    const project = userProjects.find(p => p.id === projectId || p.projectId === projectId);
    if (project) {
        project.likes++;
        localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(userProjects));
    }
};

// Increment view count
export const incrementViews = (projectId: string): void => {
    const stored = localStorage.getItem(COMMUNITY_STORAGE_KEY);
    if (!stored) return;
    
    const userProjects: CommunityProject[] = JSON.parse(stored);
    const project = userProjects.find(p => p.id === projectId || p.projectId === projectId);
    if (project) {
        project.views++;
        localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(userProjects));
    }
};

// Check if a project is published
export const isProjectPublished = (projectId: string): boolean => {
    const projects = getCommunityProjects();
    return projects.some(p => p.projectId === projectId);
};
