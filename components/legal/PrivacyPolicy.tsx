import React from 'react';
import { View } from '../../types';
import { 
    Shield, Clock, CheckCircle, Lock, Eye, Database, Globe, Mail, 
    Users, Server, AlertTriangle, FileText, ExternalLink, ChevronRight,
    Smartphone, Cookie, BarChart3, Trash2, Download, Settings, Bell
} from 'lucide-react';

interface PrivacyPolicyProps {
    onNavigate: (view: View) => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onNavigate }) => {
    const effectiveDate = "December 1, 2025";
    const lastUpdated = "December 1, 2025";
    const version = "2.1.0";

    const TableOfContents = [
        { id: "introduction", title: "1. Introduction" },
        { id: "definitions", title: "2. Definitions" },
        { id: "data-collection", title: "3. Information We Collect" },
        { id: "data-use", title: "4. How We Use Your Information" },
        { id: "data-sharing", title: "5. Information Sharing & Disclosure" },
        { id: "data-retention", title: "6. Data Retention" },
        { id: "data-security", title: "7. Security Measures" },
        { id: "cookies", title: "8. Cookies & Tracking" },
        { id: "your-rights", title: "9. Your Privacy Rights" },
        { id: "children", title: "10. Children's Privacy" },
        { id: "international", title: "11. International Data Transfers" },
        { id: "changes", title: "12. Changes to This Policy" },
        { id: "contact", title: "13. Contact Us" },
    ];

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
                    This Privacy Policy describes how Zee Builder ("we", "us", or "our") collects, uses, 
                    and shares information about you when you use our services.
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

            {/* Quick Summary */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl p-8 border border-green-200 dark:border-green-800/30 mb-12">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-green-500" /> Privacy at a Glance
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { icon: Lock, title: "Data Encrypted", desc: "AES-256 encryption for data at rest and TLS 1.3 in transit" },
                        { icon: Eye, title: "No Data Selling", desc: "We never sell your personal data to third parties" },
                        { icon: Download, title: "Data Portability", desc: "Export your data anytime in standard formats" },
                        { icon: Trash2, title: "Right to Delete", desc: "Request complete deletion of your data" },
                    ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center shrink-0">
                                <item.icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800 dark:text-white text-sm">{item.title}</h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Table of Contents - Sticky Sidebar */}
                <aside className="lg:w-64 shrink-0">
                    <div className="lg:sticky lg:top-24">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Contents</h3>
                        <nav className="space-y-1">
                            {TableOfContents.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    className="flex items-center w-full text-left text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    <ChevronRight className="w-3 h-3 mr-2 opacity-50" />
                                    {item.title}
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 prose prose-slate dark:prose-invert max-w-none">
                    {/* 1. Introduction */}
                    <section id="introduction" className="scroll-mt-24 mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-blue-600">1</span>
                            Introduction
                        </h2>
                        <div className="text-slate-600 dark:text-slate-400 space-y-4">
                            <p>
                                Welcome to Zee Builder. We are committed to protecting your privacy and ensuring that your personal 
                                information is handled responsibly and in accordance with applicable data protection laws, including 
                                the General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and other 
                                relevant privacy legislation.
                            </p>
                            <p>
                                This Privacy Policy applies to all information collected through our platform at zeebuilder.com (the "Service"), 
                                including our web application, APIs, and any related services, sales, marketing, or events.
                            </p>
                            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30">
                                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                    <strong>Please read this policy carefully.</strong> By using our Service, you acknowledge that you have 
                                    read, understood, and agree to be bound by this Privacy Policy. If you do not agree, please discontinue 
                                    use of our Service immediately.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 2. Definitions */}
                    <section id="definitions" className="scroll-mt-24 mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-blue-600">2</span>
                            Definitions
                        </h2>
                        <div className="space-y-4 text-slate-600 dark:text-slate-400">
                            <p>For the purposes of this Privacy Policy:</p>
                            <dl className="space-y-3">
                                {[
                                    { term: "Personal Data", def: "Any information that relates to an identified or identifiable individual." },
                                    { term: "Processing", def: "Any operation performed on Personal Data, whether automated or not, such as collection, recording, organization, storage, adaptation, retrieval, use, disclosure, or erasure." },
                                    { term: "Data Controller", def: "The entity that determines the purposes and means of processing Personal Data. For this Service, Zee Builder is the Data Controller." },
                                    { term: "Data Processor", def: "An entity that processes Personal Data on behalf of the Data Controller." },
                                    { term: "User", def: "An individual who uses our Service. Referred to as 'you' throughout this policy." },
                                    { term: "Service", def: "The Zee Builder platform, including the website, web application, APIs, and all related services." },
                                ].map((item, i) => (
                                    <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                                        <dt className="font-semibold text-slate-900 dark:text-white">{item.term}</dt>
                                        <dd className="mt-1 text-sm">{item.def}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </section>

                    {/* 3. Information We Collect */}
                    <section id="data-collection" className="scroll-mt-24 mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-blue-600">3</span>
                            Information We Collect
                        </h2>
                        <div className="space-y-6 text-slate-600 dark:text-slate-400">
                            <p>We collect information in the following ways:</p>

                            {/* 3.1 Information You Provide */}
                            <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Users className="w-5 h-5 text-blue-500" />
                                        3.1 Information You Provide Directly
                                    </h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {[
                                            { title: "Account Information", items: ["Email address", "Username", "Password (encrypted)", "Profile picture"] },
                                            { title: "Payment Information", items: ["Billing address", "Payment method details", "Transaction history"] },
                                            { title: "Content & Projects", items: ["Code files you create", "Project configurations", "Chat messages with AI", "Generated images/media"] },
                                            { title: "Communications", items: ["Support tickets", "Feedback submissions", "Survey responses"] },
                                        ].map((cat, i) => (
                                            <div key={i} className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                                                <h4 className="font-semibold text-slate-800 dark:text-white text-sm mb-2">{cat.title}</h4>
                                                <ul className="text-sm space-y-1">
                                                    {cat.items.map((item, j) => (
                                                        <li key={j} className="flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* 3.2 Automatically Collected */}
                            <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Server className="w-5 h-5 text-purple-500" />
                                        3.2 Information Collected Automatically
                                    </h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {[
                                            { title: "Device Information", items: ["Device type and model", "Operating system", "Browser type and version", "Screen resolution"] },
                                            { title: "Usage Data", items: ["Features accessed", "Time spent on pages", "Click patterns", "Error logs"] },
                                            { title: "Network Data", items: ["IP address", "Approximate location", "Internet service provider", "Referral URLs"] },
                                            { title: "Performance Data", items: ["Load times", "Crash reports", "API response times", "Resource usage"] },
                                        ].map((cat, i) => (
                                            <div key={i} className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                                                <h4 className="font-semibold text-slate-800 dark:text-white text-sm mb-2">{cat.title}</h4>
                                                <ul className="text-sm space-y-1">
                                                    {cat.items.map((item, j) => (
                                                        <li key={j} className="flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* 3.3 Third-Party Sources */}
                            <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Globe className="w-5 h-5 text-green-500" />
                                        3.3 Information from Third Parties
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <p className="mb-4">When you connect third-party services, we may receive:</p>
                                    <ul className="space-y-2 text-sm">
                                        {[
                                            "GitHub: Username, email, avatar, repository information (with your permission)",
                                            "Google OAuth: Email address, name, profile picture",
                                            "Payment Processors: Transaction status, last 4 digits of card (never full card numbers)",
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 4. How We Use Your Information */}
                    <section id="data-use" className="scroll-mt-24 mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-blue-600">4</span>
                            How We Use Your Information
                        </h2>
                        <div className="space-y-6 text-slate-600 dark:text-slate-400">
                            <p>We use collected information for the following purposes, each with a specific legal basis:</p>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100 dark:bg-slate-800">
                                            <th className="text-left p-4 font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">Purpose</th>
                                            <th className="text-left p-4 font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">Legal Basis (GDPR)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { purpose: "Provide and maintain the Service", basis: "Contract Performance" },
                                            { purpose: "Process payments and billing", basis: "Contract Performance" },
                                            { purpose: "Send transactional emails (receipts, updates)", basis: "Contract Performance" },
                                            { purpose: "Respond to support requests", basis: "Contract Performance" },
                                            { purpose: "Improve and optimize the Service", basis: "Legitimate Interest" },
                                            { purpose: "Analyze usage patterns and trends", basis: "Legitimate Interest" },
                                            { purpose: "Prevent fraud and abuse", basis: "Legitimate Interest" },
                                            { purpose: "Comply with legal obligations", basis: "Legal Obligation" },
                                            { purpose: "Send marketing communications", basis: "Consent" },
                                            { purpose: "Personalize your experience", basis: "Consent" },
                                        ].map((row, i) => (
                                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="p-4 border border-slate-200 dark:border-slate-700">{row.purpose}</td>
                                                <td className="p-4 border border-slate-200 dark:border-slate-700">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        row.basis === 'Consent' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                        row.basis === 'Contract Performance' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                        row.basis === 'Legal Obligation' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                    }`}>
                                                        {row.basis}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    {/* 5. Information Sharing */}
                    <section id="data-sharing" className="scroll-mt-24 mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-blue-600">5</span>
                            Information Sharing & Disclosure
                        </h2>
                        <div className="space-y-6 text-slate-600 dark:text-slate-400">
                            <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-6 border border-red-200 dark:border-red-900/30">
                                <div className="flex items-start gap-4">
                                    <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-bold text-red-800 dark:text-red-300 mb-2">We Do Not Sell Your Data</h3>
                                        <p className="text-sm text-red-700 dark:text-red-400">
                                            We do not sell, rent, or trade your personal information to third parties for marketing purposes. 
                                            Your data is not a product we monetize.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <p>We may share your information only in these limited circumstances:</p>

                            <div className="space-y-4">
                                {[
                                    {
                                        title: "Service Providers",
                                        desc: "We share data with trusted third-party vendors who assist in operating our Service:",
                                        items: ["Cloud hosting (Vercel, AWS)", "Payment processing (Stripe)", "Email delivery (SendGrid)", "Analytics (privacy-focused tools)"],
                                        note: "All service providers are bound by data processing agreements and cannot use your data for their own purposes."
                                    },
                                    {
                                        title: "Legal Requirements",
                                        desc: "We may disclose information if required by law:",
                                        items: ["Court orders or subpoenas", "Government agency requests", "Fraud prevention", "Protection of rights and safety"]
                                    },
                                    {
                                        title: "Business Transfers",
                                        desc: "In the event of a merger, acquisition, or sale:",
                                        items: ["Data may be transferred as part of the transaction", "You will be notified of any change in ownership", "This policy will continue to apply to transferred data"]
                                    },
                                    {
                                        title: "With Your Consent",
                                        desc: "We may share information when you explicitly authorize us to do so:",
                                        items: ["Publishing projects to community showcase", "Connecting third-party integrations", "Sharing with collaborators you invite"]
                                    }
                                ].map((section, i) => (
                                    <div key={i} className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-2">{section.title}</h3>
                                        <p className="text-sm mb-3">{section.desc}</p>
                                        <ul className="space-y-1.5 text-sm">
                                            {section.items.map((item, j) => (
                                                <li key={j} className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                        {section.note && (
                                            <p className="mt-3 text-xs text-slate-500 dark:text-slate-500 italic">{section.note}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* 6. Data Retention */}
                    <section id="data-retention" className="scroll-mt-24 mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-blue-600">6</span>
                            Data Retention
                        </h2>
                        <div className="space-y-4 text-slate-600 dark:text-slate-400">
                            <p>We retain your personal data only as long as necessary for the purposes outlined in this policy:</p>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100 dark:bg-slate-800">
                                            <th className="text-left p-4 font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">Data Type</th>
                                            <th className="text-left p-4 font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">Retention Period</th>
                                            <th className="text-left p-4 font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { type: "Account Data", period: "Duration of account + 30 days", reason: "Account recovery window" },
                                            { type: "Project Files", period: "Until you delete them", reason: "User-controlled content" },
                                            { type: "Usage Logs", period: "90 days", reason: "Debugging and analytics" },
                                            { type: "Payment Records", period: "7 years", reason: "Legal/tax requirements" },
                                            { type: "Support Tickets", period: "2 years", reason: "Service improvement" },
                                            { type: "Security Logs", period: "1 year", reason: "Fraud prevention" },
                                        ].map((row, i) => (
                                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="p-4 border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-white">{row.type}</td>
                                                <td className="p-4 border border-slate-200 dark:border-slate-700">{row.period}</td>
                                                <td className="p-4 border border-slate-200 dark:border-slate-700 text-sm">{row.reason}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <p className="text-sm">
                                After the retention period expires, data is either anonymized for aggregate analytics or securely deleted.
                            </p>
                        </div>
                    </section>

                    {/* 7. Security */}
                    <section id="data-security" className="scroll-mt-24 mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-blue-600">7</span>
                            Security Measures
                        </h2>
                        <div className="space-y-6 text-slate-600 dark:text-slate-400">
                            <p>We implement industry-standard security measures to protect your data:</p>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                                {[
                                    { icon: Lock, title: "Encryption", items: ["AES-256 encryption at rest", "TLS 1.3 in transit", "End-to-end encryption for sensitive data"] },
                                    { icon: Shield, title: "Access Control", items: ["Role-based access control", "Multi-factor authentication", "Regular access audits"] },
                                    { icon: Server, title: "Infrastructure", items: ["SOC 2 Type II compliant hosting", "Regular security patching", "DDoS protection"] },
                                    { icon: Eye, title: "Monitoring", items: ["24/7 security monitoring", "Intrusion detection systems", "Automated threat response"] },
                                ].map((cat, i) => (
                                    <div key={i} className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
                                        <div className="flex items-center gap-3 mb-3">
                                            <cat.icon className="w-5 h-5 text-blue-500" />
                                            <h3 className="font-bold text-slate-900 dark:text-white">{cat.title}</h3>
                                        </div>
                                        <ul className="space-y-1.5 text-sm">
                                            {cat.items.map((item, j) => (
                                                <li key={j} className="flex items-center gap-2">
                                                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-900/30">
                                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                    <strong>Security Incident Response:</strong> In the event of a data breach, we will notify affected users within 72 hours 
                                    as required by GDPR. We maintain an incident response plan and conduct regular security drills.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 8. Cookies */}
                    <section id="cookies" className="scroll-mt-24 mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-blue-600">8</span>
                            Cookies & Tracking Technologies
                        </h2>
                        <div className="space-y-6 text-slate-600 dark:text-slate-400">
                            <p>We use cookies and similar technologies to enhance your experience:</p>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100 dark:bg-slate-800">
                                            <th className="text-left p-4 font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">Cookie Type</th>
                                            <th className="text-left p-4 font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">Purpose</th>
                                            <th className="text-left p-4 font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">Duration</th>
                                            <th className="text-left p-4 font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">Can Opt-Out?</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { type: "Essential", purpose: "Authentication, security, preferences", duration: "Session / 1 year", optOut: "No" },
                                            { type: "Functional", purpose: "Remember choices, personalization", duration: "1 year", optOut: "Yes" },
                                            { type: "Analytics", purpose: "Usage statistics, performance", duration: "2 years", optOut: "Yes" },
                                            { type: "Marketing", purpose: "Not used", duration: "N/A", optOut: "N/A" },
                                        ].map((row, i) => (
                                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="p-4 border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-white">{row.type}</td>
                                                <td className="p-4 border border-slate-200 dark:border-slate-700">{row.purpose}</td>
                                                <td className="p-4 border border-slate-200 dark:border-slate-700">{row.duration}</td>
                                                <td className="p-4 border border-slate-200 dark:border-slate-700">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                        row.optOut === 'Yes' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                        row.optOut === 'No' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                        'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                                    }`}>
                                                        {row.optOut}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <p className="text-sm">
                                You can manage cookie preferences through your browser settings or our cookie consent banner. 
                                Note that disabling essential cookies may affect the functionality of the Service.
                            </p>
                        </div>
                    </section>

                    {/* 9. Your Rights */}
                    <section id="your-rights" className="scroll-mt-24 mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-blue-600">9</span>
                            Your Privacy Rights
                        </h2>
                        <div className="space-y-6 text-slate-600 dark:text-slate-400">
                            <p>Depending on your location, you have various rights regarding your personal data:</p>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                                {[
                                    { icon: Eye, title: "Right to Access", desc: "Request a copy of all personal data we hold about you" },
                                    { icon: FileText, title: "Right to Rectification", desc: "Correct inaccurate or incomplete personal data" },
                                    { icon: Trash2, title: "Right to Erasure", desc: "Request deletion of your personal data ('right to be forgotten')" },
                                    { icon: Download, title: "Right to Portability", desc: "Receive your data in a structured, machine-readable format" },
                                    { icon: Lock, title: "Right to Restrict", desc: "Limit how we process your personal data" },
                                    { icon: AlertTriangle, title: "Right to Object", desc: "Object to processing based on legitimate interests" },
                                    { icon: Settings, title: "Right to Withdraw Consent", desc: "Withdraw previously given consent at any time" },
                                    { icon: Bell, title: "Right to Complain", desc: "Lodge a complaint with a supervisory authority" },
                                ].map((right, i) => (
                                    <div key={i} className="flex items-start gap-3 bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
                                            <right.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{right.title}</h3>
                                            <p className="text-xs mt-1">{right.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-6 border border-blue-200 dark:border-blue-900/30">
                                <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-3">How to Exercise Your Rights</h3>
                                <p className="text-sm text-blue-700 dark:text-blue-400 mb-4">
                                    To exercise any of these rights, you can:
                                </p>
                                <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-blue-500" />
                                        Visit your Profile Settings and use the data export/delete options
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-blue-500" />
                                        Email us at <a href="mailto:privacy@zeebuilder.com" className="underline">privacy@zeebuilder.com</a>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-blue-500" />
                                        We will respond within 30 days (or sooner as required by law)
                                    </li>
                                </ul>
                            </div>

                            {/* CCPA Specific */}
                            <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-6">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-3">California Residents (CCPA)</h3>
                                <p className="text-sm mb-3">
                                    California residents have additional rights under the California Consumer Privacy Act:
                                </p>
                                <ul className="space-y-1.5 text-sm">
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                        Right to know what personal information is collected
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                        Right to know if personal information is sold or disclosed
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                        Right to opt-out of the sale of personal information (we do not sell data)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                        Right to non-discrimination for exercising privacy rights
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 10. Children's Privacy */}
                    <section id="children" className="scroll-mt-24 mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-blue-600">10</span>
                            Children's Privacy
                        </h2>
                        <div className="space-y-4 text-slate-600 dark:text-slate-400">
                            <p>
                                Zee Builder is not intended for children under the age of 13 (or 16 in the European Economic Area). 
                                We do not knowingly collect personal information from children.
                            </p>
                            <p>
                                If you are a parent or guardian and believe your child has provided us with personal information, 
                                please contact us at <a href="mailto:privacy@zeebuilder.com" className="text-blue-600 hover:underline">privacy@zeebuilder.com</a>. 
                                We will take steps to delete such information promptly.
                            </p>
                        </div>
                    </section>

                    {/* 11. International Transfers */}
                    <section id="international" className="scroll-mt-24 mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-blue-600">11</span>
                            International Data Transfers
                        </h2>
                        <div className="space-y-4 text-slate-600 dark:text-slate-400">
                            <p>
                                Our Service is hosted in the United States. If you are accessing the Service from outside the US, 
                                please be aware that your information may be transferred to, stored, and processed in the US.
                            </p>
                            <p>
                                For transfers from the European Economic Area (EEA), UK, or Switzerland, we rely on:
                            </p>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                                    <span><strong>Standard Contractual Clauses (SCCs)</strong> approved by the European Commission</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                                    <span><strong>Data Processing Agreements</strong> with all third-party processors</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                                    <span><strong>Adequacy decisions</strong> where applicable</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* 12. Changes */}
                    <section id="changes" className="scroll-mt-24 mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-blue-600">12</span>
                            Changes to This Policy
                        </h2>
                        <div className="space-y-4 text-slate-600 dark:text-slate-400">
                            <p>
                                We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, 
                                legal requirements, or other factors.
                            </p>
                            <p>
                                When we make material changes:
                            </p>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                    We will notify you via email and/or a prominent notice on our Service
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                    The "Last Updated" date at the top will be revised
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                    A summary of changes will be provided
                                </li>
                            </ul>
                            <p className="text-sm">
                                We encourage you to review this Privacy Policy periodically. Your continued use of the Service 
                                after changes constitutes acceptance of the updated policy.
                            </p>
                        </div>
                    </section>

                    {/* 13. Contact */}
                    <section id="contact" className="scroll-mt-24 mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-blue-600">13</span>
                            Contact Us
                        </h2>
                        <div className="space-y-4 text-slate-600 dark:text-slate-400">
                            <p>If you have questions, concerns, or requests regarding this Privacy Policy, please contact us:</p>
                            
                            <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-3">Zee Builder Privacy Team</h3>
                                        <div className="space-y-2 text-sm">
                                            <p className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-blue-500" />
                                                <a href="mailto:privacy@zeebuilder.com" className="text-blue-600 hover:underline">privacy@zeebuilder.com</a>
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <Globe className="w-4 h-4 text-blue-500" />
                                                <a href="https://zeebuilder.com" className="text-blue-600 hover:underline">zeebuilder.com</a>
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-3">Data Protection Officer</h3>
                                        <p className="text-sm">
                                            For GDPR-related inquiries, you may also contact our Data Protection Officer at{' '}
                                            <a href="mailto:dpo@zeebuilder.com" className="text-blue-600 hover:underline">dpo@zeebuilder.com</a>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm">
                                We aim to respond to all inquiries within 30 days. For data protection complaints in the EU, 
                                you also have the right to lodge a complaint with your local supervisory authority.
                            </p>
                        </div>
                    </section>

                    {/* Navigation Footer */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200 dark:border-slate-800">
                        <button
                            onClick={() => onNavigate(View.TERMS)}
                            className="flex-1 p-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-left group"
                        >
                            <span className="text-xs text-slate-500 uppercase tracking-wider">Next</span>
                            <span className="block text-slate-900 dark:text-white font-bold mt-1 group-hover:text-blue-600 transition-colors">
                                Terms of Service →
                            </span>
                        </button>
                        <button
                            onClick={() => onNavigate(View.DOCS)}
                            className="flex-1 p-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-left group"
                        >
                            <span className="text-xs text-slate-500 uppercase tracking-wider">Also Read</span>
                            <span className="block text-slate-900 dark:text-white font-bold mt-1 group-hover:text-blue-600 transition-colors">
                                Documentation →
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
