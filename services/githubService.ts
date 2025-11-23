
import { Octokit } from "@octokit/rest";

export const githubService = {
    connect: async (token: string) => {
        try {
            const octokit = new Octokit({ auth: token });
            const { data: user } = await octokit.rest.users.getAuthenticated();
            return { octokit, user };
        } catch (error) {
            throw new Error("Invalid GitHub Token");
        }
    },

    getUserRepos: async (octokit: any) => {
        try {
            const { data } = await octokit.rest.repos.listForAuthenticatedUser({
                sort: 'updated',
                per_page: 100,
                visibility: 'all'
            });
            return data;
        } catch (error: any) {
            throw new Error("Failed to fetch repositories");
        }
    },

    pushFile: async (octokit: any, owner: string, repo: string, path: string, content: string, message: string) => {
        try {
            // Get current SHA if file exists
            let sha;
            try {
                const { data } = await octokit.rest.repos.getContent({
                    owner,
                    repo,
                    path
                });
                if (!Array.isArray(data)) {
                    sha = data.sha;
                }
            } catch (e) {
                // File doesn't exist, that's fine
            }

            await octokit.rest.repos.createOrUpdateFileContents({
                owner,
                repo,
                path,
                message,
                content: btoa(content),
                sha
            });
            return true;
        } catch (error: any) {
            throw new Error("Failed to push file: " + error.message);
        }
    },

    getRepoFiles: async (octokit: any, owner: string, repo: string) => {
        try {
            // Get default branch
            const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
            const branch = repoData.default_branch;

            // Get Tree recursively
            const { data: refData } = await octokit.rest.git.getRef({ owner, repo, ref: `heads/${branch}` });
            const sha = refData.object.sha;

            const { data: treeData } = await octokit.rest.git.getTree({
                owner,
                repo,
                tree_sha: sha,
                recursive: 'true'
            });

            // Filter blobs (files) and fetch content for text files
            // Note: For large repos this is heavy. Limiting to first 50 files for demo robustness.
            const files = treeData.tree.filter((node: any) => node.type === 'blob').slice(0, 50);
            
            const projectFiles = await Promise.all(files.map(async (file: any) => {
                try {
                    const { data } = await octokit.rest.repos.getContent({
                        owner,
                        repo,
                        path: file.path
                    });
                    
                    if ('content' in data && data.encoding === 'base64') {
                        return {
                            name: file.path,
                            content: atob(data.content),
                            language: file.path.split('.').pop() || 'txt'
                        };
                    }
                    return null;
                } catch (e) {
                    return null;
                }
            }));

            return projectFiles.filter((f: any) => f !== null);
        } catch (error: any) {
            throw new Error("Failed to clone repo: " + error.message);
        }
    }
};
