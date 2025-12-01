import React from 'react';
import { View } from '../../types';
import { 
    FileText, Code, Image, Mic, MessageSquare, Layers, GitBranch, Database,
    ChevronRight, AlertTriangle, CheckCircle
} from 'lucide-react';

interface TermsOfServiceProps {
    onNavigate: (view: View) => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onNavigate }) => {
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
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <FileText className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Terms of Service</h1>
                            <p className="text-gray-500 dark:text-slate-400">Last updated: December 1, 2025</p>
                        </div>

                        {/* Content */}
                        <div className="prose dark:prose-invert max-w-none">
                            {/* Acceptance */}
                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
                                <p className="text-gray-600 dark:text-slate-300">
                                    By accessing or using Zee Builder, you agree to be bound by these Terms of Service. 
                                    If you disagree with any part of these terms, you may not access the service.
                                </p>
                            </section>

                            {/* Description of Service */}
                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">2. Description of Service</h2>
                                <p className="text-gray-600 dark:text-slate-300 mb-4">
                                    Zee Builder is an AI-powered application development platform that provides:
                                </p>
                                <div className="grid md:grid-cols-2 gap-3">
                                    {[
                                        { icon: Code, text: 'AI-assisted code generation' },
                                        { icon: Image, text: 'Image generation with Imagen 3' },
                                        { icon: Mic, text: 'Voice and audio capabilities' },
                                        { icon: MessageSquare, text: 'AI chat interface' },
                                        { icon: Layers, text: 'Multi-framework app builder' },
                                        { icon: Database, text: 'Cloud project storage' },
                                        { icon: GitBranch, text: 'Version control integration' }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                                            <item.icon className="w-5 h-5 text-purple-500" />
                                            <span className="text-gray-700 dark:text-slate-300">{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* User Accounts */}
                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">3. User Accounts</h2>
                                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border border-purple-100 dark:border-purple-800">
                                    <ul className="space-y-3 text-gray-600 dark:text-slate-300">
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 text-purple-500 mt-1" />
                                            You must provide accurate and complete registration information
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 text-purple-500 mt-1" />
                                            You are responsible for maintaining account security
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 text-purple-500 mt-1" />
                                            You must notify us of any unauthorized account access
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 text-purple-500 mt-1" />
                                            One person or entity may maintain only one free account
                                        </li>
                                    </ul>
                                </div>
                            </section>

                            {/* Acceptable Use */}
                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">4. Acceptable Use</h2>
                                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-100 dark:border-red-800">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-red-500" />
                                        You agree NOT to:
                                    </h3>
                                    <ul className="space-y-2 text-gray-600 dark:text-slate-300">
                                        <li>• Generate malicious code, malware, or exploit code</li>
                                        <li>• Create content that violates intellectual property rights</li>
                                        <li>• Use the service to harass, abuse, or harm others</li>
                                        <li>• Attempt to bypass rate limits or security measures</li>
                                        <li>• Resell or redistribute the service without authorization</li>
                                        <li>• Use automated tools to scrape or abuse the API</li>
                                    </ul>
                                </div>
                            </section>

                            {/* Intellectual Property */}
                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">5. Intellectual Property</h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-5 border border-green-100 dark:border-green-800">
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Your Content</h3>
                                        <p className="text-sm text-gray-600 dark:text-slate-300">
                                            You retain ownership of code and content you create using Zee Builder. 
                                            You grant us a license to host and process your content to provide the service.
                                        </p>
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-100 dark:border-blue-800">
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Our Content</h3>
                                        <p className="text-sm text-gray-600 dark:text-slate-300">
                                            Zee Builder, including its design, features, and branding, is protected by 
                                            intellectual property laws. You may not copy or reverse engineer the platform.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* API Usage */}
                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">6. API Usage</h2>
                                <p className="text-gray-600 dark:text-slate-300 mb-4">
                                    When using the Zee Builder API, you agree to:
                                </p>
                                <ul className="space-y-2 text-gray-600 dark:text-slate-300">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Respect rate limits based on your subscription tier
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Keep your API keys secure and never share them publicly
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Not use the API to build competing services
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Attribute Zee Builder when required by your plan
                                    </li>
                                </ul>
                            </section>

                            {/* Subscription & Billing */}
                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">7. Subscription & Billing</h2>
                                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-6">
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">Free</p>
                                            <p className="text-sm text-gray-500">100 requests/day</p>
                                        </div>
                                        <div className="text-center p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
                                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">Pro</p>
                                            <p className="text-sm text-gray-500">5,000 requests/day</p>
                                        </div>
                                        <div className="text-center p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                                            <p className="text-2xl font-bold text-white">Enterprise</p>
                                            <p className="text-sm text-white/80">Unlimited</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Limitation of Liability */}
                            <section className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">8. Limitation of Liability</h2>
                                <p className="text-gray-600 dark:text-slate-300">
                                    Zee Builder is provided "as is" without warranties. We are not liable for any 
                                    indirect, incidental, or consequential damages arising from your use of the service.
                                    Generated code should be reviewed before use in production environments.
                                </p>
                            </section>

                            {/* Contact */}
                            <section>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">9. Contact</h2>
                                <p className="text-gray-600 dark:text-slate-300">
                                    For questions about these terms, please reach out through our website contact form.
                                </p>
                            </section>
                        </div>
                    </div>
                </div>

                {/* Footer links */}
                <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-500 dark:text-slate-400">
                    <button onClick={() => onNavigate(View.POLICY)} className="hover:text-gray-900 dark:hover:text-white transition-colors">
                        Privacy Policy
                    </button>
                    <button onClick={() => onNavigate(View.TERMS)} className="text-indigo-500 font-medium">
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

export default TermsOfService;
