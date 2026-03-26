import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiCog6Tooth, HiUser, HiBell, HiShieldCheck, HiPaintBrush,
  HiGlobeAlt, HiCpuChip, HiCheckCircle
} from 'react-icons/hi2';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'agent',
  });

  const [notifSettings, setNotifSettings] = useState({
    emailAlerts: true,
    renewalReminders: true,
    riskAlerts: true,
    systemUpdates: false,
    reminderDays: 30,
  });

  const [displaySettings, setDisplaySettings] = useState({
    compactMode: false,
    animationsEnabled: true,
    showRiskScores: true,
    defaultView: 'dashboard',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const handleSave = () => {
    // Settings are local-only for now
    setSaved(true);
    toast.success('Settings saved successfully');
    setTimeout(() => setSaved(false), 2000);
  };

  const sections = [
    { key: 'profile', label: 'Profile', icon: HiUser },
    { key: 'notifications', label: 'Notifications', icon: HiBell },
    { key: 'display', label: 'Display', icon: HiPaintBrush },
    { key: 'system', label: 'System Info', icon: HiCpuChip },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-10"
    >
      {/* Header */}
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
          <HiCog6Tooth className="w-8 h-8 text-slate-400" /> SETTINGS
        </h1>
        <p className="text-slate-400 font-mono text-xs mt-1 uppercase tracking-widest">
          System Configuration & Preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-1">
          {sections.map(s => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-mono text-xs uppercase tracking-widest transition-all ${
                activeSection === s.key
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'
              }`}
            >
              <s.icon className="w-4 h-4" /> {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile */}
          {activeSection === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 tech-border space-y-6">
              <h3 className="text-white font-bold flex items-center gap-2">
                <HiUser className="w-5 h-5 text-blue-400" /> PROFILE INFORMATION
              </h3>

              <div className="flex items-center gap-6 pb-6 border-b border-white/10">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center text-amber-400 font-mono font-bold text-2xl border border-amber-500/30">
                  {profile.name?.[0] || 'U'}
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{profile.name}</p>
                  <p className="text-slate-400 font-mono text-xs uppercase tracking-wider">{profile.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SettingField label="Full Name" value={profile.name} onChange={(v) => setProfile(p => ({ ...p, name: v }))} />
                <SettingField label="Email" value={profile.email} onChange={(v) => setProfile(p => ({ ...p, email: v }))} type="email" />
                <div>
                  <label className="block text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-2">Role</label>
                  <div className="bg-white/5 border border-white/10 text-slate-400 px-4 py-2.5 rounded font-mono text-sm cursor-not-allowed">
                    {profile.role}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-mono text-xs uppercase tracking-widest transition-all border border-blue-400/20">
                  {saved ? <HiCheckCircle className="w-4 h-4" /> : null}
                  {saved ? 'Saved' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 tech-border space-y-6">
              <h3 className="text-white font-bold flex items-center gap-2">
                <HiBell className="w-5 h-5 text-amber-400" /> NOTIFICATION PREFERENCES
              </h3>

              <div className="space-y-4">
                <ToggleSetting
                  label="Email Alerts"
                  description="Receive email notifications for important events"
                  enabled={notifSettings.emailAlerts}
                  onChange={(v) => setNotifSettings(s => ({ ...s, emailAlerts: v }))}
                />
                <ToggleSetting
                  label="Renewal Reminders"
                  description="Get notified before policy renewal dates"
                  enabled={notifSettings.renewalReminders}
                  onChange={(v) => setNotifSettings(s => ({ ...s, renewalReminders: v }))}
                />
                <ToggleSetting
                  label="Risk Alerts"
                  description="Notifications when risk scores change significantly"
                  enabled={notifSettings.riskAlerts}
                  onChange={(v) => setNotifSettings(s => ({ ...s, riskAlerts: v }))}
                />
                <ToggleSetting
                  label="System Updates"
                  description="Stay informed about system maintenance and updates"
                  enabled={notifSettings.systemUpdates}
                  onChange={(v) => setNotifSettings(s => ({ ...s, systemUpdates: v }))}
                />

                <div className="pt-4 border-t border-white/10">
                  <label className="block text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-2">
                    Renewal Reminder Lead Time (days)
                  </label>
                  <select
                    value={notifSettings.reminderDays}
                    onChange={(e) => setNotifSettings(s => ({ ...s, reminderDays: parseInt(e.target.value) }))}
                    className="bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded font-mono text-sm focus:outline-none focus:border-blue-500/50"
                  >
                    {[7, 14, 30, 60, 90].map(d => (
                      <option key={d} value={d}>{d} days</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-mono text-xs uppercase tracking-widest transition-all border border-blue-400/20">
                  Save Preferences
                </button>
              </div>
            </motion.div>
          )}

          {/* Display */}
          {activeSection === 'display' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 tech-border space-y-6">
              <h3 className="text-white font-bold flex items-center gap-2">
                <HiPaintBrush className="w-5 h-5 text-purple-400" /> DISPLAY PREFERENCES
              </h3>

              <div className="space-y-4">
                <ToggleSetting
                  label="Compact Mode"
                  description="Reduce spacing for denser information display"
                  enabled={displaySettings.compactMode}
                  onChange={(v) => setDisplaySettings(s => ({ ...s, compactMode: v }))}
                />
                <ToggleSetting
                  label="Animations"
                  description="Enable smooth transitions and motion effects"
                  enabled={displaySettings.animationsEnabled}
                  onChange={(v) => setDisplaySettings(s => ({ ...s, animationsEnabled: v }))}
                />
                <ToggleSetting
                  label="Show Risk Scores"
                  description="Display AI risk scores on policy listings"
                  enabled={displaySettings.showRiskScores}
                  onChange={(v) => setDisplaySettings(s => ({ ...s, showRiskScores: v }))}
                />

                <div className="pt-4 border-t border-white/10">
                  <label className="block text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-2">Default Landing Page</label>
                  <select
                    value={displaySettings.defaultView}
                    onChange={(e) => setDisplaySettings(s => ({ ...s, defaultView: e.target.value }))}
                    className="bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded font-mono text-sm focus:outline-none focus:border-blue-500/50"
                  >
                    {['dashboard', 'policies', 'renewals', 'analytics'].map(v => (
                      <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-2">Timezone</label>
                  <div className="bg-white/5 border border-white/10 text-slate-300 px-4 py-2.5 rounded font-mono text-sm">
                    {displaySettings.timezone}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-mono text-xs uppercase tracking-widest transition-all border border-blue-400/20">
                  Save Preferences
                </button>
              </div>
            </motion.div>
          )}

          {/* System Info */}
          {activeSection === 'system' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 tech-border space-y-6">
              <h3 className="text-white font-bold flex items-center gap-2">
                <HiCpuChip className="w-5 h-5 text-emerald-400" /> SYSTEM INFORMATION
              </h3>

              <div className="space-y-3">
                <InfoRow label="Application" value="MassMutual Renewal System" />
                <InfoRow label="Version" value="v2.4.0-STABLE" />
                <InfoRow label="Build" value="Production" />
                <InfoRow label="Backend" value="Node.js / Express" />
                <InfoRow label="Database" value="SQLite / PostgreSQL" />
                <InfoRow label="Real-time" value="Socket.io" />
                <InfoRow label="AI Engine" value="OpenAI + Local Fallback" />
                <InfoRow label="Integration" value="ServiceNow" />
                <InfoRow label="Deployment" value="Firebase Hosting" />
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-emerald-400 font-mono uppercase tracking-wider">All Systems Operational</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const SettingField = ({ label, value, onChange, type = 'text' }) => (
  <div>
    <label className="block text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded font-mono text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
    />
  </div>
);

const ToggleSetting = ({ label, description, enabled, onChange }) => (
  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
    <div>
      <p className="text-sm font-bold text-white font-mono">{label}</p>
      <p className="text-xs text-slate-400 mt-0.5">{description}</p>
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-all ${
        enabled ? 'bg-blue-600' : 'bg-slate-700'
      }`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
        enabled ? 'translate-x-5' : 'translate-x-0'
      }`} />
    </button>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
    <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">{label}</span>
    <span className="text-xs text-white font-mono">{value}</span>
  </div>
);

export default Settings;
