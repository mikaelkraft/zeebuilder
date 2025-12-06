
import React, { useState, useEffect } from 'react';
import { SavedProject, View, Stack, User } from '../types';
import { 
    Folder, 
    Clock, 
    Trash2, 
    Code, 
    Layout, 
    Smartphone, 
    Globe, 
    Terminal, 
    ArrowRight,
    Search,
    FolderOpen,
    Share2,
    Eye,
    Heart,
    Check,
    X,
    Users
} from 'lucide-react';
import { isProjectPublished, publishToCommmunity, unpublishFromCommunity } from '../services/communityService';

interface ProjectsProps {
    user: User | null;
    onNavigate: (view: View) => void;
    setActiveProject: (id: string) => void;
}

const Projects: React.FC<ProjectsProps> = ({ user, onNavigate, setActiveProject }) => {
    const [projects, setProjects] = useState<SavedProject[]>([]);
    const [search, setSearch] = useState('');
    const [publishModal, setPublishModal] = useState<{ open: boolean; project: SavedProject | null }>({ open: false, project: null });
    const [publishDesc, setPublishDesc] = useState('');
    const [publishedIds, setPublishedIds] = useState<Set<string>>(new Set());

    // Get user-specific storage key
    const getProjectsKey = () => user ? `zee_projects_${user.email}` : 'zee_projects_guest';

    useEffect(() => {
        if (!user) return;
        
        const stored = localStorage.getItem(getProjectsKey());
        if (stored) {
            try {
                const loadedProjects = JSON.parse(stored);
                setProjects(loadedProjects);
                // Check which projects are published
                const published = new Set<string>();
                loadedProjects.forEach((p: SavedProject) => {
                    if (isProjectPublished(p.id)) {
                        published.add(p.id);
                    }
                });
                setPublishedIds(published);
            } catch (e) {
                console.error("Failed to load projects", e);
            }
        } else {
            setProjects([]);
        }
    }, [user]);

    const deleteProject = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const project = projects.find(p => p.id === id);
        (window as any).swal({
            title: "Delete Project?",
            text: `Are you sure you want to delete "${project?.name || 'this project'}"? This cannot be undone.`,
            icon: "warning",
            buttons: ["Cancel", "Delete"],
            dangerMode: true,
        }).then((willDelete: boolean) => {
            if (willDelete) {
                const updated = projects.filter(p => p.id !== id);
                setProjects(updated);
                localStorage.setItem(getProjectsKey(), JSON.stringify(updated));
                unpublishFromCommunity(id);
                
                const activeId = localStorage.getItem('zee_active_project_id');
                if (activeId === id) {
                    localStorage.removeItem('zee_active_project_id');
                }
                (window as any).swal("Deleted!", "Project has been deleted.", "success");
            }
        });
    };

    const openProject = (id: string) => {
        localStorage.setItem('zee_active_project_id', id);
        if (setActiveProject) setActiveProject(id);
        onNavigate(View.BUILDER);
    };

    const handlePublish = (e: React.MouseEvent, project: SavedProject) => {
        e.stopPropagation();
        if (publishedIds.has(project.id)) {
            // Unpublish
            unpublishFromCommunity(project.id);
            setPublishedIds(prev => {
                const next = new Set(prev);
                next.delete(project.id);
                return next;
            });
            (window as any).swal("Unpublished!", "Your project has been removed from the community.", "success");
        } else {
            // Open publish modal
            setPublishDesc('');
            setPublishModal({ open: true, project });
        }
    };

    const confirmPublish = () => {
        if (!publishModal.project) return;
        
        const user = localStorage.getItem('zee_user');
        const userData = user ? JSON.parse(user) : { username: 'Anonymous', avatar: '' };
        
        try {
            publishToCommmunity(
                publishModal.project,
                publishDesc || `A ${publishModal.project.stack} project built with Zee AI`,
                userData.username,
                userData.avatar
            );
            
            setPublishedIds(prev => new Set([...prev, publishModal.project!.id]));
            setPublishModal({ open: false, project: null });
            (window as any).swal("Published! 🎉", "Your project is now visible in the Community Showcase on the homepage!", "success");
        } catch (error: any) {
            (window as any).swal("Publish Failed", error.message, "error");
        }
    };

    const getIcon = (stack: Stack) => {
        switch(stack) {
            case 'react': case 'react-ts': return <Code className="w-5 h-5 text-blue-500" />;
            case 'vue': return <Layout className="w-5 h-5 text-green-500" />;
            case 'flutter': return <Smartphone className="w-5 h-5 text-cyan-500" />;
            case 'python': return <Terminal className="w-5 h-5 text-yellow-500" />;
            default: return <Globe className="w-5 h-5 text-orange-500" />;
        }
    };

    const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center">
                        <FolderOpen className="w-8 h-8 mr-3 text-blue-600" />
                        My Projects
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Manage and resume your AI-generated applications.
                    </p>
                </div>
                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search projects..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full md:w-64 pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900/50 border border-dashed border-gray-300 dark:border-slate-800 rounded-2xl">
                    <Folder className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">No projects yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">Start building your first app with Zee AI.</p>
                    <button 
                        onClick={() => onNavigate(View.BUILDER)}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg shadow-blue-900/20 transition-all"
                    >
                        Create Project
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map(project => {
                        const isPublished = publishedIds.has(project.id);
                        return (
                            <div 
                                key={project.id} 
                                onClick={() => openProject(project.id)}
                                className="group bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer shadow-sm hover:shadow-lg relative overflow-hidden"
                            >
                                {/* Published Badge */}
                                {isPublished && (
                                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold rounded-full">
                                        <Users className="w-3 h-3" />
                                        Published
                                    </div>
                                )}
                                
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                                        {getIcon(project.stack)}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={(e) => handlePublish(e, project)}
                                            className={`p-2 rounded-lg transition-colors ${isPublished ? 'text-green-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
                                            title={isPublished ? "Unpublish from Community" : "Publish to Community"}
                                        >
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={(e) => deleteProject(project.id, e)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Delete Project"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1 group-hover:text-blue-500 transition-colors">{project.name}</h3>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-4">{project.stack}</p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-800">
                                    <span className="text-xs text-slate-400 flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {new Date(project.lastModified).toLocaleDateString()}
                                    </span>
                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                        Open <ArrowRight className="w-3 h-3 ml-1" />
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Publish Modal */}
            {publishModal.open && publishModal.project && (
                <div className="fixed inset-0 bg-black/50 z-50 p-4 overflow-y-auto" onClick={() => setPublishModal({ open: false, project: null })}>
                    <div className="min-h-full flex items-center justify-center py-4">
                    <div 
                        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Share2 className="w-5 h-5 text-blue-500" />
                                Publish to Community
                            </h3>
                            <button 
                                onClick={() => setPublishModal({ open: false, project: null })}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl mb-4">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    {getIcon(publishModal.project.stack)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">{publishModal.project.name}</h4>
                                    <p className="text-xs text-slate-500 uppercase">{publishModal.project.stack}</p>
                                </div>
                            </div>

                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Project Description
                            </label>
                            <textarea
                                value={publishDesc}
                                onChange={(e) => setPublishDesc(e.target.value)}
                                placeholder="Tell the community what your project does..."
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                                rows={3}
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                Your project will be visible on the homepage Community Showcase.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setPublishModal({ open: false, project: null })}
                                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmPublish}
                                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Publish
                            </button>
                        </div>
                    </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;
