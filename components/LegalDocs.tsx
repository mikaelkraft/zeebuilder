
import React, { useState } from 'react';
import { View } from '../types';
import { 
    Shield, FileText, Book, ChevronRight, ExternalLink, Code, Zap, Lock, 
    Eye, Database, Globe, Mail, Clock, AlertTriangle, CheckCircle, 
    Terminal, Cpu, Image, Mic, Video, MessageSquare, Layers, GitBranch,
    ArrowRight, Copy, Play, Sparkles, Box, Settings, Users, Key
} from 'lucide-react';

interface LegalDocsProps {
    view: View;
    onNavigate: (view: View) => void;
}

const LegalDocs: React.FC<LegalDocsProps> = ({ view, onNavigate }) => {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const copyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const CodeBlock: React.FC<{ code: string; language: string; id: string }> = ({ code, language, id }) => (
        <div className="relative group">
            <div className="absolute top-2 right-2 flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{language}</span>
                <button 
                    onClick={() => copyCode(code, id)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                >
                    {copiedCode === id ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                    )}
                </button>
            </div>
            <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto text-sm font-mono text-slate-300">
                <code>{code}</code>
            </pre>
        </div>
    );

    // Privacy Policy Content
    const PrivacyPolicy = () => (
        <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center pb-8 border-b border-gray-200 dark:border-slate-800">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg shadow-blue-500/20">
                    <Shield className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Privacy Policy</h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                    Your privacy matters to us. This policy explains how Zee Builder collects, uses, and protects your information.
                </p>
                <div className="flex items-center justify-center gap-4 mt-6 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Last updated: December 1, 2025</span>
                    <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                    <span>Version 2.0</span>
                </div>
            </div>

            {/* Quick Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-8 border border-blue-100 dark:border-blue-900/30">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-500" /> Quick Summary
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center shrink-0">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Your Data, Your Control</h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">You can export or delete your data at any time from your profile settings.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center shrink-0">
                            <Lock className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Encrypted & Secure</h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">All data is encrypted in transit and at rest using industry-standard protocols.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center shrink-0">
                            <Eye className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800 dark:text-white text-sm">No Data Selling</h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">We never sell your personal information to third parties.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Sections */}
            <div className="space-y-10">
                <section>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                        <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 font-mono text-sm">1</span>
                        Information We Collect
                    </h2>
                    <div className="prose dark:prose-invert max-w-none">
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                            We collect information to provide and improve our services. Here's what we gather:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-gray-200 dark:border-slate-800">
                                <h3 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-blue-500" /> Account Information
                                </h3>
                                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                                    <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-blue-500" /> Email address</li>
                                    <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-blue-500" /> Username and display name</li>
                                    <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-blue-500" /> Profile picture (optional)</li>
                                    <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-blue-500" /> Authentication tokens</li>
                                </ul>
                            </div>
                            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-gray-200 dark:border-slate-800">
                                <h3 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                                    <Database className="w-4 h-4 text-purple-500" /> Usage Data
                                </h3>
                                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                                    <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-purple-500" /> Projects you create</li>
                                    <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-purple-500" /> AI generations and prompts</li>
                                    <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-purple-500" /> Feature usage analytics</li>
                                    <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-purple-500" /> Error logs for debugging</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                        <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 font-mono text-sm">2</span>
                        How We Use Your Information
                    </h2>
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-slate-800">
                        <div className="grid md:grid-cols-2 gap-6">
                            {[
                                { icon: Zap, title: "Service Delivery", desc: "To provide, maintain, and improve Zee Builder features" },
                                { icon: Shield, title: "Security", desc: "To detect, prevent, and address security issues" },
                                { icon: MessageSquare, title: "Communication", desc: "To send updates, newsletters, and support messages" },
                                { icon: Cpu, title: "AI Training", desc: "Anonymized data may be used to improve AI models (opt-out available)" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center shrink-0">
                                        <item.icon className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800 dark:text-white">{item.title}</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                        <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 font-mono text-sm">3</span>
                        Data Storage & Security
                    </h2>
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 rounded-xl p-6 text-white">
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="text-center p-4">
                                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <Lock className="w-6 h-6 text-green-400" />
                                </div>
                                <h3 className="font-bold mb-2">AES-256 Encryption</h3>
                                <p className="text-sm text-slate-400">All data encrypted at rest</p>
                            </div>
                            <div className="text-center p-4">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <Globe className="w-6 h-6 text-blue-400" />
                                </div>
                                <h3 className="font-bold mb-2">TLS 1.3</h3>
                                <p className="text-sm text-slate-400">Secure data in transit</p>
                            </div>
                            <div className="text-center p-4">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <Database className="w-6 h-6 text-purple-400" />
                                </div>
                                <h3 className="font-bold mb-2">SOC 2 Compliant</h3>
                                <p className="text-sm text-slate-400">Enterprise-grade infrastructure</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                        <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 font-mono text-sm">4</span>
                        Your Rights
                    </h2>
                    <div className="space-y-3">
                        {[
                            { title: "Right to Access", desc: "Request a copy of all data we have about you" },
                            { title: "Right to Rectification", desc: "Correct any inaccurate personal data" },
                            { title: "Right to Erasure", desc: "Request deletion of your account and data" },
                            { title: "Right to Data Portability", desc: "Export your data in a machine-readable format" },
                            { title: "Right to Object", desc: "Opt out of marketing communications and AI training" },
                        ].map((right, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-slate-800 dark:text-white">{right.title}</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{right.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                        <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 font-mono text-sm">5</span>
                        Contact Us
                    </h2>
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-slate-800">
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            If you have any questions about this Privacy Policy, please contact us:
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <a href="mailto:privacy@zeebuilder.com" className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                                <Mail className="w-4 h-4" /> privacy@zeebuilder.com
                            </a>
                            <a href="https://x.com/mikaelkraft" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                <ExternalLink className="w-4 h-4" /> @mikaelkraft
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );

    // Terms of Service Content
    const TermsOfService = () => (
        <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center pb-8 border-b border-gray-200 dark:border-slate-800">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-6 shadow-lg shadow-purple-500/20">
                    <FileText className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Terms of Service</h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                    By using Zee Builder, you agree to these terms. Please read them carefully.
                </p>
                <div className="flex items-center justify-center gap-4 mt-6 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Effective: December 1, 2025</span>
                    <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                    <span>Version 2.0</span>
                </div>
            </div>

            {/* Agreement Notice */}
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-amber-800 dark:text-amber-400 mb-2">Important Notice</h3>
                        <p className="text-sm text-amber-700 dark:text-amber-500">
                            By accessing or using Zee Builder, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree, please do not use our services.
                        </p>
                    </div>
                </div>
            </div>

            {/* Terms Sections */}
            <div className="space-y-10">
                <section>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                        <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 font-mono text-sm">1</span>
                        Acceptance of Terms
                    </h2>
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-slate-800">
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Zee Builder ("Service", "we", "us", or "our") provides an AI-powered application development platform. These Terms of Service ("Terms") govern your access to and use of our website, products, and services. By creating an account or using our Service, you agree to these Terms and our Privacy Policy.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                        <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 font-mono text-sm">2</span>
                        User Accounts
                    </h2>
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-gray-200 dark:border-slate-800">
                            <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Account Creation</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-gray-200 dark:border-slate-800">
                            <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Account Security</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                You are responsible for all activities that occur under your account. Notify us immediately of any unauthorized access or security breach.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-gray-200 dark:border-slate-800">
                            <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Age Requirement</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                You must be at least 13 years old to use Zee Builder. If you are under 18, you must have parental consent.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                        <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 font-mono text-sm">3</span>
                        Acceptable Use
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-5 border border-green-200 dark:border-green-900/30">
                            <h3 className="font-semibold text-green-800 dark:text-green-400 mb-3 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> Permitted Uses
                            </h3>
                            <ul className="text-sm text-green-700 dark:text-green-500 space-y-2">
                                <li>• Building applications for personal or commercial use</li>
                                <li>• Generating code, images, and audio content</li>
                                <li>• Using API for authorized integrations</li>
                                <li>• Collaborating on projects with team members</li>
                            </ul>
                        </div>
                        <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-5 border border-red-200 dark:border-red-900/30">
                            <h3 className="font-semibold text-red-800 dark:text-red-400 mb-3 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> Prohibited Uses
                            </h3>
                            <ul className="text-sm text-red-700 dark:text-red-500 space-y-2">
                                <li>• Generating illegal, harmful, or abusive content</li>
                                <li>• Attempting to reverse engineer the service</li>
                                <li>• Circumventing rate limits or security measures</li>
                                <li>• Reselling access without authorization</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                        <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 font-mono text-sm">4</span>
                        Intellectual Property
                    </h2>
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-slate-800">
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Your Content</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    You retain ownership of the content you create using Zee Builder. By using our Service, you grant us a limited license to store and process your content to provide the Service.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800 dark:text-white mb-2">AI-Generated Content</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Content generated by our AI tools may be subject to the underlying AI model's terms. You are responsible for ensuring your use of generated content complies with applicable laws.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Our Intellectual Property</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Zee Builder, its logos, and associated trademarks are our property. The Service's code, design, and infrastructure are protected by intellectual property laws.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                        <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 font-mono text-sm">5</span>
                        Pricing & Payments
                    </h2>
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-slate-800">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <h3 className="font-bold text-slate-800 dark:text-white mb-2">Free Tier</h3>
                                <p className="text-2xl font-black text-blue-600">$0</p>
                                <p className="text-xs text-slate-500 mt-1">Limited API calls</p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                                <h3 className="font-bold text-slate-800 dark:text-white mb-2">Pro</h3>
                                <p className="text-2xl font-black text-purple-600">$19/mo</p>
                                <p className="text-xs text-slate-500 mt-1">5,000 requests/day</p>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl text-white">
                                <h3 className="font-bold mb-2">Enterprise</h3>
                                <p className="text-2xl font-black">Custom</p>
                                <p className="text-xs text-slate-400 mt-1">Unlimited + Support</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 mt-4 text-center">
                            Payments are processed securely. Refunds are handled on a case-by-case basis within 30 days of purchase.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                        <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 font-mono text-sm">6</span>
                        Limitation of Liability
                    </h2>
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6">
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            TO THE MAXIMUM EXTENT PERMITTED BY LAW, ZEE BUILDER SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (A) YOUR USE OR INABILITY TO USE THE SERVICE; (B) ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SERVERS AND/OR ANY PERSONAL INFORMATION STORED THEREIN.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                        <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 font-mono text-sm">7</span>
                        Contact & Disputes
                    </h2>
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-slate-800">
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            For any questions or concerns about these Terms, please contact us:
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <a href="mailto:legal@zeebuilder.com" className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                                <Mail className="w-4 h-4" /> legal@zeebuilder.com
                            </a>
                        </div>
                        <p className="text-xs text-slate-500 mt-4">
                            These Terms are governed by the laws of the State of California, USA. Any disputes shall be resolved through binding arbitration.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );

    // Documentation Content
    const Documentation = () => (
        <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center pb-8 border-b border-gray-200 dark:border-slate-800">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-6 shadow-lg shadow-green-500/20">
                    <Book className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Documentation</h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                    Everything you need to build amazing applications with Zee Builder's AI-powered platform.
                </p>
            </div>

            {/* Quick Start */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl p-8 border border-green-100 dark:border-green-900/30">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                    <Zap className="w-6 h-6 text-green-500" /> Quick Start
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-green-100 dark:border-green-900/30">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                            <span className="text-lg font-bold text-green-600">1</span>
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-white mb-2">Sign Up</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Create your free account to get started with Zee Builder.</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-green-100 dark:border-green-900/30">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                            <span className="text-lg font-bold text-green-600">2</span>
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-white mb-2">Create a Project</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Choose your stack (React, Vue, Flutter, HTML) and start building.</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-green-100 dark:border-green-900/30">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                            <span className="text-lg font-bold text-green-600">3</span>
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-white mb-2">Describe & Generate</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Tell Zee what you want to build and watch the magic happen.</p>
                    </div>
                </div>
            </div>

            {/* Features Documentation */}
            <div className="space-y-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <Layers className="w-6 h-6 text-blue-500" /> Platform Features
                </h2>

                {/* App Builder */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-slate-800">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                <Code className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">App Builder</h3>
                                <p className="text-sm text-slate-500">AI-powered full-stack application development</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 space-y-6">
                        <p className="text-slate-600 dark:text-slate-400">
                            The App Builder is a complete IDE that lets you describe your application in natural language and generates production-ready code instantly.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Supported Stacks</h4>
                                <div className="flex flex-wrap gap-2">
                                    {['React', 'React + TypeScript', 'Vue.js', 'Flutter', 'HTML/CSS/JS'].map(stack => (
                                        <span key={stack} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded">{stack}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Key Features</h4>
                                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                                    <li>• Live preview with hot reload</li>
                                    <li>• Integrated terminal</li>
                                    <li>• Git integration</li>
                                    <li>• Export to GitHub</li>
                                </ul>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-800 dark:text-white mb-3">Example Prompt</h4>
                            <CodeBlock 
                                id="builder-example"
                                language="text"
                                code={`Create a modern e-commerce product page with:
- Hero image carousel
- Product details section with size selector
- Add to cart button with animation
- Customer reviews section
- Related products grid
Use a dark theme with purple accents.`}
                            />
                        </div>
                    </div>
                </div>

                {/* Image Studio */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-slate-800">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                                <Image className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Image Studio</h3>
                                <p className="text-sm text-slate-500">Generate, edit, and animate images with AI</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <p className="text-slate-600 dark:text-slate-400">
                            Create stunning visuals using state-of-the-art image generation models. Edit existing images or animate them for dynamic content.
                        </p>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                                <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                                <h4 className="font-semibold text-slate-800 dark:text-white">Generate</h4>
                                <p className="text-xs text-slate-500 mt-1">Text-to-image generation</p>
                            </div>
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                                <Settings className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                                <h4 className="font-semibold text-slate-800 dark:text-white">Edit</h4>
                                <p className="text-xs text-slate-500 mt-1">Modify existing images</p>
                            </div>
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                                <Play className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                                <h4 className="font-semibold text-slate-800 dark:text-white">Animate</h4>
                                <p className="text-xs text-slate-500 mt-1">Turn images into video</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Video Studio */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-slate-800">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                                <Video className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Video Studio</h3>
                                <p className="text-sm text-slate-500">Generate high-fidelity videos from text</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <p className="text-slate-600 dark:text-slate-400">
                            Powered by Google's Veo models, create professional-quality videos from simple text descriptions.
                        </p>
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Capabilities</h4>
                            <ul className="text-sm text-slate-600 dark:text-slate-400 grid md:grid-cols-2 gap-2">
                                <li>• Text-to-video generation</li>
                                <li>• Multiple aspect ratios (16:9, 9:16)</li>
                                <li>• Up to 1080p resolution</li>
                                <li>• Image-to-video animation</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Audio Studio */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-slate-800">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center">
                                <Mic className="w-6 h-6 text-teal-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Audio Studio</h3>
                                <p className="text-sm text-slate-500">Live conversations, TTS, and transcription</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                                <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Live Conversation</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400">Real-time voice interaction with Zee AI using the Live API.</p>
                            </div>
                            <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                                <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Text-to-Speech</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400">Convert text to natural-sounding speech with multiple voices.</p>
                            </div>
                            <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                                <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Transcription</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400">Convert audio files to accurate text transcripts.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* API Documentation */}
            <div className="space-y-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <Terminal className="w-6 h-6 text-green-500" /> API Reference
                </h2>

                <div className="bg-slate-900 rounded-xl overflow-hidden">
                    <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                        <span className="text-sm font-bold text-green-400">Base URL</span>
                        <code className="text-sm font-mono text-slate-300">https://api.zeebuilder.com/v1</code>
                    </div>
                    <div className="p-6 space-y-6">
                        {/* Authentication */}
                        <div>
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Key className="w-5 h-5 text-yellow-500" /> Authentication
                            </h3>
                            <p className="text-sm text-slate-400 mb-4">
                                All API requests require an API key passed in the <code className="px-1.5 py-0.5 bg-slate-800 rounded text-green-400">X-API-Key</code> header.
                            </p>
                            <CodeBlock 
                                id="auth-example"
                                language="bash"
                                code={`curl -X POST https://api.zeebuilder.com/v1/generate \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: zee_live_your_api_key_here" \\
  -d '{"prompt": "Create a login form"}'`}
                            />
                        </div>

                        {/* Endpoints */}
                        <div>
                            <h3 className="text-lg font-bold text-white mb-4">Endpoints</h3>
                            <div className="space-y-4">
                                {[
                                    { method: 'POST', path: '/generate', desc: 'Generate project files from a prompt', color: 'bg-green-600' },
                                    { method: 'POST', path: '/chat', desc: 'Chat completion with Zee AI', color: 'bg-green-600' },
                                    { method: 'POST', path: '/image', desc: 'Generate images from text', color: 'bg-green-600' },
                                    { method: 'POST', path: '/audio/tts', desc: 'Convert text to speech', color: 'bg-green-600' },
                                    { method: 'POST', path: '/audio/transcribe', desc: 'Transcribe audio to text', color: 'bg-green-600' },
                                    { method: 'GET', path: '/usage', desc: 'Get your API usage statistics', color: 'bg-blue-600' },
                                ].map((endpoint, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 bg-slate-800 rounded-lg">
                                        <span className={`px-2 py-1 ${endpoint.color} text-white text-xs font-bold rounded`}>{endpoint.method}</span>
                                        <code className="text-sm font-mono text-slate-300 flex-1">{endpoint.path}</code>
                                        <span className="text-sm text-slate-500">{endpoint.desc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Code Generation Example */}
                        <div>
                            <h3 className="text-lg font-bold text-white mb-4">Example: Generate Code</h3>
                            <CodeBlock 
                                id="generate-example"
                                language="javascript"
                                code={`const response = await fetch('https://api.zeebuilder.com/v1/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'zee_live_your_api_key'
  },
  body: JSON.stringify({
    prompt: 'Create a responsive navbar with dark mode toggle',
    stack: 'react-ts',
    model: 'gemini-2.5-flash'
  })
});

const data = await response.json();
console.log(data.files); // Array of generated files`}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* SDKs & Resources */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-slate-800">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Box className="w-5 h-5 text-blue-500" /> SDKs & Libraries
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">JavaScript / TypeScript</span>
                            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded">Available</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Python</span>
                            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded">Coming Soon</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Go</span>
                            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded">Coming Soon</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <GitBranch className="w-5 h-5" /> Open Source
                    </h3>
                    <p className="text-sm text-blue-100 mb-4">
                        Check out our GitHub for example projects, templates, and community contributions.
                    </p>
                    <a 
                        href="https://github.com/mikaelkraft" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
                    >
                        <ExternalLink className="w-4 h-4" /> View on GitHub
                    </a>
                </div>
            </div>

            {/* Help & Support */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-gray-200 dark:border-slate-800 text-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Need Help?</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-xl mx-auto">
                    Can't find what you're looking for? Reach out to our support team or join our community.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <a href="mailto:support@zeebuilder.com" className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
                        <Mail className="w-4 h-4" /> Contact Support
                    </a>
                    <button onClick={() => onNavigate(View.DEVELOPERS)} className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors">
                        <Terminal className="w-4 h-4" /> API Console
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in duration-500">
            {/* Navigation Tabs */}
            <div className="flex items-center justify-center gap-2 mb-12 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit mx-auto">
                <button 
                    onClick={() => onNavigate(View.DOCS)}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                        view === View.DOCS 
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                    <Book className="w-4 h-4" /> Documentation
                </button>
                <button 
                    onClick={() => onNavigate(View.POLICY)}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                        view === View.POLICY 
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                    <Shield className="w-4 h-4" /> Privacy
                </button>
                <button 
                    onClick={() => onNavigate(View.TERMS)}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                        view === View.TERMS 
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                    <FileText className="w-4 h-4" /> Terms
                </button>
            </div>

            {/* Content */}
            {view === View.POLICY && <PrivacyPolicy />}
            {view === View.TERMS && <TermsOfService />}
            {view === View.DOCS && <Documentation />}
        </div>
    );
};

export default LegalDocs;
