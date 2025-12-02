import React from 'react';
import { View } from '../../types';
import { 
    FileText, Clock, Shield, Scale, AlertTriangle, Users, CreditCard,
    Ban, Globe, Gavel, Mail, CheckCircle, XCircle, ChevronRight,
    Lock, Eye, Zap, Code, Database, Server, MessageSquare, RefreshCw,
    Copyright, Sparkles, AlertCircle, Info
} from 'lucide-react';

interface TermsOfServiceProps {
    onNavigate: (view: View) => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onNavigate }) => {
    const effectiveDate = "December 1, 2025";
    const lastUpdated = "December 1, 2025";
    const version = "2.1.0";

    const TableOfContents = [
        { id: "acceptance", title: "1. Acceptance of Terms" },
        { id: "eligibility", title: "2. Eligibility" },
        { id: "account", title: "3. Account Registration" },
        { id: "service-description", title: "4. Service Description" },
        { id: "acceptable-use", title: "5. Acceptable Use Policy" },
        { id: "intellectual-property", title: "6. Intellectual Property" },
        { id: "user-content", title: "7. User Content" },
        { id: "ai-usage", title: "8. AI & Generated Content" },
        { id: "payment", title: "9. Payments & Billing" },
        { id: "termination", title: "10. Termination" },
        { id: "disclaimers", title: "11. Disclaimers" },
        { id: "limitation", title: "12. Limitation of Liability" },
        { id: "indemnification", title: "13. Indemnification" },
        { id: "disputes", title: "14. Dispute Resolution" },
        { id: "modifications", title: "15. Modifications" },
        { id: "general", title: "16. General Provisions" },
        { id: "contact", title: "17. Contact Information" },
    ];

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="text-center pb-10 border-b border-gray-200 dark:border-slate-800 mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mb-6 shadow-lg shadow-purple-500/20">
                    <Scale className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">Terms of Service</h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-6">
                    These Terms of Service ("Terms") govern your access to and use of Zee Builder's services. 
                    Please read them carefully before using our platform.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                        <Clock className="w-4 h-4" /> Effective: {effectiveDate}
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                        <FileText className="w-4 h-4" /> Version {version}
                    </span>
                </div>
            </div>

            {/* Important Notice */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl p-8 border border-amber-200 dark:border-amber-800/30 mb-12">
                <div className="flex items-start gap-4">
                    <AlertCircle className="w-8 h-8 text-amber-500 shrink-0" />
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Important Legal Notice</h2>
                        <p className="text-slate-700 dark:text-slate-300 mb-4">
                            By accessing or using Zee Builder, you agree to be bound by these Terms. If you disagree with any part 
                            of these Terms, you may not access the Service.
                        </p>
                        <div className="flex flex-wrap gap-3 text-sm">
                            <span className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-3 py-1.5 rounded-full">
                                <Gavel className="w-4 h-4" /> Binding Agreement
                            </span>
                            <span className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-3 py-1.5 rounded-full">
                                <Scale className="w-4 h-4" /> Arbitration Clause
                            </span>
                            <span className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-3 py-1.5 rounded-full">
                                <Ban className="w-4 h-4" /> Class Action Waiver
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Table of Contents - Sticky Sidebar */}
                <aside className="lg:w-64 shrink-0">
                    <div className="lg:sticky lg:top-24">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Contents</h3>
                        <nav className="space-y-1 max-h-[70vh] overflow-y-auto">
                            {TableOfContents.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    className="flex items-center w-full text-left text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    <ChevronRight className="w-3 h-3 mr-2 opacity-50" />
                                    <span className="truncate">{item.title}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 space-y-12">
                    {/* 1. Acceptance */}
                    <section id="acceptance" className="scroll-mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-purple-600">1</span>
                            Acceptance of Terms
                        </h2>
                        <div className="text-slate-600 dark:text-slate-400 space-y-4">
                            <p>
                                These Terms of Service ("Terms") constitute a legally binding agreement between you ("User", "you", or "your") 
                                and Zee Builder ("Company", "we", "us", or "our") governing your access to and use of the Zee Builder 
                                platform, including all associated websites, applications, APIs, and services (collectively, the "Service").
                            </p>
                            <p>
                                By creating an account, accessing, or using the Service, you acknowledge that:
                            </p>
                            <ul className="space-y-2 text-sm">
                                {[
                                    "You have read, understood, and agree to be bound by these Terms",
                                    "You are at least 18 years old (or age of majority in your jurisdiction)",
                                    "You have the legal capacity to enter into this agreement",
                                    "If acting on behalf of an organization, you have authority to bind that organization",
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-4 text-sm">
                                <p>
                                    <strong>Additional Policies:</strong> These Terms incorporate by reference our{' '}
                                    <button onClick={() => onNavigate(View.POLICY)} className="text-blue-600 hover:underline">Privacy Policy</button>,{' '}
                                    <span className="text-blue-600">Acceptable Use Policy</span>, and any other policies referenced herein.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 2. Eligibility */}
                    <section id="eligibility" className="scroll-mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-purple-600">2</span>
                            Eligibility
                        </h2>
                        <div className="text-slate-600 dark:text-slate-400 space-y-4">
                            <p>To use the Service, you must meet the following eligibility requirements:</p>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-4 border border-green-200 dark:border-green-800/30">
                                    <h3 className="font-bold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" /> Eligible Users
                                    </h3>
                                    <ul className="text-sm text-green-700 dark:text-green-400 space-y-1.5">
                                        <li>• Individuals 18 years or older</li>
                                        <li>• Authorized business representatives</li>
                                        <li>• Users in non-restricted jurisdictions</li>
                                        <li>• Users with valid email addresses</li>
                                    </ul>
                                </div>
                                <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-4 border border-red-200 dark:border-red-800/30">
                                    <h3 className="font-bold text-red-800 dark:text-red-300 mb-2 flex items-center gap-2">
                                        <XCircle className="w-4 h-4" /> Ineligible Users
                                    </h3>
                                    <ul className="text-sm text-red-700 dark:text-red-400 space-y-1.5">
                                        <li>• Individuals under 18 years old</li>
                                        <li>• Previously banned accounts</li>
                                        <li>• Users in embargoed countries</li>
                                        <li>• Entities on sanctions lists</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 3. Account Registration */}
                    <section id="account" className="scroll-mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-purple-600">3</span>
                            Account Registration
                        </h2>
                        <div className="text-slate-600 dark:text-slate-400 space-y-4">
                            <p>When you create an account with us, you agree to:</p>
                            
                            <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                                <div className="divide-y divide-gray-200 dark:divide-slate-700">
                                    {[
                                        { icon: Users, title: "Accurate Information", desc: "Provide true, accurate, current, and complete information during registration and keep it updated." },
                                        { icon: Lock, title: "Account Security", desc: "Maintain the confidentiality of your password and account credentials. You are responsible for all activities under your account." },
                                        { icon: AlertTriangle, title: "Unauthorized Access", desc: "Notify us immediately of any unauthorized access or security breach. We are not liable for losses from unauthorized account use." },
                                        { icon: Ban, title: "Single Account", desc: "Maintain only one account per person. Creating multiple accounts to circumvent restrictions is prohibited." },
                                    ].map((item, i) => (
                                        <div key={i} className="p-4 flex items-start gap-4">
                                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center shrink-0">
                                                <item.icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                                                <p className="text-sm mt-1">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 4. Service Description */}
                    <section id="service-description" className="scroll-mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-purple-600">4</span>
                            Service Description
                        </h2>
                        <div className="text-slate-600 dark:text-slate-400 space-y-4">
                            <p>Zee Builder provides an AI-powered application development platform that includes:</p>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                                {[
                                    { icon: Code, title: "App Builder", desc: "AI-assisted code generation for web and mobile applications" },
                                    { icon: MessageSquare, title: "AI Chat", desc: "Intelligent coding assistant for debugging and development help" },
                                    { icon: Sparkles, title: "Image Studio", desc: "AI-powered image generation and editing capabilities" },
                                    { icon: Zap, title: "Voice & Audio", desc: "Text-to-speech and speech-to-text AI features" },
                                    { icon: Database, title: "Integrations", desc: "Third-party service integrations (databases, APIs, etc.)" },
                                    { icon: Server, title: "Deployment", desc: "Project deployment and hosting assistance" },
                                ].map((item, i) => (
                                    <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex items-start gap-3">
                                        <item.icon className="w-5 h-5 text-purple-500 mt-0.5" />
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{item.title}</h3>
                                            <p className="text-xs mt-1">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-900/30">
                                <p className="text-sm text-blue-800 dark:text-blue-300">
                                    <strong>Service Availability:</strong> We strive for 99.9% uptime but do not guarantee uninterrupted access. 
                                    Scheduled maintenance will be announced in advance when possible. Features may be added, modified, 
                                    or deprecated at our discretion.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 5. Acceptable Use */}
                    <section id="acceptable-use" className="scroll-mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-purple-600">5</span>
                            Acceptable Use Policy
                        </h2>
                        <div className="text-slate-600 dark:text-slate-400 space-y-6">
                            <p>You agree to use the Service only for lawful purposes and in accordance with these Terms.</p>

                            {/* Prohibited Activities */}
                            <div className="bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-800/30 overflow-hidden">
                                <div className="px-6 py-4 bg-red-100 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800/30">
                                    <h3 className="font-bold text-red-800 dark:text-red-300 flex items-center gap-2">
                                        <Ban className="w-5 h-5" /> Prohibited Activities
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                                        {[
                                            { cat: "Illegal Content", items: ["Malware or viruses", "Child exploitation material", "Terrorism-related content", "Illegal goods/services"] },
                                            { cat: "Harmful Activities", items: ["Harassment or bullying", "Hate speech or discrimination", "Doxxing or privacy violations", "Fraud or phishing"] },
                                            { cat: "System Abuse", items: ["Unauthorized access attempts", "DDoS attacks or overloading", "Circumventing rate limits", "Scraping or data mining"] },
                                            { cat: "IP Violations", items: ["Copyright infringement", "Trademark violations", "Pirated software distribution", "Patent infringement"] },
                                        ].map((cat, i) => (
                                            <div key={i}>
                                                <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">{cat.cat}</h4>
                                                <ul className="space-y-1 text-red-700 dark:text-red-400">
                                                    {cat.items.map((item, j) => (
                                                        <li key={j} className="flex items-center gap-2">
                                                            <XCircle className="w-3 h-3" />
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Rate Limits */}
                            <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-6">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-3">Rate Limits & Fair Use</h3>
                                <p className="text-sm mb-4">
                                    To ensure fair access for all users, we enforce the following limits:
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                    {[
                                        { label: "Free Tier", value: "100 req/day" },
                                        { label: "Pro Tier", value: "2,000 req/day" },
                                        { label: "Enterprise", value: "Unlimited" },
                                        { label: "Burst Rate", value: "10 req/min" },
                                    ].map((item, i) => (
                                        <div key={i} className="bg-white dark:bg-slate-900 rounded-lg p-3">
                                            <p className="text-lg font-bold text-purple-600">{item.value}</p>
                                            <p className="text-xs text-slate-500">{item.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <p className="text-sm">
                                <strong>Enforcement:</strong> Violation of this policy may result in immediate suspension or termination 
                                of your account, removal of content, and/or legal action as appropriate.
                            </p>
                        </div>
                    </section>

                    {/* 6. Intellectual Property */}
                    <section id="intellectual-property" className="scroll-mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-purple-600">6</span>
                            Intellectual Property Rights
                        </h2>
                        <div className="text-slate-600 dark:text-slate-400 space-y-4">
                            <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 divide-y divide-gray-200 dark:divide-slate-700">
                                <div className="p-6">
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                        <Copyright className="w-5 h-5 text-purple-500" /> Our Intellectual Property
                                    </h3>
                                    <p className="text-sm">
                                        The Service, including its original content, features, functionality, design, and source code, 
                                        is owned by Zee Builder and protected by international copyright, trademark, patent, trade secret, 
                                        and other intellectual property laws. The "Zee Builder" name, logo, and all related marks are 
                                        trademarks of our company.
                                    </p>
                                </div>
                                <div className="p-6">
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-blue-500" /> License Grant to You
                                    </h3>
                                    <p className="text-sm">
                                        Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license 
                                        to access and use the Service for your personal or internal business purposes. This license does not 
                                        include the right to:
                                    </p>
                                    <ul className="mt-2 space-y-1 text-sm">
                                        {[
                                            "Modify, copy, or create derivative works of the Service",
                                            "Reverse engineer, decompile, or disassemble the Service",
                                            "Remove or alter any proprietary notices",
                                            "Use the Service to build a competing product",
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <XCircle className="w-3 h-3 text-red-500" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 7. User Content */}
                    <section id="user-content" className="scroll-mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-purple-600">7</span>
                            User Content
                        </h2>
                        <div className="text-slate-600 dark:text-slate-400 space-y-4">
                            <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-6 border border-green-200 dark:border-green-800/30">
                                <h3 className="font-bold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" /> You Own Your Content
                                </h3>
                                <p className="text-sm text-green-700 dark:text-green-400">
                                    You retain full ownership of all code, projects, images, and other content you create using the Service 
                                    ("User Content"). We do not claim any intellectual property rights over your User Content.
                                </p>
                            </div>

                            <p>By uploading or creating User Content, you grant us a limited license to:</p>
                            <ul className="space-y-2 text-sm">
                                {[
                                    "Store and display your content to you and those you share it with",
                                    "Process your content through our AI systems to provide the Service",
                                    "Create backups for data protection purposes",
                                    "Display in Community Showcase (only if you explicitly publish)",
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <p className="text-sm">
                                <strong>Your Responsibilities:</strong> You are solely responsible for your User Content and represent that 
                                you have all necessary rights to upload and share it. You agree not to upload content that violates any 
                                third-party rights or applicable laws.
                            </p>
                        </div>
                    </section>

                    {/* 8. AI & Generated Content */}
                    <section id="ai-usage" className="scroll-mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-purple-600">8</span>
                            AI & Generated Content
                        </h2>
                        <div className="text-slate-600 dark:text-slate-400 space-y-4">
                            <p>
                                Our Service uses artificial intelligence (AI) and machine learning technologies powered by Google Gemini 
                                and other providers to generate code, images, and other content.
                            </p>

                            <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800/30">
                                <h3 className="font-bold text-yellow-800 dark:text-yellow-300 mb-3 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" /> AI Disclaimers
                                </h3>
                                <ul className="space-y-2 text-sm text-yellow-700 dark:text-yellow-400">
                                    {[
                                        "AI-generated content may contain errors, bugs, or inaccuracies",
                                        "Generated code should be reviewed and tested before production use",
                                        "AI outputs may occasionally be similar to existing works",
                                        "We cannot guarantee AI outputs will be free from third-party IP",
                                        "AI features may be modified or discontinued without notice",
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <Info className="w-4 h-4 mt-0.5 shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-6 border border-blue-200 dark:border-blue-900/30">
                                <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2">Ownership of AI-Generated Content</h3>
                                <p className="text-sm text-blue-700 dark:text-blue-400">
                                    To the extent permitted by law, you own the AI-generated content created through your use of the Service. 
                                    However, you acknowledge that similar content may be generated for other users. You are responsible for 
                                    ensuring your use of AI-generated content complies with applicable laws.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 9. Payment */}
                    <section id="payment" className="scroll-mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-purple-600">9</span>
                            Payments & Billing
                        </h2>
                        <div className="text-slate-600 dark:text-slate-400 space-y-4">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100 dark:bg-slate-800">
                                            <th className="text-left p-4 font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">Plan</th>
                                            <th className="text-left p-4 font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">Price</th>
                                            <th className="text-left p-4 font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">Billing</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { plan: "Free", price: "$0", billing: "N/A" },
                                            { plan: "Pro", price: "$19/mo", billing: "Monthly, auto-renewal" },
                                            { plan: "Enterprise", price: "Custom", billing: "Annual contract" },
                                        ].map((row, i) => (
                                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="p-4 border border-slate-200 dark:border-slate-700 font-medium">{row.plan}</td>
                                                <td className="p-4 border border-slate-200 dark:border-slate-700">{row.price}</td>
                                                <td className="p-4 border border-slate-200 dark:border-slate-700">{row.billing}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="space-y-3 text-sm">
                                <p><strong>Payment Processing:</strong> All payments are processed securely through Stripe. We do not store your full credit card details.</p>
                                <p><strong>Auto-Renewal:</strong> Paid subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period.</p>
                                <p><strong>Refunds:</strong> We offer a 14-day money-back guarantee for new subscriptions. After 14 days, refunds are at our discretion. No refunds for partial months.</p>
                                <p><strong>Price Changes:</strong> We may change prices with 30 days notice. Existing subscriptions are grandfathered until renewal.</p>
                            </div>
                        </div>
                    </section>

                    {/* 10. Termination */}
                    <section id="termination" className="scroll-mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-purple-600">10</span>
                            Termination
                        </h2>
                        <div className="text-slate-600 dark:text-slate-400 space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Termination by You</h3>
                                    <ul className="space-y-1.5 text-sm">
                                        <li>• Cancel your account at any time from Settings</li>
                                        <li>• Export your data before cancellation</li>
                                        <li>• Active subscriptions end at billing cycle end</li>
                                        <li>• Data deleted 30 days after account closure</li>
                                    </ul>
                                </div>
                                <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Termination by Us</h3>
                                    <ul className="space-y-1.5 text-sm">
                                        <li>• Immediate termination for Terms violations</li>
                                        <li>• 30-day notice for service discontinuation</li>
                                        <li>• No refunds for termination due to violations</li>
                                        <li>• Right to pursue legal remedies preserved</li>
                                    </ul>
                                </div>
                            </div>
                            <p className="text-sm">
                                Upon termination, your right to use the Service immediately ceases. Provisions that should survive 
                                termination (such as intellectual property, disclaimers, and limitations of liability) will remain in effect.
                            </p>
                        </div>
                    </section>

                    {/* 11. Disclaimers */}
                    <section id="disclaimers" className="scroll-mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-purple-600">11</span>
                            Disclaimers
                        </h2>
                        <div className="text-slate-600 dark:text-slate-400 space-y-4">
                            <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-6 border border-red-200 dark:border-red-800/30">
                                <p className="text-sm text-red-800 dark:text-red-300 uppercase font-bold mb-3">Important Legal Disclaimer</p>
                                <p className="text-sm text-red-700 dark:text-red-400 leading-relaxed">
                                    THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, 
                                    INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, 
                                    NON-INFRINGEMENT, AND TITLE. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE, 
                                    THAT DEFECTS WILL BE CORRECTED, OR THAT THE SERVICE IS FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
                                </p>
                            </div>

                            <p className="text-sm">
                                Some jurisdictions do not allow the exclusion of implied warranties, so some of the above exclusions may not apply to you. 
                                In such cases, our liability will be limited to the greatest extent permitted by law.
                            </p>
                        </div>
                    </section>

                    {/* 12. Limitation of Liability */}
                    <section id="limitation" className="scroll-mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-purple-600">12</span>
                            Limitation of Liability
                        </h2>
                        <div className="text-slate-600 dark:text-slate-400 space-y-4">
                            <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-6">
                                <p className="text-sm leading-relaxed">
                                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL ZEE BUILDER, ITS DIRECTORS, EMPLOYEES, PARTNERS, 
                                    AGENTS, SUPPLIERS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE 
                                    DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, 
                                    RESULTING FROM:
                                </p>
                                <ul className="mt-4 space-y-2 text-sm">
                                    {[
                                        "Your access to or use of or inability to access or use the Service",
                                        "Any conduct or content of any third party on the Service",
                                        "Any content obtained from the Service, including AI-generated content",
                                        "Unauthorized access, use, or alteration of your transmissions or content",
                                        "Errors, bugs, or inaccuracies in generated code or content",
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full mt-2" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-900/30">
                                <p className="text-sm text-blue-800 dark:text-blue-300">
                                    <strong>Liability Cap:</strong> Our total liability for any claims under these Terms shall not exceed 
                                    the greater of (a) the amount you paid us in the 12 months preceding the claim, or (b) $100 USD.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 13. Indemnification */}
                    <section id="indemnification" className="scroll-mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-purple-600">13</span>
                            Indemnification
                        </h2>
                        <div className="text-slate-600 dark:text-slate-400 space-y-4">
                            <p>
                                You agree to defend, indemnify, and hold harmless Zee Builder and its officers, directors, employees, 
                                agents, and affiliates from and against any claims, damages, losses, liabilities, costs, and expenses 
                                (including reasonable attorneys' fees) arising out of or relating to:
                            </p>
                            <ul className="space-y-2 text-sm">
                                {[
                                    "Your use of the Service or any activity under your account",
                                    "Your violation of these Terms or any applicable law",
                                    "Your User Content or any content you create, publish, or share",
                                    "Your violation of any third-party rights, including intellectual property rights",
                                    "Any harm caused by applications or code you create using the Service",
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    {/* 14. Dispute Resolution */}
                    <section id="disputes" className="scroll-mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-purple-600">14</span>
                            Dispute Resolution
                        </h2>
                        <div className="text-slate-600 dark:text-slate-400 space-y-4">
                            <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 divide-y divide-gray-200 dark:divide-slate-700">
                                <div className="p-5">
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">1. Informal Resolution</h3>
                                    <p className="text-sm">
                                        Before filing any claim, you agree to contact us at legal@zeebuilder.com and attempt to resolve 
                                        the dispute informally for at least 30 days.
                                    </p>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">2. Binding Arbitration</h3>
                                    <p className="text-sm">
                                        Any disputes not resolved informally shall be resolved through binding arbitration under the 
                                        rules of the American Arbitration Association. Arbitration shall be conducted in Delaware, USA, 
                                        or via videoconference at the claimant's election.
                                    </p>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">3. Class Action Waiver</h3>
                                    <p className="text-sm">
                                        YOU AGREE THAT DISPUTES WILL BE RESOLVED ONLY ON AN INDIVIDUAL BASIS AND NOT IN A CLASS, 
                                        CONSOLIDATED, OR REPRESENTATIVE ACTION. You waive any right to participate in class actions.
                                    </p>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">4. Exceptions</h3>
                                    <p className="text-sm">
                                        Either party may seek injunctive relief in court for intellectual property infringement or 
                                        unauthorized access. Small claims court actions are also permitted.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 15. Modifications */}
                    <section id="modifications" className="scroll-mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-purple-600">15</span>
                            Modifications to Terms
                        </h2>
                        <div className="text-slate-600 dark:text-slate-400 space-y-4">
                            <p>
                                We reserve the right to modify these Terms at any time. When we make material changes:
                            </p>
                            <ul className="space-y-2 text-sm">
                                {[
                                    "We will provide at least 30 days notice before changes take effect",
                                    "Notice will be sent via email and/or prominent website notice",
                                    "The \"Last Updated\" date will be revised",
                                    "Continued use after the effective date constitutes acceptance",
                                    "If you disagree, you must stop using the Service before the effective date",
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <RefreshCw className="w-4 h-4 text-purple-500 mt-0.5" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    {/* 16. General Provisions */}
                    <section id="general" className="scroll-mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-purple-600">16</span>
                            General Provisions
                        </h2>
                        <div className="text-slate-600 dark:text-slate-400 space-y-4">
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                {[
                                    { title: "Governing Law", desc: "These Terms are governed by the laws of the State of Delaware, USA, without regard to conflict of law principles." },
                                    { title: "Entire Agreement", desc: "These Terms, together with our Privacy Policy, constitute the entire agreement between you and Zee Builder." },
                                    { title: "Severability", desc: "If any provision is found unenforceable, the remaining provisions will continue in full force and effect." },
                                    { title: "Waiver", desc: "Our failure to enforce any right or provision does not constitute a waiver of that right." },
                                    { title: "Assignment", desc: "You may not assign these Terms without our consent. We may assign our rights and obligations freely." },
                                    { title: "Force Majeure", desc: "We are not liable for delays or failures due to causes beyond our reasonable control." },
                                ].map((item, i) => (
                                    <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                                        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{item.title}</h3>
                                        <p className="text-xs">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* 17. Contact */}
                    <section id="contact" className="scroll-mt-24">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-purple-600">17</span>
                            Contact Information
                        </h2>
                        <div className="text-slate-600 dark:text-slate-400 space-y-4">
                            <p>For questions about these Terms, please contact us:</p>
                            
                            <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-3">Zee Builder Legal Team</h3>
                                        <div className="space-y-2 text-sm">
                                            <p className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-purple-500" />
                                                <a href="mailto:legal@zeebuilder.com" className="text-blue-600 hover:underline">legal@zeebuilder.com</a>
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <Globe className="w-4 h-4 text-purple-500" />
                                                <a href="https://zeebuilder.com" className="text-blue-600 hover:underline">zeebuilder.com</a>
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-3">Response Time</h3>
                                        <p className="text-sm">
                                            We aim to respond to legal inquiries within 5 business days. For urgent matters, 
                                            please include "URGENT" in your email subject.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Navigation Footer */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200 dark:border-slate-800">
                        <button
                            onClick={() => onNavigate(View.POLICY)}
                            className="flex-1 p-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-left group"
                        >
                            <span className="text-xs text-slate-500 uppercase tracking-wider">Related</span>
                            <span className="block text-slate-900 dark:text-white font-bold mt-1 group-hover:text-purple-600 transition-colors">
                                ← Privacy Policy
                            </span>
                        </button>
                        <button
                            onClick={() => onNavigate(View.DOCS)}
                            className="flex-1 p-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-left group"
                        >
                            <span className="text-xs text-slate-500 uppercase tracking-wider">Also Read</span>
                            <span className="block text-slate-900 dark:text-white font-bold mt-1 group-hover:text-purple-600 transition-colors">
                                Documentation →
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
