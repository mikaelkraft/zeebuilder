import React from 'react';
import { View } from '../../types';
import { 
    Shield, Eye, Database, Lock, Globe, Mail, Users, CheckCircle, Zap, Sparkles, ChevronRight 
} from 'lucide-react';

interface PrivacyPolicyProps {
    onNavigate: (view: View) => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onNavigate }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Back navigation */}
                <button 
                    onClick={() => onNavigate(View.HOME)}
                    className="mb-6 flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    Back to Home
                </button>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-6 md:p-8">
                    <div className="space-y-8">
                        {/* Header */}
                        <div className="text-center pb-8 border-b border-gray-200 dark:border-slate-700">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Privacy Policy</h1>
                            <p className="text-gray-500 dark:text-slate-400">Last updated: December 1, 2025</p>
                        </div>

                        {/* Content */}
                        <div className="prose dark:prose-invert max-w-none">
                            {/* Information We Collect */}
                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-blue-500" />
                                    Information We Collect
                                </h2>
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Account Information</h3>
                                    <ul className="space-y-2 text-gray-600 dark:text-slate-300">
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                                            Email address for account creation and communications
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                                            Display name and profile preferences
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                                            Authentication tokens for secure access
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border border-purple-100 dark:border-purple-800 mt-4">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Usage Data</h3>
                                    <ul className="space-y-2 text-gray-600 dark:text-slate-300">
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 text-purple-500 mt-1 flex-shrink-0" />
                                            Projects you create and their associated files
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 text-purple-500 mt-1 flex-shrink-0" />
                                            AI prompts and generated content (for service improvement)
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 text-purple-500 mt-1 flex-shrink-0" />
                                            Feature usage analytics and performance metrics
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 text-purple-500 mt-1 flex-shrink-0" />
                                            API usage statistics and rate limiting data
                                        </li>
                                    </ul>
                                </div>
                            </section>

                            {/* How We Use Your Data */}
                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Database className="w-5 h-5 text-green-500" />
                                    How We Use Your Data
                                </h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {[
                                        { icon: Zap, title: 'Service Delivery', desc: 'Providing AI-powered code generation and app building features' },
                                        { icon: Shield, title: 'Security', desc: 'Protecting your account and detecting fraudulent activity' },
                                        { icon: Sparkles, title: 'Improvements', desc: 'Enhancing AI models and user experience based on usage patterns' },
                                        { icon: Mail, title: 'Communications', desc: 'Sending important updates, feature announcements, and support' }
                                    ].map((item, i) => (
                                        <div key={i} className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 border border-gray-100 dark:border-slate-700">
                                            <div className="flex items-center gap-3 mb-2">
                                                <item.icon className="w-5 h-5 text-green-500" />
                                                <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-slate-400">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Third-Party Services */}
                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-indigo-500" />
                                    Third-Party Services
                                </h2>
                                <p className="text-gray-600 dark:text-slate-300 mb-4">
                                    Zee Builder integrates with the following third-party services:
                                </p>
                                <div className="space-y-3">
                                    {[
                                        { name: 'Google Gemini AI', purpose: 'AI code generation, chat, and content creation' },
                                        { name: 'Supabase', purpose: 'Authentication and cloud data storage' },
                                        { name: 'GitHub', purpose: 'Optional repository integration and deployment' },
                                        { name: 'Vercel/Netlify', purpose: 'Optional project deployment hosting' }
                                    ].map((service, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                                            <span className="font-medium text-gray-900 dark:text-white">{service.name}</span>
                                            <span className="text-sm text-gray-500 dark:text-slate-400">{service.purpose}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Data Security */}
                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-red-500" />
                                    Data Security
                                </h2>
                                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-100 dark:border-red-800">
                                    <p className="text-gray-700 dark:text-slate-300 mb-4">
                                        We implement industry-standard security measures to protect your data:
                                    </p>
                                    <ul className="space-y-2 text-gray-600 dark:text-slate-300">
                                        <li>• End-to-end encryption for data in transit (TLS 1.3)</li>
                                        <li>• Encrypted storage for sensitive data at rest (AES-256)</li>
                                        <li>• Regular security audits and penetration testing</li>
                                        <li>• Secure API key management and rotation</li>
                                        <li>• Two-factor authentication support</li>
                                    </ul>
                                </div>
                            </section>

                            {/* Your Rights */}
                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-amber-500" />
                                    Your Rights
                                </h2>
                                <p className="text-gray-600 dark:text-slate-300 mb-4">
                                    You have the following rights regarding your personal data:
                                </p>
                                <div className="grid md:grid-cols-2 gap-3">
                                    {[
                                        'Access your personal data',
                                        'Request data correction',
                                        'Delete your account and data',
                                        'Export your projects',
                                        'Opt-out of marketing emails',
                                        'Restrict data processing'
                                    ].map((right, i) => (
                                        <div key={i} className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                            <CheckCircle className="w-4 h-4 text-amber-500" />
                                            <span className="text-gray-700 dark:text-slate-300">{right}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Contact */}
                            <section>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Mail className="w-5 h-5 text-blue-500" />
                                    Contact Us
                                </h2>
                                <p className="text-gray-600 dark:text-slate-300">
                                    For privacy-related inquiries, please reach out through our website contact form.
                                </p>
                            </section>
                        </div>
                    </div>
                </div>

                {/* Footer links */}
                <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-500 dark:text-slate-400">
                    <button onClick={() => onNavigate(View.POLICY)} className="text-indigo-500 font-medium">
                        Privacy Policy
                    </button>
                    <button onClick={() => onNavigate(View.TERMS)} className="hover:text-gray-900 dark:hover:text-white transition-colors">
                        Terms of Service
                    </button>
                    <button onClick={() => onNavigate(View.DOCS)} className="hover:text-gray-900 dark:hover:text-white transition-colors">
                        Documentation
                    </button>
                    <button onClick={() => onNavigate(View.DEVELOPERS)} className="hover:text-gray-900 dark:hover:text-white transition-colors">
                        Developers
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
