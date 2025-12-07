import React from 'react';
import { View } from '../../types';
import { 
    Shield, Eye, Database, Lock, Globe, Mail, Users, CheckCircle, Zap, Sparkles, ChevronRight,
    FileText, Clock, Scale, AlertCircle, Gavel, Ban
} from 'lucide-react';

interface PrivacyPolicyProps {
    onNavigate: (view: View) => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onNavigate }) => {
    const effectiveDate = "December 1, 2025";
    const lastUpdated = "December 1, 2025";

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="text-center pb-10 border-b border-gray-200 dark:border-slate-800 mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg shadow-blue-500/20">
                    <Shield className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">Privacy Policy</h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-6">
                    Your privacy is important to us. This policy outlines how we collect, use, and protect your data.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                        <Clock className="w-4 h-4" /> Effective: {effectiveDate}
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                        <FileText className="w-4 h-4" /> Version 2.1.0
                    </span>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Table of Contents - Sticky Sidebar */}
                <aside className="lg:w-64 shrink-0">
                    <div className="lg:sticky lg:top-24">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Contents</h3>
                        <nav className="space-y-1">
                            <button onClick={() => scrollToSection('collect')} className="flex items-center w-full text-left text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                                1. Information We Collect
                            </button>
                            <button onClick={() => scrollToSection('use')} className="flex items-center w-full text-left text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                                2. How We Use Data
                            </button>
                            <button onClick={() => scrollToSection('share')} className="flex items-center w-full text-left text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                                3. Data Sharing
                            </button>
                            <button onClick={() => scrollToSection('security')} className="flex items-center w-full text-left text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                                4. Data Security
                            </button>
                            <button onClick={() => scrollToSection('rights')} className="flex items-center w-full text-left text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                                5. Your Rights
                            </button>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 space-y-16">
                    {/* Information We Collect */}
                    <section id="collect" className="scroll-mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-blue-600">1</span>
                            Information We Collect
                        </h2>
                        
                        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-6 border border-blue-100 dark:border-blue-800 mb-6">
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Account Information</h3>
                            <ul className="space-y-2 text-slate-600 dark:text-slate-300">
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

                        <div className="bg-purple-50 dark:bg-purple-900/10 rounded-xl p-6 border border-purple-100 dark:border-purple-800">
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Usage Data</h3>
                            <ul className="space-y-2 text-slate-600 dark:text-slate-300">
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
                            </ul>
                        </div>
                    </section>

                    {/* How We Use Your Data */}
                    <section id="use" className="scroll-mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-blue-600">2</span>
                            How We Use Your Data
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {[
                                { icon: Zap, title: 'Service Delivery', desc: 'Providing AI-powered code generation and app building features' },
                                { icon: Shield, title: 'Security', desc: 'Protecting your account and detecting fraudulent activity' },
                                { icon: Sparkles, title: 'Improvements', desc: 'Enhancing AI models and user experience based on usage patterns' },
                                { icon: Mail, title: 'Communications', desc: 'Sending important updates, feature announcements, and support' }
                            ].map((item, i) => (
                                <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-gray-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3 mb-2">
                                        <item.icon className="w-5 h-5 text-green-500" />
                                        <h3 className="font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Data Sharing */}
                    <section id="share" className="scroll-mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-blue-600">3</span>
                            Data Sharing
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            We do not sell your personal data. We only share data with third-party service providers who help us operate our business, such as:
                        </p>
                        <ul className="space-y-3 text-slate-600 dark:text-slate-400">
                            <li className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                <Globe className="w-5 h-5 text-blue-500" />
                                <span>Cloud hosting providers (e.g., Vercel, Supabase)</span>
                            </li>
                            <li className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                <Zap className="w-5 h-5 text-yellow-500" />
                                <span>AI model providers (e.g., Google Gemini) for content generation</span>
                            </li>
                            <li className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                <Lock className="w-5 h-5 text-red-500" />
                                <span>Payment processors (e.g., Stripe) for billing</span>
                            </li>
                        </ul>
                    </section>

                    {/* Data Security */}
                    <section id="security" className="scroll-mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-blue-600">4</span>
                            Data Security
                        </h2>
                        <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-6 border border-red-100 dark:border-red-800">
                            <p className="text-slate-700 dark:text-slate-300 mb-4">
                                We implement industry-standard security measures to protect your data:
                            </p>
                            <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                                <li>• End-to-end encryption for data in transit (TLS 1.3)</li>
                                <li>• Encrypted storage for sensitive data at rest (AES-256)</li>
                                <li>• Regular security audits and penetration testing</li>
                                <li>• Secure API key management and rotation</li>
                                <li>• Two-factor authentication support</li>
                            </ul>
                        </div>
                    </section>

                    {/* Your Rights */}
                    <section id="rights" className="scroll-mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-blue-600">5</span>
                            Your Rights
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 mb-4">
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
                                <div key={i} className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
                                    <CheckCircle className="w-4 h-4 text-amber-500" />
                                    <span className="text-slate-700 dark:text-slate-300">{right}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Navigation Footer */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200 dark:border-slate-800">
                        <button
                            onClick={() => onNavigate(View.HOME)}
                            className="flex-1 p-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-left group"
                        >
                            <span className="text-xs text-slate-500 uppercase tracking-wider">Back</span>
                            <span className="block text-slate-900 dark:text-white font-bold mt-1 group-hover:text-blue-600 transition-colors">
                                ← Home
                            </span>
                        </button>
                        <button
                            onClick={() => onNavigate(View.TERMS)}
                            className="flex-1 p-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-left group"
                        >
                            <span className="text-xs text-slate-500 uppercase tracking-wider">Next</span>
                            <span className="block text-slate-900 dark:text-white font-bold mt-1 group-hover:text-blue-600 transition-colors">
                                Terms of Service →
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
