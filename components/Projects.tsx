
import React, { useState, useEffect } from 'react';
import { SavedProject, View, Stack } from '../types';
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
    FolderOpen
} from 'lucide-react';

interface ProjectsProps {
    onNavigate: (view: View) => void;
    setActiveProject: (id: string) => void;
}

const Projects: React.FC<ProjectsProps> = ({ onNavigate, setActiveProject }) => {
    const [projects, setProjects] = useState<SavedProject[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('zee_projects');
        if (stored) {
            try {
                setProjects(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to load projects", e);
            }
        }
    }, []);

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
                localStorage.setItem('zee_projects', JSON.stringify(updated));
                
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
        // Call parent prop if available or just nav
        if (setActiveProject) setActiveProject(id); // This might trigger Builder reload logic if lifted
        onNavigate(View.BUILDER);
    };

    const getIcon = (stack: Stack) => {
        switch(stack) {
            case 'react': case 'react-ts': return <Code className="w-5 h-5 text-blue-500" />;
            case 'vue': return <Layout className="w-5 h-5 text-green-500" />;
            case 'svelte': return <Layout className="w-5 h-5 text-orange-600" />;
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
                    {filteredProjects.map(project => (
                        <div 
                            key={project.id} 
                            onClick={() => openProject(project.id)}
                            className="group bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer shadow-sm hover:shadow-lg relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                                    {getIcon(project.stack)}
                                </div>
                                <button 
                                    onClick={(e) => deleteProject(project.id, e)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Delete Project"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
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
                    ))}
                </div>
            )}
        </div>
    );
};

export default Projects;
