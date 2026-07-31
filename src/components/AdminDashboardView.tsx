import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  FileText, 
  ShoppingBag, 
  ShoppingCart, 
  CreditCard, 
  BarChart3, 
  FileSpreadsheet, 
  Bell, 
  MessageSquare, 
  Bot, 
  Lock, 
  Terminal, 
  Database, 
  FolderGit2, 
  Mail, 
  Code2, 
  Palette, 
  Settings, 
  UserCheck, 
  HelpCircle, 
  Megaphone, 
  Archive, 
  Layers, 
  Cpu, 
  Activity, 
  Search, 
  User, 
  Download, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Zap, 
  ShieldAlert, 
  Filter, 
  Server, 
  HardDrive, 
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Eye,
  Key,
  Globe,
  Sliders,
  Menu,
  Command,
  Clock,
  History,
  CheckSquare,
  Square,
  UserX,
  Play,
  Pause,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '../types';

interface AdminDashboardViewProps {
  user: UserProfile;
  isDarkMode: boolean;
  onShowToast?: (title: string, message?: string, type?: 'success' | 'info' | 'alert' | 'error') => void;
}

export type AdminModuleTab = 
  | 'overview' 
  | 'users' 
  | 'roles' 
  | 'content' 
  | 'products' 
  | 'orders' 
  | 'payments' 
  | 'analytics' 
  | 'reports' 
  | 'notifications' 
  | 'messages' 
  | 'ai-management' 
  | 'security' 
  | 'system-logs' 
  | 'database' 
  | 'file-manager' 
  | 'email-center' 
  | 'api-management' 
  | 'appearance' 
  | 'settings' 
  | 'staff' 
  | 'customer-support' 
  | 'marketing' 
  | 'backup' 
  | 'integrations' 
  | 'dev-tools' 
  | 'monitoring' 
  | 'activity' 
  | 'search' 
  | 'profile';

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  user,
  isDarkMode,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<AdminModuleTab>('overview');
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [actionModal, setActionModal] = useState<{ title: string; type: string; data?: any } | null>(null);

  // Command Palette Shortcut Modal
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);
  const [cmdSearch, setCmdSearch] = useState('');

  // Staff Activity Audit Log Modal
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditSearchTerm, setAuditSearchTerm] = useState('');
  const [auditFilterCategory, setAuditFilterCategory] = useState('all');
  const [auditFilterStaff, setAuditFilterStaff] = useState('all');

  // Table Multi-Select State
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Real-Time Traffic Monitoring State
  const [isLiveStreamActive, setIsLiveStreamActive] = useState(true);
  const [trafficTimeframe, setTrafficTimeframe] = useState<'15m' | '1h' | '24h' | '7d'>('1h');

  // Filter state for tables
  const [userSearchFilter, setUserSearchFilter] = useState('');
  const [selectedUserRole, setSelectedUserRole] = useState('all');

  // Trigger toast helper
  const notify = (title: string, msg: string, type: 'success' | 'info' | 'alert' | 'error' = 'success') => {
    if (onShowToast) onShowToast(title, msg, type);
  };

  // Keyboard shortcut listener (Ctrl+K, Ctrl+D, Ctrl+U, Ctrl+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K for Command Palette Search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdKOpen(prev => !prev);
      }
      // Cmd+D or Ctrl+D for Executive Overview
      else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setActiveTab('overview');
        notify('Keyboard Shortcut', 'Jumped to Executive Dashboard (Ctrl+D)', 'info');
      }
      // Cmd+U or Ctrl+U for User Directory
      else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        setActiveTab('users');
        notify('Keyboard Shortcut', 'Jumped to User Directory (Ctrl+U)', 'info');
      }
      // Cmd+A or Ctrl+A for Analytics
      else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setActiveTab('analytics');
        notify('Keyboard Shortcut', 'Jumped to Deep Analytics (Ctrl+A)', 'info');
      }
      // Escape to close modals
      else if (e.key === 'Escape') {
        setIsCmdKOpen(false);
        setIsAuditModalOpen(false);
        setActionModal(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Mock datasets for admin management
  const [adminUsersList, setAdminUsersList] = useState([
    { id: 'u_101', name: 'Alex Rivera', username: 'alexrivera', email: 'alex@munisocial.com', role: 'Super Admin', status: 'Active', kyc: 'Verified', lastLogin: '2 mins ago' },
    { id: 'u_102', name: 'Elena Rostova', username: 'elena_ai', email: 'elena@munisocial.com', role: 'Moderator', status: 'Active', kyc: 'Verified', lastLogin: '14 mins ago' },
    { id: 'u_103', name: 'Kai Takahashi', username: 'kaitakahashi', email: 'kai@munisocial.com', role: 'Editor', status: 'Active', kyc: 'Verified', lastLogin: '1 hour ago' },
    { id: 'u_104', name: 'Dev Account', username: 'dev_user', email: 'spam@test.com', role: 'User', status: 'Suspended', kyc: 'Unverified', lastLogin: '3 days ago' },
    { id: 'u_105', name: 'Sarah Jenkins', username: 'sarah_j', email: 'sarah@munisocial.com', role: 'Moderator', status: 'Active', kyc: 'Verified', lastLogin: 'Just now' },
    { id: 'u_106', name: 'Marcus Vance', username: 'marcus_v', email: 'marcus@munisocial.com', role: 'Editor', status: 'Active', kyc: 'Verified', lastLogin: '30 mins ago' },
  ]);

  // Staff Audit History Dataset
  const [auditLogsList, setAuditLogsList] = useState([
    { id: 'aud_101', staff: 'Alex Rivera', role: 'Super Admin', category: 'Roles', action: 'Promoted user @elena_ai to Moderator role', timestamp: '10 mins ago', ip: '192.168.1.42', badge: 'Critical' },
    { id: 'aud_102', staff: 'Elena Rostova', role: 'Moderator', category: 'Moderation', action: 'Flagged and auto-removed spam comment #9012 in #Shorts', timestamp: '25 mins ago', ip: '10.0.4.12', badge: 'Normal' },
    { id: 'aud_103', staff: 'Kai Takahashi', role: 'Editor', category: 'Content', action: 'Published official blog post "MuniSocial 3.0 System Update"', timestamp: '1 hour ago', ip: '172.16.0.88', badge: 'Normal' },
    { id: 'aud_104', staff: 'System Bot', role: 'Automated', category: 'Database', action: 'Completed automated point-in-time database snapshot (#DB-8910)', timestamp: '2 hours ago', ip: '127.0.0.1', badge: 'System' },
    { id: 'aud_105', staff: 'Alex Rivera', role: 'Super Admin', category: 'Payments', action: 'Updated Stripe Gateway production webhooks and API secret keys', timestamp: '3 hours ago', ip: '192.168.1.42', badge: 'Critical' },
    { id: 'aud_106', staff: 'Elena Rostova', role: 'Moderator', category: 'Users', action: 'Suspended account @dev_user for terms of service violations', timestamp: '5 hours ago', ip: '10.0.4.12', badge: 'Warning' },
    { id: 'aud_107', staff: 'Sarah Jenkins', role: 'Staff', category: 'KYC', action: 'Approved KYC verification document for @kai_takahashi', timestamp: '6 hours ago', ip: '10.0.2.15', badge: 'Normal' },
  ]);

  const [productsList, setProductsList] = useState([
    { id: 'prod_1', name: 'MuniAI Pro Key (Annual)', category: 'SaaS License', price: 199.99, stock: 9999, sales: 1420 },
    { id: 'prod_2', name: '4K Creator Masterclass', category: 'Digital Course', price: 49.00, stock: 500, sales: 840 },
    { id: 'prod_3', name: 'Cyberpunk Drone HUD Asset', category: '3D Model', price: 29.50, stock: 120, sales: 310 },
  ]);

  const [ordersList, setOrdersList] = useState([
    { id: 'ORD-8921', customer: 'Elena Rostova', total: 199.99, method: 'Stripe', status: 'Completed', date: '2026-07-26' },
    { id: 'ORD-8922', customer: 'Aria FPV', total: 49.00, method: 'PayPal', status: 'Processing', date: '2026-07-26' },
    { id: 'ORD-8923', customer: 'David K.', total: 29.50, method: 'Crypto (USDT)', status: 'Pending', date: '2026-07-25' },
  ]);

  const moduleCategories = [
    {
      name: 'Analytics & Monitoring',
      items: [
        { id: 'overview', label: '1. Dashboard Overview', icon: LayoutDashboard },
        { id: 'analytics', label: '8. Deep Analytics', icon: BarChart3 },
        { id: 'reports', label: '9. Reports & Exports', icon: FileSpreadsheet },
        { id: 'monitoring', label: '27. System Monitoring', icon: Cpu },
        { id: 'activity', label: '28. Activity Center', icon: Activity },
        { id: 'search', label: '29. Global Admin Search', icon: Search },
      ]
    },
    {
      name: 'User & Staff Management',
      items: [
        { id: 'users', label: '2. User Management', icon: Users },
        { id: 'roles', label: '3. Roles & Permissions', icon: ShieldCheck },
        { id: 'staff', label: '21. Staff Management', icon: UserCheck },
        { id: 'profile', label: '30. Admin Profile', icon: User },
      ]
    },
    {
      name: 'Content & Commerce',
      items: [
        { id: 'content', label: '4. Content Management', icon: FileText },
        { id: 'products', label: '5. Products & Services', icon: ShoppingBag },
        { id: 'orders', label: '6. Orders Management', icon: ShoppingCart },
        { id: 'payments', label: '7. Payments & Transactions', icon: CreditCard },
        { id: 'file-manager', label: '16. File Manager', icon: FolderGit2 },
        { id: 'marketing', label: '23. Marketing & Coupons', icon: Megaphone },
      ]
    },
    {
      name: 'Communications & Support',
      items: [
        { id: 'notifications', label: '10. Notification Center', icon: Bell },
        { id: 'messages', label: '11. Support Messages & Chat', icon: MessageSquare },
        { id: 'email-center', label: '17. Email Center & SMTP', icon: Mail },
        { id: 'customer-support', label: '22. Customer Support & FAQs', icon: HelpCircle },
      ]
    },
    {
      name: 'AI & Developer Platform',
      items: [
        { id: 'ai-management', label: '12. MuniAI Engine Hub', icon: Bot },
        { id: 'api-management', label: '18. API & Webhooks', icon: Code2 },
        { id: 'integrations', label: '25. Third-Party Services', icon: Layers },
        { id: 'dev-tools', label: '26. Developer Tools & .Env', icon: Terminal },
      ]
    },
    {
      name: 'Security & Infrastructure',
      items: [
        { id: 'security', label: '13. Security & Passkeys', icon: Lock },
        { id: 'system-logs', label: '14. System & Error Logs', icon: ShieldAlert },
        { id: 'database', label: '15. Database Management', icon: Database },
        { id: 'appearance', label: '19. Appearance & Themes', icon: Palette },
        { id: 'settings', label: '20. System Settings', icon: Settings },
        { id: 'backup', label: '24. Backup & Recovery', icon: Archive },
      ]
    }
  ];

  const exportData = (type: 'PDF' | 'Excel' | 'CSV') => {
    notify('Report Export Triggered', `Generating ${type} file download for ${activeTab?.toUpperCase() || ''}`, 'info');
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto py-3 sm:py-6 px-2 sm:px-6 min-h-[calc(100vh-4.5rem)] flex flex-col gap-4">
      
      {/* Top Main Admin Header */}
      <div className={`p-5 sm:p-6 rounded-3xl border backdrop-blur-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative overflow-hidden shadow-2xl ${
        isDarkMode 
          ? 'bg-slate-900/80 border-slate-700/60 ring-1 ring-white/10 text-white' 
          : 'bg-gradient-to-r from-white via-indigo-50/30 to-purple-50/20 border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-600/30 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-indigo-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-heading font-black text-xl sm:text-2xl tracking-tight">
                MuniSocial Enterprise Control Suite
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm">
                v3.6 Production
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
              <span>30 Full-Stack Management Modules</span>
              <span>•</span>
              <span>Operator: <strong className="text-indigo-400 font-bold">@{user?.username || 'admin'} ({user?.role?.toUpperCase() || 'ADMIN'})</strong></span>
            </p>
          </div>
        </div>

        {/* Top Header Quick Controls */}
        <div className="flex items-center gap-2 flex-wrap relative z-10">
          <button
            onClick={() => setIsCmdKOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900/90 border border-indigo-500/40 text-indigo-200 text-xs font-bold flex items-center gap-2 transition-all shadow-sm hover:scale-105 active:scale-95 group"
            title="Open Command Palette (Ctrl+K)"
          >
            <Command className="w-3.5 h-3.5 text-indigo-400 group-hover:rotate-12 transition-transform" />
            <span>Search Modules</span>
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">⌘K</kbd>
          </button>

          <button
            onClick={() => setIsAuditModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all shadow-sm hover:scale-105 active:scale-95"
            title="Open Staff Activity Audit Log"
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span>Activity Audit</span>
          </button>

          <button
            onClick={() => exportData('PDF')}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all shadow-sm hover:scale-105 active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>PDF</span>
          </button>
          <button
            onClick={() => exportData('CSV')}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all shadow-sm hover:scale-105 active:scale-95"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => notify('Cache Cleared', 'Redis & Edge network cache cleared successfully', 'success')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Flush Edge Cache</span>
          </button>
        </div>
      </div>

      {/* Mobile Screen Navigation Bar (30 Modules Switcher) */}
      <div className="lg:hidden flex flex-col gap-2.5 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Sliders className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-xs font-bold text-slate-200 truncate">
              Active: <strong className="text-indigo-300 font-mono">{activeTab?.toUpperCase() || ''}</strong>
            </span>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shrink-0"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span>{isMobileMenuOpen ? 'Funga Menu' : '30 Modules Menu'}</span>
          </button>
        </div>

        {/* Quick Horizontal Scroll Pills for Frequent Mobile Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-slate-800">
          {[
            { id: 'overview', label: '1. Overview' },
            { id: 'users', label: '2. Users' },
            { id: 'content', label: '4. Content' },
            { id: 'products', label: '5. Products' },
            { id: 'orders', label: '6. Orders' },
            { id: 'payments', label: '7. Payments' },
            { id: 'ai-management', label: '12. MuniAI' },
            { id: 'security', label: '13. Security' },
            { id: 'settings', label: '20. Settings' },
          ].map(pill => (
            <button
              key={pill.id}
              onClick={() => {
                setActiveTab(pill.id as AdminModuleTab);
                setIsMobileMenuOpen(false);
              }}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                activeTab === pill.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout Grid (Sidebar + Workspace) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        
        {/* Left Admin Navigation Sidebar (All 30 Modules) */}
        <div className={`lg:col-span-3 rounded-3xl border p-4 flex flex-col gap-4 h-fit backdrop-blur-2xl ring-1 ring-white/10 shadow-2xl ${
          isMobileMenuOpen ? 'block' : 'hidden lg:flex'
        } ${
          isDarkMode ? 'bg-slate-900/80 border-slate-700/60 text-slate-100' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          {/* Sidebar Search Filter */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search 30 Admin Modules..."
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Module Navigation Accordions */}
          <div className="space-y-4 max-h-[60vh] lg:max-h-[calc(100vh-14rem)] overflow-y-auto pr-1 no-scrollbar">
            {moduleCategories.map((cat, catIdx) => {
              const filteredItems = cat.items.filter(item => 
                item.label.toLowerCase().includes(sidebarSearch.toLowerCase())
              );

              if (sidebarSearch && filteredItems.length === 0) return null;

              return (
                <div key={catIdx} className="space-y-1">
                  <h2 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider px-2">
                    {cat.name}
                  </h2>
                  <div className="space-y-0.5">
                    {filteredItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;

                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id as AdminModuleTab);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all text-left ${
                            isActive
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                              : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Active Admin Workspace Area */}
        <div className={`lg:col-span-9 rounded-3xl border p-4 sm:p-6 flex flex-col gap-6 ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200'
        }`}>

          {/* 1. DASHBOARD OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading font-extrabold text-xl">1. Executive Dashboard Overview</h2>
                  <p className="text-xs text-slate-400">Real-time KPI telemetry, revenue streams, and active cluster nodes</p>
                </div>
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Real-time Live
                </span>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: 'Total Users', val: '1,420,890', sub: '+12% this week', color: 'text-indigo-400' },
                  { label: 'Active Users', val: '892,100', sub: '62.8% DAU ratio', color: 'text-emerald-400' },
                  { label: 'Revenue', val: '$248,500', sub: '+$14k today', color: 'text-amber-400' },
                  { label: 'Orders', val: '18,420', sub: '99.2% success', color: 'text-purple-400' },
                  { label: 'New Today', val: '+4,280', sub: 'Organic social', color: 'text-pink-400' },
                  { label: 'Live Visitors', val: '14,890', sub: '120 countries', color: 'text-cyan-400' },
                ].map((kpi, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{kpi.label}</span>
                    <div className={`font-heading font-bold text-base sm:text-lg ${kpi.color}`}>{kpi.val}</div>
                    <p className="text-[9px] text-slate-500 font-mono">{kpi.sub}</p>
                  </div>
                ))}
              </div>

              {/* Daily Activity Tracker Widget */}
              <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800/90 backdrop-blur-xl shadow-xl space-y-4 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 shadow-md">
                      <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-heading font-extrabold text-base text-white">Daily Activity Tracker & Milestones</h3>
                      <p className="text-xs text-slate-400">Visualizing engagement progress rings and operational milestones</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      88% Milestone Rate
                    </span>
                    <button 
                      onClick={() => notify('Milestone Refreshed', 'Daily engagement target metrics synced', 'success')}
                      className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
                      title="Refresh milestones"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center pt-2">
                  {/* RadialBar Progress Ring Chart */}
                  <div className="md:col-span-5 h-52 flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart 
                        cx="50%" 
                        cy="50%" 
                        innerRadius="25%" 
                        outerRadius="95%" 
                        barSize={10} 
                        data={[
                          { name: 'Daily Posts', percentage: 85, fill: '#6366f1' },
                          { name: 'Community Chat', percentage: 92, fill: '#10b981' },
                          { name: 'Creator Engagement', percentage: 70, fill: '#f59e0b' },
                          { name: 'Moderator Tasks', percentage: 95, fill: '#ec4899' },
                          { name: 'Cluster Uptime', percentage: 98, fill: '#06b6d4' }
                        ]}
                        startAngle={180}
                        endAngle={0}
                      >
                        <RadialBar
                          background={{ fill: '#1e293b' }}
                          dataKey="percentage"
                          cornerRadius={8}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                          formatter={(value: any) => [`${value}% Achieved`, 'Milestone Status']}
                        />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-5">
                      <div className="text-2xl font-black text-white font-heading">88%</div>
                      <div className="text-[9px] text-indigo-400 font-mono font-bold uppercase tracking-wider">Avg Progress</div>
                    </div>
                  </div>

                  {/* Milestone Breakdown List */}
                  <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { name: 'Daily Posts Target', val: '8,500 / 10k', percent: 85, color: '#6366f1' },
                      { name: 'Community Chat Activity', val: '92% Peak', percent: 92, color: '#10b981' },
                      { name: 'Creator Engagement', val: '7,000 Likes', percent: 70, color: '#f59e0b' },
                      { name: 'Moderator Tickets Clear', val: '95% Resolved', percent: 95, color: '#ec4899' },
                      { name: 'Cluster Server Uptime', val: '99.99%', percent: 98, color: '#06b6d4' },
                    ].map((m, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800/80 flex flex-col gap-1.5 shadow-sm">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 min-w-0 pr-1">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: m.color }}></span>
                            <span className="font-bold text-slate-200 truncate">{m.name}</span>
                          </div>
                          <span className="font-mono text-[10px] font-bold shrink-0" style={{ color: m.color }}>{m.percent}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${m.percent}%`, backgroundColor: m.color }}></div>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono flex justify-between">
                          <span>Goal Progress</span>
                          <span className="text-white font-semibold">{m.val}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Charts Mock Visualizer */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>User Growth Trends (DAU / MAU)</span>
                    <span className="text-indigo-400 font-mono">+18.4%</span>
                  </div>
                  <div className="h-32 flex items-end justify-between gap-2 pt-4">
                    {[35, 45, 60, 55, 75, 90, 80, 100, 115, 130].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                        <div 
                          style={{ height: `${h}%` }} 
                          className="w-full rounded-t bg-gradient-to-t from-indigo-600 to-purple-500 group-hover:from-indigo-500 group-hover:to-purple-400 transition-all"
                        ></div>
                        <span className="text-[9px] text-slate-500 font-mono">d{i+1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Revenue & Monetization Flow</span>
                    <span className="text-emerald-400 font-mono">$248.5K total</span>
                  </div>
                  <div className="h-32 flex items-end justify-between gap-2 pt-4">
                    {[20, 30, 50, 40, 65, 80, 70, 95, 110, 140].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                        <div 
                          style={{ height: `${h}%` }} 
                          className="w-full rounded-t bg-gradient-to-t from-emerald-600 to-teal-400 group-hover:from-emerald-500 group-hover:to-teal-300 transition-all"
                        ></div>
                        <span className="text-[9px] text-slate-500 font-mono">w{i+1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase text-slate-400 font-mono">Recent Platform System Activities</h3>
                <div className="space-y-2">
                  {[
                    { type: 'User Signup', detail: 'New creator @sara_jenkins verified account with Passkey.', time: '1 min ago', status: 'Success' },
                    { type: 'Payment Completed', detail: 'Order #ORD-8921 processed via Stripe ($199.99)', time: '3 mins ago', status: 'Completed' },
                    { type: 'AI Moderation', detail: 'Gemini 3.6 Flash flagged 1 spam comment in #Shorts.', time: '7 mins ago', status: 'Auto-flagged' },
                  ].map((act, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800/70 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 font-bold">
                          <span>{act.type}</span>
                          <span className="px-2 py-0.2 rounded text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {act.status}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px]">{act.detail}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{act.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-heading font-extrabold text-xl">2. User Directory & KYC Management</h2>
                  <p className="text-xs text-slate-400">Search, suspend, ban, assign roles, and verify identity status</p>
                </div>
                <button
                  onClick={() => setActionModal({ title: 'Add New User', type: 'add_user' })}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shrink-0 w-fit"
                >
                  <Plus className="w-4 h-4" /> Add New User
                </button>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="text"
                  placeholder="Filter users by name or email..."
                  value={userSearchFilter}
                  onChange={(e) => setUserSearchFilter(e.target.value)}
                  className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium min-w-[220px]"
                />
                <select
                  value={selectedUserRole}
                  onChange={(e) => setSelectedUserRole(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none font-semibold"
                >
                  <option value="all">All Roles</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Moderator">Moderator</option>
                  <option value="Editor">Editor</option>
                  <option value="User">Standard User</option>
                </select>
              </div>

              {/* Floating Batch Operations Menu Bar */}
              {selectedUserIds.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-indigo-950/90 border border-indigo-500/50 shadow-2xl backdrop-blur-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs font-bold text-white">
                      {selectedUserIds.length} user account(s) selected
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setAdminUsersList(prev => prev.map(u => selectedUserIds.includes(u.id) ? { ...u, status: 'Active' } : u));
                        notify('Batch Activated', `Activated ${selectedUserIds.length} account(s)`, 'success');
                        setSelectedUserIds([]);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow"
                    >
                      Activate Selected
                    </button>

                    <button
                      onClick={() => {
                        setAdminUsersList(prev => prev.map(u => selectedUserIds.includes(u.id) ? { ...u, status: 'Suspended' } : u));
                        notify('Batch Suspended', `Suspended ${selectedUserIds.length} account(s)`, 'alert');
                        setSelectedUserIds([]);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow"
                    >
                      Suspend Selected
                    </button>

                    <button
                      onClick={() => {
                        setAdminUsersList(prev => prev.map(u => selectedUserIds.includes(u.id) ? { ...u, kyc: 'Verified' } : u));
                        notify('Batch KYC Approved', `Approved KYC for ${selectedUserIds.length} account(s)`, 'success');
                        setSelectedUserIds([]);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow"
                    >
                      Verify KYC
                    </button>

                    <button
                      onClick={() => {
                        setAdminUsersList(prev => prev.filter(u => !selectedUserIds.includes(u.id)));
                        notify('Batch Deleted', `Deleted ${selectedUserIds.length} account(s)`, 'alert');
                        setSelectedUserIds([]);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow"
                    >
                      Delete Selected
                    </button>

                    <button
                      onClick={() => setSelectedUserIds([])}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Users Table */}
              <div className="border border-slate-800 rounded-2xl overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono text-[10px] uppercase">
                      <th className="p-3 w-10 text-center">
                        <input 
                          type="checkbox" 
                          checked={selectedUserIds.length === adminUsersList.length && adminUsersList.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedUserIds(adminUsersList.map(u => u.id));
                            else setSelectedUserIds([]);
                          }}
                          className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900 cursor-pointer"
                        />
                      </th>
                      <th className="p-3">User Profile</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">KYC Badge</th>
                      <th className="p-3">Last Active</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {adminUsersList
                      .filter(u => {
                        const matchesSearch = (u.name || '').toLowerCase().includes(userSearchFilter.toLowerCase()) || 
                                              (u.email || '').toLowerCase().includes(userSearchFilter.toLowerCase()) || 
                                              (u.username || '').toLowerCase().includes(userSearchFilter.toLowerCase());
                        const matchesRole = selectedUserRole === 'all' || u.role === selectedUserRole;
                        return matchesSearch && matchesRole;
                      })
                      .map((u) => {
                        const isSelected = selectedUserIds.includes(u.id);
                        return (
                          <tr key={u.id} className={`hover:bg-slate-800/40 transition-colors ${isSelected ? 'bg-indigo-950/40' : ''}`}>
                            <td className="p-3 w-10 text-center">
                              <input 
                                type="checkbox" 
                                checked={isSelected}
                                onChange={() => {
                                  setSelectedUserIds(prev => prev.includes(u.id) ? prev.filter(i => i !== u.id) : [...prev, u.id]);
                                }}
                                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900 cursor-pointer"
                              />
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-white">{u.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">@{u.username} • {u.email}</div>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold">
                                {u.role}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                u.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                              }`}>
                                {u.status}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                                {u.kyc}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-slate-400">{u.lastLogin}</td>
                            <td className="p-3 text-right space-x-1">
                              <button 
                                onClick={() => notify('User Status Updated', `Toggled account state for ${u.name}`, 'info')}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300" 
                                title="Edit User"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => {
                                  setAdminUsersList(prev => prev.map(item => item.id === u.id ? { ...item, status: item.status === 'Active' ? 'Suspended' : 'Active' } : item));
                                  notify('User Status Changed', `Updated state for ${u.username}`, 'alert');
                                }}
                                className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white" 
                                title="Ban / Suspend"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. ROLE & PERMISSION MANAGEMENT */}
          {activeTab === 'roles' && (
            <div className="space-y-4">
              <h2 className="font-heading font-extrabold text-xl">3. Role & Permission Matrix</h2>
              <p className="text-xs text-slate-400">Configure custom granular privileges for Super Admin, Admin, Moderator, Editor, and Users</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: 'Super Admin', desc: 'Full unrestricted system access, database backups & billing', count: '1 Admin' },
                  { title: 'Community Moderator', desc: 'Can inspect content, resolve tickets, and ban users', count: '4 Mods' },
                  { title: 'Content Editor', desc: 'Publish official blog announcements and curate featured feeds', count: '2 Editors' },
                ].map((r, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-sm text-indigo-300">{r.title}</span>
                      <span className="text-[10px] font-mono text-slate-400">{r.count}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{r.desc}</p>
                    <button 
                      onClick={() => notify('Role Matrix Opened', `Editing permissions for ${r.title}`, 'info')}
                      className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-bold transition-colors"
                    >
                      Edit Permissions Matrix
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. CONTENT MANAGEMENT */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <h2 className="font-heading font-extrabold text-xl">4. Content & Moderation Hub</h2>
              <p className="text-xs text-slate-400">Manage feed posts, pages, categories, tags, and media draft states</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs font-bold text-slate-400 block">Published Posts</span>
                  <div className="font-heading font-bold text-xl text-indigo-400">142,890</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs font-bold text-slate-400 block">Drafts & Scheduled</span>
                  <div className="font-heading font-bold text-xl text-amber-400">1,240</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs font-bold text-slate-400 block">Flagged Content</span>
                  <div className="font-heading font-bold text-xl text-rose-400">14</div>
                </div>
              </div>
            </div>
          )}

          {/* 5. PRODUCTS / SERVICES */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading font-extrabold text-xl">5. Products, Subscriptions & Marketplace</h2>
                  <p className="text-xs text-slate-400">Manage marketplace listings, pricing tiers, discounts, and inventory</p>
                </div>
                <button 
                  onClick={() => notify('Product Form', 'Opening Add Product modal', 'info')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  + Add Product
                </button>
              </div>

              <div className="border border-slate-800 rounded-2xl overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono text-[10px] uppercase">
                      <th className="p-3">Product Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3">Sales</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {productsList.map((p) => (
                      <tr key={p.id}>
                        <td className="p-3 font-bold text-white">{p.name}</td>
                        <td className="p-3 text-indigo-300 font-mono">{p.category}</td>
                        <td className="p-3 text-emerald-400 font-bold">${p.price.toFixed(2)}</td>
                        <td className="p-3 text-slate-300">{p.stock}</td>
                        <td className="p-3 font-mono text-purple-300">{p.sales} units</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h2 className="font-heading font-extrabold text-xl">6. Orders & Fulfillment Pipeline</h2>
              <p className="text-xs text-slate-400">Track pending, processing, completed, cancelled orders, and refund requests</p>
              
              <div className="border border-slate-800 rounded-2xl overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono text-[10px] uppercase">
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Payment Method</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {ordersList.map((o) => (
                      <tr key={o.id}>
                        <td className="p-3 font-mono font-bold text-indigo-400">{o.id}</td>
                        <td className="p-3 text-white">{o.customer}</td>
                        <td className="p-3 font-bold text-emerald-400">${o.total.toFixed(2)}</td>
                        <td className="p-3 text-slate-300">{o.method}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 7. PAYMENTS & TRANSACTIONS */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <h2 className="font-heading font-extrabold text-xl">7. Payments, Gateways & Payouts</h2>
              <p className="text-xs text-slate-400">Stripe, PayPal, Crypto, and Mobile Money gateway configurations and creator withdrawals</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs font-bold text-slate-400">Total Net Revenue</span>
                  <div className="font-heading font-bold text-xl text-emerald-400">$248,500.00</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs font-bold text-slate-400">Pending Withdrawals</span>
                  <div className="font-heading font-bold text-xl text-amber-400">$12,400.00</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs font-bold text-slate-400">Active Gateways</span>
                  <div className="font-heading font-bold text-xl text-indigo-400">4 Gateways</div>
                </div>
              </div>
            </div>
          )}

          {/* 8. ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading font-extrabold text-xl">8. Platform Deep Analytics & Telemetry</h2>
                <p className="text-xs text-slate-400">Device, browser, geographical, conversion, and real-time DAU/MAU performance metrics</p>
              </div>

              {/* Real-time Traffic Monitor Section */}
              <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800/90 backdrop-blur-2xl shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
                      <h3 className="font-heading font-extrabold text-base text-white">Real-Time Traffic & Session Load Monitor</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        ● Live Telemetry Stream
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Visualizing concurrent user sessions and page load latency over time</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
                      {(['15m', '1h', '24h', '7d'] as const).map((tf) => (
                        <button
                          key={tf}
                          onClick={() => setTrafficTimeframe(tf)}
                          className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition-all ${
                            trafficTimeframe === tf ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setIsLiveStreamActive(!isLiveStreamActive);
                        notify('Traffic Stream Toggled', isLiveStreamActive ? 'Paused real-time data stream' : 'Resumed real-time telemetry stream', 'info');
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isLiveStreamActive 
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20' 
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                      }`}
                    >
                      {isLiveStreamActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isLiveStreamActive ? 'Pause Stream' : 'Resume Stream'}</span>
                    </button>
                  </div>
                </div>

                {/* Telemetry KPI Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Concurrent Sessions</span>
                    <div className="text-xl font-heading font-black text-indigo-400">18,920</div>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">▲ +12.4% peak traffic</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Page Load Latency</span>
                    <div className="text-xl font-heading font-black text-emerald-400">138 ms</div>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">● High-speed edge</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">API Throughput</span>
                    <div className="text-xl font-heading font-black text-amber-400">5,800 req/s</div>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">120 Edge PoPs</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Packet Error Rate</span>
                    <div className="text-xl font-heading font-black text-cyan-400">0.001%</div>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">99.999% SLA Uptime</span>
                  </div>
                </div>

                {/* Recharts Area Chart for Real-time Traffic */}
                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { time: '14:00', sessions: 12400, latency: 140, requests: 3800 },
                      { time: '14:05', sessions: 13200, latency: 135, requests: 4100 },
                      { time: '14:10', sessions: 14100, latency: 152, requests: 4350 },
                      { time: '14:15', sessions: 15600, latency: 168, requests: 4900 },
                      { time: '14:20', sessions: 16800, latency: 142, requests: 5200 },
                      { time: '14:25', sessions: 18200, latency: 128, requests: 5650 },
                      { time: '14:30', sessions: 17500, latency: 138, requests: 5400 },
                      { time: '14:35', sessions: 18900, latency: 145, requests: 5800 },
                      { time: '14:40', sessions: 19400, latency: 150, requests: 6100 },
                      { time: '14:45', sessions: 18100, latency: 132, requests: 5500 },
                      { time: '14:50', sessions: 17800, latency: 129, requests: 5350 },
                      { time: '14:55', sessions: 18920, latency: 138, requests: 5800 },
                    ]}>
                      <defs>
                        <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }} 
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      <Area type="monotone" dataKey="sessions" name="Concurrent User Sessions" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorSessions)" />
                      <Area type="monotone" dataKey="latency" name="Page Load Latency (ms)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorLatency)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <h3 className="text-xs font-bold text-indigo-300">Top Audience Geographic Distribution</h3>
                  <p className="text-xs text-slate-400">1. USA (34%) • 2. Tanzania (22%) • 3. UK (18%) • 4. Germany (12%)</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <h3 className="text-xs font-bold text-emerald-300">Browser & Device Operating Systems</h3>
                  <p className="text-xs text-slate-400">Chrome (58%) • iOS Safari (28%) • Firefox (8%) • Android (6%)</p>
                </div>
              </div>
            </div>
          )}

          {/* 9. REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <h2 className="font-heading font-extrabold text-xl">9. Financial & System Reports</h2>
              <p className="text-xs text-slate-400">Generate and export automated PDF, Excel, and CSV audit reports</p>
              
              <div className="flex gap-2">
                <button onClick={() => exportData('PDF')} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs">
                  Export PDF Report
                </button>
                <button onClick={() => exportData('Excel')} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs">
                  Export Excel Sheet
                </button>
              </div>
            </div>
          )}

          {/* 10. NOTIFICATIONS CENTER */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h2 className="font-heading font-extrabold text-xl">10. Global Push & Broadcast Center</h2>
              <p className="text-xs text-slate-400">Broadcast Web Push, In-App Announcements, SMS, and Email blasts to users</p>
              
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <input
                  type="text"
                  placeholder="Notification Header Title..."
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                />
                <textarea
                  rows={3}
                  placeholder="Write broadcast message content..."
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                />
                <button
                  onClick={() => notify('Push Broadcast Sent', 'Sent notification to 1,420,890 subscribers', 'success')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                >
                  🚀 Broadcast Push Notification Now
                </button>
              </div>
            </div>
          )}

          {/* 11. MESSAGES & SUPPORT */}
          {activeTab === 'messages' && (
            <div className="space-y-4">
              <h2 className="font-heading font-extrabold text-xl">11. Customer Inbox & Support Tickets</h2>
              <p className="text-xs text-slate-400">Live chat monitoring, incoming contact inquiries, and ticket resolution</p>
              
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                <span className="text-emerald-400 font-bold">14 Active Support Tickets</span> • All tickets assigned to automated MuniAI Copilot first response.
              </div>
            </div>
          )}

          {/* 12. AI MANAGEMENT (MUNIAI ENGINE) */}
          {activeTab === 'ai-management' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-heading font-extrabold text-xl">12. MuniAI Engine & Model Hub</h2>
                  <p className="text-xs text-slate-400">Manage Gemini 3.6 Flash, system instructions, token quotas, and knowledge base grounding</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0 w-fit">
                  ● Gemini 3.6 Flash Active
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400 font-bold block">Active Model</span>
                  <div className="font-heading font-bold text-sm text-indigo-400">Gemini 3.6 Flash</div>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Sub-second streaming & multimodal grounding</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400 font-bold block">Token Usage</span>
                  <div className="font-heading font-bold text-sm text-purple-400">14.8M / 100M Tokens</div>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">14.8% monthly quota consumed</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-xs text-slate-400 font-bold block">Latency SLA</span>
                  <div className="font-heading font-bold text-sm text-emerald-400">180ms Avg Response</div>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Edge proxy server active in us-central1</p>
                </div>
              </div>

              {/* AI System Prompt & Controls */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Bot className="w-4 h-4 text-indigo-400" /> System Instruction Prompt Configuration
                  </h3>
                  <button 
                    onClick={() => notify('AI Prompt Saved', 'MuniAI System instructions updated successfully', 'success')}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    Save System Prompt
                  </button>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1.5">
                    Global Copilot Persona & Grounding Guidelines
                  </label>
                  <textarea
                    rows={4}
                    defaultValue="You are MuniAI Copilot, the intelligent AI engine powering MuniSocial. Provide empathetic, highly helpful, and accurate assistance for content creation, moderation, community management, and platform navigation."
                    className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Temperature Sampling (0.2 - 1.0)</label>
                    <input type="range" min="0.2" max="1.0" step="0.05" defaultValue="0.7" className="w-full accent-indigo-500 cursor-pointer" />
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>0.2 (Precise)</span>
                      <span className="text-indigo-400 font-bold">0.7 (Balanced)</span>
                      <span>1.0 (Creative)</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Google Search Grounding</label>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <span className="text-slate-300 font-medium">Enable Web Search Grounding</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Enabled</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 13. SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <h2 className="font-heading font-extrabold text-xl">13. Security, Passkeys & Firewall</h2>
              <p className="text-xs text-slate-400">Passkey WebAuthn logs, 2FA enforcement, IP rate limiting, and connected sessions</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">Passkey & Biometric WebAuthn</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Enforced</span>
                  </div>
                  <p className="text-slate-400">Hardware security tokens (YubiKey, TouchID, FaceID) required for all elevated Admin actions.</p>
                  <button 
                    onClick={() => notify('Security Audit', 'Passkey credentials verified successfully', 'success')} 
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors"
                  >
                    Test Passkey Authentication
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">IP Rate Limiter & DDoS Shield</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Active (100 req/min)</span>
                  </div>
                  <p className="text-slate-400">Automatic IP throttling & cloud firewall defense against brute-force attacks.</p>
                  <button 
                    onClick={() => notify('Firewall Rules', 'Updated IP rate limiting policies', 'info')} 
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
                  >
                    Manage Firewall Rules
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <h3 className="font-bold text-sm text-white">Active Admin Sessions</h3>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white block">Chrome on macOS (Current Session)</span>
                      <span className="text-[10px] font-mono text-slate-400">IP: 192.168.1.104 • San Francisco, CA</span>
                    </div>
                    <span className="text-emerald-400 font-bold text-[10px]">Active Now</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white block">Safari on iOS (Passkey Auth)</span>
                      <span className="text-[10px] font-mono text-slate-400">IP: 172.56.21.90 • Nairobi, KE</span>
                    </div>
                    <button 
                      onClick={() => notify('Session Revoked', 'Remote admin session revoked successfully', 'info')} 
                      className="text-rose-400 hover:text-rose-300 font-bold text-[11px]"
                    >
                      Revoke Access
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 14. SYSTEM LOGS */}
          {activeTab === 'system-logs' && (
            <div className="space-y-4">
              <h2 className="font-heading font-extrabold text-xl">14. Real-time System & Error Logs</h2>
              <p className="text-xs text-slate-400">Live stdout/stderr stream, server stack traces, and API response error logs</p>
              
              <div className="p-4 rounded-2xl bg-slate-950 font-mono text-[11px] text-emerald-400 border border-slate-800 space-y-1 h-48 overflow-y-auto">
                <div>[2026-07-26 14:28:50] INFO [Express-Server] GET /api/health 200 OK - 2ms</div>
                <div>[2026-07-26 14:28:52] INFO [Gemini-3.6-Flash] POST /api/ai/chat 200 OK - 182ms</div>
                <div>[2026-07-26 14:28:54] INFO [PostgreSQL-Cluster] Connection Pool Healthy (12/100 active)</div>
              </div>
            </div>
          )}

          {/* 15. DATABASE MANAGEMENT */}
          {activeTab === 'database' && (
            <div className="space-y-4">
              <h2 className="font-heading font-extrabold text-xl">15. Database & Cluster Management</h2>
              <p className="text-xs text-slate-400">PostgreSQL status, Redis memory cache, automated snapshot backups, and query optimizer</p>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => notify('Database Backup Triggered', 'Snapshot created on S3 cloud storage', 'success')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                >
                  Trigger Immediate Snapshot
                </button>
              </div>
            </div>
          )}

          {/* 16. FILE MANAGER */}
          {activeTab === 'file-manager' && (
            <div className="space-y-4">
              <h2 className="font-heading font-extrabold text-xl">16. Storage & Cloud File Manager</h2>
              <p className="text-xs text-slate-400">Cloudflare R2 / AWS S3 media uploads, video assets, and storage quota gauges</p>
              
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-400">Storage Consumption</span>
                <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[24%]"></div>
                </div>
                <span className="text-[10px] font-mono text-slate-400">24.2 GB used of 100 GB Cloud Tier</span>
              </div>
            </div>
          )}

          {/* 17. EMAIL CENTER */}
          {activeTab === 'email-center' && (
            <div className="space-y-4">
              <h2 className="font-heading font-extrabold text-xl">17. Email Center & SMTP Gateway</h2>
              <p className="text-xs text-slate-400">Transactional email templates, SendGrid/SMTP settings, and newsletter broadcasts</p>
              
              <button 
                onClick={() => notify('SMTP Test', 'Sent test email via SendGrid API', 'info')}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
              >
                Send Test Email
              </button>
            </div>
          )}

          {/* 18. API MANAGEMENT */}
          {activeTab === 'api-management' && (
            <div className="space-y-4">
              <h2 className="font-heading font-extrabold text-xl">18. API Keys & Webhooks Suite</h2>
              <p className="text-xs text-slate-400">Generate developer API tokens, configure rate limits, and webhook listeners</p>
              
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 font-mono text-xs flex items-center justify-between">
                <span>muni_live_pk_8912839102839018239012</span>
                <span className="text-emerald-400 font-bold">Active</span>
              </div>
            </div>
          )}

          {/* 19. APPEARANCE & THEMING */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <h2 className="font-heading font-extrabold text-xl">19. Appearance & Brand Customizer</h2>
              <p className="text-xs text-slate-400">Dark/light color themes, display typography, custom logo uploads, and favicon</p>
              
              <div className="flex gap-2">
                <button onClick={() => notify('Theme Saved', 'Dark Modern Glassmorphism activated', 'success')} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">
                  Save Appearance Rules
                </button>
              </div>
            </div>
          )}

          {/* 20. SYSTEM SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h2 className="font-heading font-extrabold text-xl">20. Global System Settings</h2>
              <p className="text-xs text-slate-400">General site name, authentication rules, password policy, and payment settings</p>
              
              <div className="space-y-3 max-w-lg">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Site Title</label>
                  <input type="text" defaultValue="MuniSocial Ecosystem" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white" />
                </div>
                <button onClick={() => notify('Settings Saved', 'System configurations updated', 'success')} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">
                  Save All Settings
                </button>
              </div>
            </div>
          )}

          {/* 21. STAFF MANAGEMENT */}
          {activeTab === 'staff' && (
            <div className="space-y-4">
              <h2 className="font-heading font-extrabold text-xl">21. Staff & HR Management</h2>
              <p className="text-xs text-slate-400">Manage internal employees, departments, task assignments, and permissions</p>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                12 Staff Members Active • Engineering, Support, and Moderation Teams.
              </div>
            </div>
          )}

          {/* 22. CUSTOMER SUPPORT */}
          {activeTab === 'customer-support' && (
            <div className="space-y-4">
              <h2 className="font-heading font-extrabold text-xl">22. Customer Support & Knowledge Base</h2>
              <p className="text-xs text-slate-400">Help Center articles, FAQ manager, user reviews, and feedback processing</p>
              <button onClick={() => notify('Article Added', 'Published new Help Center article', 'success')} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">
                + Create Help Article
              </button>
            </div>
          )}

          {/* 23. MARKETING & PROMOTIONS */}
          {activeTab === 'marketing' && (
            <div className="space-y-4">
              <h2 className="font-heading font-extrabold text-xl">23. Marketing & Promo Engine</h2>
              <p className="text-xs text-slate-400">Manage promo coupon codes, referral links, and affiliate commission metrics</p>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-indigo-300 font-mono">
                Active Code: <span className="font-bold text-white">LAUNCH2026</span> (20% off MuniAI Pro)
              </div>
            </div>
          )}

          {/* 24. BACKUP & RECOVERY */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <h2 className="font-heading font-extrabold text-xl">24. Backup & Disaster Recovery</h2>
              <p className="text-xs text-slate-400">Manual backups, automated backup schedules, and point-in-time database restore</p>
              <button onClick={() => notify('Backup Downloaded', 'Downloaded compressed SQL backup dump', 'info')} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">
                Download Latest Backup (.sql)
              </button>
            </div>
          )}

          {/* 25. THIRD-PARTY INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <div className="space-y-4">
              <h2 className="font-heading font-extrabold text-xl">25. Third-Party Integrations</h2>
              <p className="text-xs text-slate-400">Connect Google Workspace, GitHub OAuth, Stripe, PayPal, Twilio, and Gemini API</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {['Gemini 3.6 Flash API', 'Stripe Payments', 'GitHub Auth', 'Twilio SMS'].map((i, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-white">{i}</span>
                    <span className="text-emerald-400 font-mono text-[10px] font-bold">Connected</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 26. DEVELOPER TOOLS */}
          {activeTab === 'dev-tools' && (
            <div className="space-y-4">
              <h2 className="font-heading font-extrabold text-xl">26. Developer Tools & .Env Viewer</h2>
              <p className="text-xs text-slate-400">Safe environment variables editor, API console, cache management, and Cron jobs</p>
              <div className="p-4 rounded-2xl bg-slate-950 font-mono text-xs text-indigo-300 border border-slate-800">
                NODE_ENV=production<br />
                PORT=3000<br />
                GEMINI_API_KEY=••••••••••••••••
              </div>
            </div>
          )}

          {/* 27. SYSTEM MONITORING */}
          {activeTab === 'monitoring' && (
            <div className="space-y-4">
              <h2 className="font-heading font-extrabold text-xl">27. Infrastructure Hardware Telemetry</h2>
              <p className="text-xs text-slate-400">Real-time CPU, RAM, Disk, and Network traffic bandwidth gauges</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">CPU Usage</span>
                  <div className="font-heading font-bold text-lg text-emerald-400">12.4%</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">RAM Usage</span>
                  <div className="font-heading font-bold text-lg text-indigo-400">4.2 GB / 16 GB</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Disk I/O</span>
                  <div className="font-heading font-bold text-lg text-purple-400">14 MB/s</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Uptime</span>
                  <div className="font-heading font-bold text-lg text-cyan-400">99.998%</div>
                </div>
              </div>
            </div>
          )}

          {/* 28. ACTIVITY CENTER */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h2 className="font-heading font-extrabold text-xl">28. Activity Center & Audit Timeline</h2>
              <p className="text-xs text-slate-400">Full historical record of user, administrator, and system background tasks</p>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                Logged 14,890 audit entries today.
              </div>
            </div>
          )}

          {/* 29. SEARCH CENTER */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              <h2 className="font-heading font-extrabold text-xl">29. Global Admin Search Engine</h2>
              <p className="text-xs text-slate-400">Search across all users, orders, posts, logs, and database records</p>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Global Admin Deep Search query..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
            </div>
          )}

          {/* 30. PROFILE & ADMIN ACCOUNT */}
          {activeTab === 'profile' && (
            <div className="space-y-4 max-w-lg">
              <h2 className="font-heading font-extrabold text-xl">30. Admin Profile & Credentials</h2>
              <p className="text-xs text-slate-400">Manage security passkeys, password policy, and active admin session</p>
              
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Admin Account</span>
                  <div className="font-bold text-white text-sm">{user?.name || 'Admin'} (@{user?.username || 'admin'})</div>
                  <span className="text-indigo-400 font-mono">{user?.role?.toUpperCase() || 'ADMIN'}</span>
                </div>
                <button onClick={() => notify('Passkey Active', 'Passkey security verified for this session', 'success')} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold">
                  Manage Passkeys & 2FA
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Command Palette Modal (Ctrl+K / Cmd+K) */}
      {isCmdKOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl border border-slate-700/80 bg-slate-900/95 backdrop-blur-2xl shadow-2xl p-4 space-y-3 ring-1 ring-white/10">
            <div className="relative">
              <Command className="w-5 h-5 absolute left-3.5 top-3.5 text-indigo-400" />
              <input
                type="text"
                autoFocus
                placeholder="Type to search 30 Admin Modules or press Esc..."
                value={cmdSearch}
                onChange={(e) => setCmdSearch(e.target.value)}
                className="w-full pl-11 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
              />
              {cmdSearch && (
                <button 
                  onClick={() => setCmdSearch('')} 
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between px-2">
              <span>QUICK NAVIGATION COMMANDS</span>
              <span>Press <kbd className="px-1 bg-slate-800 rounded text-slate-300">ESC</kbd> to exit</span>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-3 pr-1 no-scrollbar">
              {moduleCategories.map((cat, catIdx) => {
                const items = cat.items.filter(i => i.label.toLowerCase().includes(cmdSearch.toLowerCase()));
                if (items.length === 0) return null;

                return (
                  <div key={catIdx} className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase px-2">{cat.name}</span>
                    <div className="space-y-1">
                      {items.map(item => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id as AdminModuleTab);
                              setIsCmdKOpen(false);
                              setCmdSearch('');
                              notify('Category Jumped', `Navigated to ${item.label}`, 'info');
                            }}
                            className="w-full p-2.5 rounded-xl hover:bg-indigo-600/30 text-slate-200 hover:text-white flex items-center justify-between text-xs transition-all text-left border border-transparent hover:border-indigo-500/30"
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon className="w-4 h-4 text-indigo-400" />
                              <span className="font-semibold">{item.label}</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Staff Activity Audit Modal */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-700/80 bg-slate-900/95 backdrop-blur-2xl p-6 shadow-2xl space-y-4 ring-1 ring-white/10">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <History className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-white">Staff Activity Audit Log</h3>
                  <p className="text-xs text-slate-400">Accountability timeline of staff actions & security events</p>
                </div>
              </div>
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Filter Inputs */}
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="text"
                placeholder="Search audit actions..."
                value={auditSearchTerm}
                onChange={(e) => setAuditSearchTerm(e.target.value)}
                className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium flex-1 min-w-[180px]"
              />
              <select
                value={auditFilterCategory}
                onChange={(e) => setAuditFilterCategory(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-semibold"
              >
                <option value="all">All Categories</option>
                <option value="Roles">Roles</option>
                <option value="Moderation">Moderation</option>
                <option value="Content">Content</option>
                <option value="Database">Database</option>
                <option value="Payments">Payments</option>
                <option value="Users">Users</option>
              </select>
              <select
                value={auditFilterStaff}
                onChange={(e) => setAuditFilterStaff(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-semibold"
              >
                <option value="all">All Staff</option>
                <option value="Alex Rivera">Alex Rivera</option>
                <option value="Elena Rostova">Elena Rostova</option>
                <option value="Kai Takahashi">Kai Takahashi</option>
                <option value="System Bot">System Bot</option>
              </select>
            </div>

            {/* Audit Log Timeline Items */}
            <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1 no-scrollbar">
              {auditLogsList
                .filter(a => {
                  const matchesTerm = a.action.toLowerCase().includes(auditSearchTerm.toLowerCase()) || a.staff.toLowerCase().includes(auditSearchTerm.toLowerCase());
                  const matchesCat = auditFilterCategory === 'all' || a.category === auditFilterCategory;
                  const matchesStaff = auditFilterStaff === 'all' || a.staff === auditFilterStaff;
                  return matchesTerm && matchesCat && matchesStaff;
                })
                .map((item) => (
                  <div key={item.id} className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white">{item.staff}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {item.role}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-snug">{item.action}</p>
                      <div className="text-[10px] text-slate-500 font-mono">IP: {item.ip}</div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 font-mono block">{item.timestamp}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        item.badge === 'Critical' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {item.badge}
                      </span>
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  exportData('CSV');
                  notify('Audit Exported', 'Exported staff activity audit log CSV file', 'info');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" /> Export Audit Log
              </button>
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboardView;
