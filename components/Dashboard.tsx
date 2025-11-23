
import React, { useEffect, useState } from 'react';
import { User, Task, View } from '../types';
import { 
    CheckCircle2, 
    Clock, 
    Circle, 
    TrendingUp, 
    Activity,
    Code,
    Calendar
} from 'lucide-react';

interface DashboardProps {
    user: User | null;
    onNavigate: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [stats, setStats] = useState({ todo: 0, inProgress: 0, done: 0 });

    useEffect(() => {
        const stored = localStorage.getItem('zee_tasks');
        if (stored) {
            const parsedTasks: Task[] = JSON.parse(stored);
            setTasks(parsedTasks);
            setStats({
                todo: parsedTasks.filter(t => t.status === 'todo').length,
                inProgress: parsedTasks.filter(t => t.status === 'in-progress').length,
                done: parsedTasks.filter(t => t.status === 'done').length
            });
        }
    }, []);

    const StatCard = ({ title, count, icon: Icon, color, onClick }: any) => (
        <div onClick={onClick} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
                    <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
                </div>
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{count}</span>
            </div>
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Welcome back, {user?.username || 'Creator'}! 👋
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Here's what's happening with your projects today.
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <span className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-bold border border-blue-100 dark:border-blue-800 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date().toLocaleDateString()}
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Tasks" 
                    count={tasks.length} 
                    icon={Activity} 
                    color="bg-blue-500" 
                    onClick={() => onNavigate(View.TASKS)}
                />
                <StatCard 
                    title="In Progress" 
                    count={stats.inProgress} 
                    icon={Clock} 
                    color="bg-yellow-500" 
                    onClick={() => onNavigate(View.TASKS)}
                />
                <StatCard 
                    title="Completed" 
                    count={stats.done} 
                    icon={CheckCircle2} 
                    color="bg-green-500" 
                    onClick={() => onNavigate(View.TASKS)}
                />
                <StatCard 
                    title="Pending" 
                    count={stats.todo} 
                    icon={Circle} 
                    color="bg-slate-500" 
                    onClick={() => onNavigate(View.TASKS)}
                />
            </div>

            {/* Main Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity / Tasks */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center">
                                <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                                Recent Tasks
                            </h3>
                            <button 
                                onClick={() => onNavigate(View.TASKS)}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                View All
                            </button>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-slate-800">
                            {tasks.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">
                                    No tasks yet. Start building!
                                </div>
                            ) : (
                                tasks.slice(0, 5).map(task => (
                                    <div key={task.id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {task.status === 'done' ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            ) : task.status === 'in-progress' ? (
                                                <Clock className="w-5 h-5 text-yellow-500" />
                                            ) : (
                                                <Circle className="w-5 h-5 text-slate-400" />
                                            )}
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-slate-200">{task.title}</p>
                                                <p className="text-xs text-slate-500 truncate max-w-xs">{task.description}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-full ${
                                            task.priority === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                            'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}>
                                            {task.priority}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl p-6 text-white shadow-lg">
                        <h3 className="font-bold text-lg mb-2">Start Building</h3>
                        <p className="text-blue-100 text-sm mb-6">Create a new App or Component using Gemini.</p>
                        <button 
                            onClick={() => onNavigate(View.BUILDER)}
                            className="w-full py-3 bg-white text-blue-600 font-bold rounded-lg shadow hover:bg-blue-50 transition-colors flex items-center justify-center"
                        >
                            <Code className="w-4 h-4 mr-2" /> Open Builder
                        </button>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">System Status</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Gemini API</span>
                                <span className="flex items-center text-green-500"><div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" /> Operational</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Live API</span>
                                <span className="flex items-center text-green-500"><div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" /> Operational</span>
                            </div>
                             <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Database</span>
                                <span className="flex items-center text-green-500"><div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" /> Local</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
