
import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { Plus, Trash2, Clock, CheckCircle2, Circle, AlertCircle, MoreVertical, X, Edit2, ArrowRight, ArrowLeft } from 'lucide-react';

const TaskBoard: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium' as 'low'|'medium'|'high' });

    useEffect(() => {
        const stored = localStorage.getItem('zee_tasks');
        if (stored) {
            setTasks(JSON.parse(stored));
        } else {
            setTasks([
                { id: '1', title: 'Design Home Screen', description: 'Create the main dashboard layout', status: 'done', priority: 'high', createdAt: Date.now() },
                { id: '2', title: 'Integrate Gemini API', description: 'Connect chat interface to backend', status: 'in-progress', priority: 'high', createdAt: Date.now() },
                { id: '3', title: 'User Authentication', description: 'Implement Firebase login flow', status: 'todo', priority: 'medium', createdAt: Date.now() }
            ]);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('zee_tasks', JSON.stringify(tasks));
    }, [tasks]);

    const openAddModal = () => {
        setEditingTask(null);
        setTaskForm({ title: '', description: '', priority: 'medium' });
        setShowAddModal(true);
    };

    const openEditModal = (task: Task) => {
        setEditingTask(task);
        setTaskForm({ title: task.title, description: task.description, priority: task.priority });
        setShowAddModal(true);
    };

    const saveTask = () => {
        if (!taskForm.title) return;

        if (editingTask) {
            // Update existing
            const updatedTasks = tasks.map(t => t.id === editingTask.id ? {
                ...t,
                title: taskForm.title,
                description: taskForm.description,
                priority: taskForm.priority
            } : t);
            setTasks(updatedTasks);
        } else {
            // Create new
            const task: Task = {
                id: Date.now().toString(),
                title: taskForm.title,
                description: taskForm.description,
                status: 'todo',
                priority: taskForm.priority,
                createdAt: Date.now()
            };
            setTasks([...tasks, task]);
        }
        setShowAddModal(false);
        setEditingTask(null);
        setTaskForm({ title: '', description: '', priority: 'medium' });
    };

    const deleteTask = (id: string) => {
        if (confirm('Are you sure you want to delete this task?')) {
            setTasks(tasks.filter(t => t.id !== id));
        }
    };

    const moveTask = (id: string, status: 'todo' | 'in-progress' | 'done') => {
        setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
    };

    const getPriorityColor = (p: string) => {
        switch(p) {
            case 'high': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-400/10';
            case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-400/10';
            case 'low': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-400/10';
            default: return 'text-slate-400';
        }
    };

    const Column = ({ title, status, icon: Icon, color }: any) => (
        <div className="flex-1 min-w-[300px] bg-gray-100 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 flex flex-col h-full max-h-full shadow-sm">
            <div className={`p-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-gray-100 dark:bg-slate-900 z-10 rounded-t-xl`}>
                <div className="flex items-center">
                    <Icon className={`w-5 h-5 mr-2 ${color}`} />
                    <h3 className="font-bold text-slate-800 dark:text-white">{title}</h3>
                    <span className="ml-2 px-2 py-0.5 bg-gray-200 dark:bg-slate-800 rounded-full text-xs text-slate-600 dark:text-slate-400">
                        {tasks.filter(t => t.status === status).length}
                    </span>
                </div>
            </div>
            <div className="p-3 flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 custom-scrollbar">
                {tasks.filter(t => t.status === status).map(task => (
                    <div key={task.id} className="bg-white dark:bg-slate-950 p-4 rounded-lg border border-gray-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-slate-600 transition-all group shadow-sm relative">
                        <div className="flex justify-between items-start mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                            </span>
                            <div className="flex space-x-2">
                                <button onClick={(e) => { e.stopPropagation(); openEditModal(task); }} className="text-slate-400 hover:text-blue-500 p-1" title="Edit">
                                    <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="text-slate-400 hover:text-red-500 p-1" title="Delete">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{task.title}</h4>
                        <p className="text-xs text-slate-500 mb-4 line-clamp-3 leading-relaxed">{task.description}</p>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-900">
                            <div className="text-[10px] text-slate-400">
                                {new Date(task.createdAt).toLocaleDateString()}
                            </div>
                            
                            <select 
                                value={status} 
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => moveTask(task.id, e.target.value as any)}
                                className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-slate-600 dark:text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
                            >
                                <option value="todo">To Do</option>
                                <option value="in-progress">In Progress</option>
                                <option value="done">Done</option>
                            </select>
                        </div>
                    </div>
                ))}
                {tasks.filter(t => t.status === status).length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-lg opacity-60 select-none">
                        <p className="text-xs text-slate-400 dark:text-slate-600">No tasks in this column.</p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Task Management</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Track your app building progress</p>
                </div>
                <button 
                    onClick={openAddModal}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium flex items-center shadow-lg shadow-blue-900/20 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" /> New Task
                </button>
            </div>

            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex gap-6 h-full min-w-[1000px]">
                    <Column title="To Do" status="todo" icon={Circle} color="text-slate-400" />
                    <Column title="In Progress" status="in-progress" icon={Clock} color="text-yellow-500" />
                    <Column title="Completed" status="done" icon={CheckCircle2} color="text-green-500" />
                </div>
            </div>

            {showAddModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Title</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                                    placeholder="Task title"
                                    value={taskForm.title}
                                    onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Priority</label>
                                <select 
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                                    value={taskForm.priority}
                                    onChange={(e) => setTaskForm({...taskForm, priority: e.target.value as any})}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Description</label>
                                <textarea 
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 h-32 resize-none"
                                    placeholder="Task description..."
                                    value={taskForm.description}
                                    onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex justify-end space-x-3">
                            <button 
                                onClick={() => setShowAddModal(false)}
                                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={saveTask}
                                disabled={!taskForm.title}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {editingTask ? 'Update Task' : 'Create Task'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskBoard;
