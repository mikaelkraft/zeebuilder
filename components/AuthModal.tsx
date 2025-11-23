
import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User, Lock, Mail, Github, X, UserPlus, Loader2, AlertCircle, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
    onLogin: (user: any) => void;
    onClose: () => void;
}

type AuthView = 'LOGIN' | 'REGISTER' | 'FORGOT_EMAIL' | 'FORGOT_NEW_PASS' | 'SUCCESS';

const AuthModal: React.FC<AuthModalProps> = ({ onLogin, onClose }) => {
    const [view, setView] = useState<AuthView>('LOGIN');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Reset Flow State
    const [resetEmail, setResetEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const user = await authService.login(email, password);
            onLogin(user);
        } catch (err: any) {
            setError(err.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (!username) throw new Error("Username is required");
            const user = await authService.register(email, password, username);
            onLogin(user);
        } catch (err: any) {
            setError(err.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const exists = await authService.checkEmail(resetEmail);
            if (exists) {
                setView('FORGOT_NEW_PASS');
            } else {
                setError("No account found with this email.");
            }
        } catch (err) {
            setError("Error verifying email.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await authService.resetPassword(resetEmail, newPassword);
            setView('SUCCESS');
        } catch (err: any) {
            setError(err.message || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {view === 'LOGIN' && (
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-900/50">
                                <Lock className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Back</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                                Sign in to Zee Builder to access your projects.
                            </p>
                        </div>
                        
                        {error && <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg flex items-center text-sm"><AlertCircle className="w-4 h-4 mr-2" />{error}</div>}

                        <form onSubmit={handleLoginSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400 dark:text-slate-500" />
                                    <input 
                                        type="email" 
                                        required
                                        className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400 dark:text-slate-500" />
                                    <input 
                                        type="password" 
                                        required
                                        className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end mt-1">
                                    <button type="button" onClick={() => { setView('FORGOT_EMAIL'); setError(null); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                                        Forgot password?
                                    </button>
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                            </button>
                        </form>
                         <div className="mt-6 text-center">
                            <button onClick={() => { setView('REGISTER'); setError(null); }} className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white">
                                Don't have an account? <span className="text-blue-600 dark:text-blue-400 font-bold">Sign up</span>
                            </button>
                        </div>
                    </div>
                )}

                {view === 'REGISTER' && (
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-900/50">
                                <UserPlus className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create Account</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Join Zee Builder today.</p>
                        </div>
                        {error && <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg flex items-center text-sm"><AlertCircle className="w-4 h-4 mr-2" />{error}</div>}
                        <form onSubmit={handleRegisterSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Username</label>
                                <div className="relative">
                                    <UserPlus className="absolute left-3 top-3 w-5 h-5 text-slate-400 dark:text-slate-500" />
                                    <input type="text" required className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" placeholder="johndoe" value={username} onChange={(e) => setUsername(e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400 dark:text-slate-500" />
                                    <input type="email" required className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400 dark:text-slate-500" />
                                    <input type="password" required className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                            </button>
                        </form>
                        <div className="mt-6 text-center">
                            <button onClick={() => { setView('LOGIN'); setError(null); }} className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white">
                                Already have an account? <span className="text-blue-600 dark:text-blue-400 font-bold">Sign in</span>
                            </button>
                        </div>
                    </div>
                )}

                {view === 'FORGOT_EMAIL' && (
                    <div className="p-8">
                        <button onClick={() => { setView('LOGIN'); setError(null); }} className="mb-6 text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center text-sm"><ArrowLeft className="w-4 h-4 mr-1" /> Back to Login</button>
                        <div className="text-center mb-8">
                            <div className="w-12 h-12 bg-slate-800 rounded-xl mx-auto flex items-center justify-center mb-4">
                                <KeyRound className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recover Account</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Enter your email to locate your account.</p>
                        </div>
                        {error && <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg flex items-center text-sm"><AlertCircle className="w-4 h-4 mr-2" />{error}</div>}
                        <form onSubmit={handleForgotEmailSubmit} className="space-y-4">
                             <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400 dark:text-slate-500" />
                                    <input type="email" required className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" placeholder="you@example.com" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
                            </button>
                        </form>
                    </div>
                )}

                {view === 'FORGOT_NEW_PASS' && (
                     <div className="p-8">
                        <div className="text-center mb-8">
                            <div className="w-12 h-12 bg-green-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-green-900/50">
                                <CheckCircle2 className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Reset Password</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Account found for {resetEmail}.<br/>Enter a new password.</p>
                        </div>
                        {error && <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg flex items-center text-sm"><AlertCircle className="w-4 h-4 mr-2" />{error}</div>}
                        <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                             <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400 dark:text-slate-500" />
                                    <input type="password" required className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
                            </button>
                        </form>
                    </div>
                )}

                {view === 'SUCCESS' && (
                     <div className="p-8 text-center">
                         <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300">
                             <CheckCircle2 className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                         </div>
                         <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Password Updated!</h2>
                         <p className="text-slate-500 mb-8">Your password has been reset successfully.</p>
                         <button onClick={() => { setView('LOGIN'); setEmail(resetEmail); setPassword(''); }} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg">
                             Sign In Now
                         </button>
                     </div>
                )}

            </div>
        </div>
    );
};

export default AuthModal;
