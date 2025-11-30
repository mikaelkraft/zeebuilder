import { supabase } from './supabaseClient';
import { SavedProject, Task } from '../types';

// Service config type
export interface ServiceConfig {
    serviceId: string;
    serviceName: string;
    serviceType: 'api' | 'integration'; // api = requires keys, integration = no keys needed
    config: Record<string, any>;
    connectedAt: number;
}

// Cloud storage service - syncs data to Supabase when user is logged in
export const cloudStorage = {
    // Get current user ID from Supabase auth
    getUserId: async (): Promise<string | null> => {
        if (!supabase) return null;
        const { data: { user } } = await supabase.auth.getUser();
        return user?.id || null;
    },

    // ============== PROJECTS ==============
    
    // Save project to cloud
    saveProject: async (project: SavedProject): Promise<boolean> => {
        const userId = await cloudStorage.getUserId();
        if (!supabase || !userId) {
            // Fall back to localStorage only
            const stored = localStorage.getItem('zee_projects');
            const projects: SavedProject[] = stored ? JSON.parse(stored) : [];
            const idx = projects.findIndex(p => p.id === project.id);
            if (idx >= 0) projects[idx] = project;
            else projects.push(project);
            localStorage.setItem('zee_projects', JSON.stringify(projects));
            return true;
        }

        try {
            const { error } = await supabase
                .from('projects')
                .upsert({
                    user_id: userId,
                    project_id: project.id,
                    name: project.name,
                    stack: project.stack,
                    files: project.files,
                    messages: project.messages,
                    snapshots: project.snapshots,
                    db_configs: project.dbConfigs,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id,project_id' });

            if (error) throw error;
            
            // Also save to localStorage for offline access
            const stored = localStorage.getItem('zee_projects');
            const projects: SavedProject[] = stored ? JSON.parse(stored) : [];
            const idx = projects.findIndex(p => p.id === project.id);
            if (idx >= 0) projects[idx] = project;
            else projects.push(project);
            localStorage.setItem('zee_projects', JSON.stringify(projects));
            
            return true;
        } catch (e) {
            console.error('Failed to save project to cloud:', e);
            // Still save locally
            const stored = localStorage.getItem('zee_projects');
            const projects: SavedProject[] = stored ? JSON.parse(stored) : [];
            const idx = projects.findIndex(p => p.id === project.id);
            if (idx >= 0) projects[idx] = project;
            else projects.push(project);
            localStorage.setItem('zee_projects', JSON.stringify(projects));
            return false;
        }
    },

    // Load all projects from cloud
    loadProjects: async (): Promise<SavedProject[]> => {
        const userId = await cloudStorage.getUserId();
        
        // Always get localStorage first for quick load
        const stored = localStorage.getItem('zee_projects');
        const localProjects: SavedProject[] = stored ? JSON.parse(stored) : [];

        if (!supabase || !userId) {
            return localProjects;
        }

        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('user_id', userId);

            if (error) throw error;

            if (data && data.length > 0) {
                // Merge cloud and local, preferring newer versions
                const cloudProjects: SavedProject[] = data.map((p: any) => ({
                    id: p.project_id,
                    name: p.name,
                    stack: p.stack,
                    files: p.files || [],
                    messages: p.messages || [],
                    snapshots: p.snapshots || [],
                    dbConfigs: p.db_configs || [],
                    lastModified: new Date(p.updated_at).getTime()
                }));

                // Merge: use cloud version if newer, otherwise local
                const merged: SavedProject[] = [];
                const seenIds = new Set<string>();

                for (const cloudProj of cloudProjects) {
                    const localProj = localProjects.find(l => l.id === cloudProj.id);
                    if (localProj && localProj.lastModified > cloudProj.lastModified) {
                        merged.push(localProj);
                    } else {
                        merged.push(cloudProj);
                    }
                    seenIds.add(cloudProj.id);
                }

                // Add any local-only projects
                for (const localProj of localProjects) {
                    if (!seenIds.has(localProj.id)) {
                        merged.push(localProj);
                        // Sync to cloud
                        cloudStorage.saveProject(localProj);
                    }
                }

                localStorage.setItem('zee_projects', JSON.stringify(merged));
                return merged;
            }

            return localProjects;
        } catch (e) {
            console.error('Failed to load projects from cloud:', e);
            return localProjects;
        }
    },

    // Delete project
    deleteProject: async (projectId: string): Promise<boolean> => {
        const userId = await cloudStorage.getUserId();

        // Remove from localStorage
        const stored = localStorage.getItem('zee_projects');
        const projects: SavedProject[] = stored ? JSON.parse(stored) : [];
        const filtered = projects.filter(p => p.id !== projectId);
        localStorage.setItem('zee_projects', JSON.stringify(filtered));

        if (!supabase || !userId) return true;

        try {
            await supabase
                .from('projects')
                .delete()
                .eq('user_id', userId)
                .eq('project_id', projectId);
            return true;
        } catch (e) {
            console.error('Failed to delete project from cloud:', e);
            return false;
        }
    },

    // ============== SERVICE CONFIGS ==============

    // Save service config
    saveServiceConfig: async (config: ServiceConfig): Promise<boolean> => {
        const userId = await cloudStorage.getUserId();

        // Always save to localStorage
        const stored = localStorage.getItem('zee_service_configs');
        const configs: Record<string, ServiceConfig> = stored ? JSON.parse(stored) : {};
        configs[config.serviceId] = config;
        localStorage.setItem('zee_service_configs', JSON.stringify(configs));

        if (!supabase || !userId) return true;

        try {
            const { error } = await supabase
                .from('service_configs')
                .upsert({
                    user_id: userId,
                    service_id: config.serviceId,
                    service_name: config.serviceName,
                    service_type: config.serviceType,
                    config: config.config,
                    connected_at: new Date(config.connectedAt).toISOString()
                }, { onConflict: 'user_id,service_id' });

            if (error) throw error;
            return true;
        } catch (e) {
            console.error('Failed to save service config to cloud:', e);
            return false;
        }
    },

    // Load all service configs
    loadServiceConfigs: async (): Promise<Record<string, ServiceConfig>> => {
        const userId = await cloudStorage.getUserId();

        // Get localStorage first
        const stored = localStorage.getItem('zee_service_configs');
        const localConfigs: Record<string, ServiceConfig> = stored ? JSON.parse(stored) : {};

        if (!supabase || !userId) return localConfigs;

        try {
            const { data, error } = await supabase
                .from('service_configs')
                .select('*')
                .eq('user_id', userId);

            if (error) throw error;

            if (data && data.length > 0) {
                const cloudConfigs: Record<string, ServiceConfig> = {};
                for (const cfg of data) {
                    cloudConfigs[cfg.service_id] = {
                        serviceId: cfg.service_id,
                        serviceName: cfg.service_name,
                        serviceType: cfg.service_type,
                        config: cfg.config || {},
                        connectedAt: new Date(cfg.connected_at).getTime()
                    };
                }

                // Merge local into cloud (local wins for now, then sync)
                const merged = { ...cloudConfigs, ...localConfigs };
                localStorage.setItem('zee_service_configs', JSON.stringify(merged));

                // Sync any local-only to cloud
                for (const [id, cfg] of Object.entries(localConfigs)) {
                    if (!cloudConfigs[id]) {
                        cloudStorage.saveServiceConfig(cfg);
                    }
                }

                return merged;
            }

            return localConfigs;
        } catch (e) {
            console.error('Failed to load service configs from cloud:', e);
            return localConfigs;
        }
    },

    // Delete service config
    deleteServiceConfig: async (serviceId: string): Promise<boolean> => {
        const userId = await cloudStorage.getUserId();

        // Remove from localStorage
        const stored = localStorage.getItem('zee_service_configs');
        const configs: Record<string, ServiceConfig> = stored ? JSON.parse(stored) : {};
        delete configs[serviceId];
        localStorage.setItem('zee_service_configs', JSON.stringify(configs));

        if (!supabase || !userId) return true;

        try {
            await supabase
                .from('service_configs')
                .delete()
                .eq('user_id', userId)
                .eq('service_id', serviceId);
            return true;
        } catch (e) {
            console.error('Failed to delete service config from cloud:', e);
            return false;
        }
    },

    // ============== TASKS ==============

    // Save task
    saveTask: async (task: Task): Promise<boolean> => {
        const userId = await cloudStorage.getUserId();

        // Save to localStorage
        const stored = localStorage.getItem('zee_tasks');
        const tasks: Task[] = stored ? JSON.parse(stored) : [];
        const idx = tasks.findIndex(t => t.id === task.id);
        if (idx >= 0) tasks[idx] = task;
        else tasks.push(task);
        localStorage.setItem('zee_tasks', JSON.stringify(tasks));

        if (!supabase || !userId) return true;

        try {
            const { error } = await supabase
                .from('tasks')
                .upsert({
                    user_id: userId,
                    task_id: task.id,
                    title: task.title,
                    description: task.description,
                    priority: task.priority,
                    status: task.status,
                    due_date: task.dueDate,
                    project_id: task.projectId
                }, { onConflict: 'user_id,task_id' });

            if (error) throw error;
            return true;
        } catch (e) {
            console.error('Failed to save task to cloud:', e);
            return false;
        }
    },

    // Load all tasks
    loadTasks: async (): Promise<Task[]> => {
        const userId = await cloudStorage.getUserId();

        const stored = localStorage.getItem('zee_tasks');
        const localTasks: Task[] = stored ? JSON.parse(stored) : [];

        if (!supabase || !userId) return localTasks;

        try {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', userId);

            if (error) throw error;

            if (data && data.length > 0) {
                const cloudTasks: Task[] = data.map((t: any) => ({
                    id: t.task_id,
                    title: t.title,
                    description: t.description,
                    priority: t.priority,
                    status: t.status,
                    dueDate: t.due_date,
                    projectId: t.project_id,
                    createdAt: new Date(t.created_at).getTime()
                }));

                // Merge
                const merged: Task[] = [...cloudTasks];
                const seenIds = new Set(cloudTasks.map(t => t.id));

                for (const localTask of localTasks) {
                    if (!seenIds.has(localTask.id)) {
                        merged.push(localTask);
                        cloudStorage.saveTask(localTask);
                    }
                }

                localStorage.setItem('zee_tasks', JSON.stringify(merged));
                return merged;
            }

            return localTasks;
        } catch (e) {
            console.error('Failed to load tasks from cloud:', e);
            return localTasks;
        }
    },

    // Delete task
    deleteTask: async (taskId: string): Promise<boolean> => {
        const userId = await cloudStorage.getUserId();

        const stored = localStorage.getItem('zee_tasks');
        const tasks: Task[] = stored ? JSON.parse(stored) : [];
        localStorage.setItem('zee_tasks', JSON.stringify(tasks.filter(t => t.id !== taskId)));

        if (!supabase || !userId) return true;

        try {
            await supabase
                .from('tasks')
                .delete()
                .eq('user_id', userId)
                .eq('task_id', taskId);
            return true;
        } catch (e) {
            console.error('Failed to delete task from cloud:', e);
            return false;
        }
    },

    // ============== SYNC ALL ==============

    // Force sync all data to cloud
    syncAll: async (): Promise<{ success: boolean; synced: string[] }> => {
        const userId = await cloudStorage.getUserId();
        if (!supabase || !userId) {
            return { success: false, synced: [] };
        }

        const synced: string[] = [];

        try {
            // Sync projects
            const projects = await cloudStorage.loadProjects();
            for (const project of projects) {
                await cloudStorage.saveProject(project);
            }
            synced.push(`${projects.length} projects`);

            // Sync service configs
            const configs = await cloudStorage.loadServiceConfigs();
            for (const config of Object.values(configs)) {
                await cloudStorage.saveServiceConfig(config);
            }
            synced.push(`${Object.keys(configs).length} services`);

            // Sync tasks
            const tasks = await cloudStorage.loadTasks();
            for (const task of tasks) {
                await cloudStorage.saveTask(task);
            }
            synced.push(`${tasks.length} tasks`);

            return { success: true, synced };
        } catch (e) {
            console.error('Sync failed:', e);
            return { success: false, synced };
        }
    }
};
