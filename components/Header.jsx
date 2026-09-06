  // components/Header.jsx
  'use client';

  import { useState, useEffect } from 'react';
  import { useRouter } from 'next/navigation';
  import { Search, Bell, LogOut, Moon, Sun, Clock } from 'lucide-react';
  import { supabase } from '@/lib/supabase';

  export default function Header({ user }) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
      const updateDateTime = () => {
        const now = new Date();
        setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }));
      };
      updateDateTime();
      const interval = setInterval(updateDateTime, 1000);
      return () => clearInterval(interval);
    }, []);

    useEffect(() => {
      const savedTheme = localStorage.getItem('w365_theme') || 'dark';
      setTheme(savedTheme);
    }, []);

    useEffect(() => {
      const loadNotifications = async () => {
        if (!user?.id) return;
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_read', false)
          .order('created_at', { ascending: false })
          .limit(5);
        setNotifications(data || []);
      };
      loadNotifications();
    }, [user]);

    const toggleTheme = () => {
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
      localStorage.setItem('w365_theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    };

    const handleSearch = (e) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.push('/works?search=' + encodeURIComponent(searchQuery));
      }
    };

    const handleLogout = async () => {
      await supabase.auth.signOut();
      router.replace('/login');
    };

    const markAsRead = async (id) => {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (
      <header className="bg-[var(--bg-card)] border-b border-[var(--border-color)] px-6 py-4">
        <div className="flex items-center justify-between">
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Employee Name, Job ID, or Work ID..."
                className="w-full pl-10 pr-4 py-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          </form>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[var(--text-muted)]">
              <Clock className="w-5 h-5" />
              <div className="text-right">
                <p className="text-sm font-medium text-[var(--text-main)]">{currentTime}</p>
                <p className="text-xs">{currentDate}</p>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-main)] hover:text-[var(--text-main)] transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-main)] hover:text-[var(--text-main)] transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-lg z-50">
                  <div className="p-4 border-b border-[var(--border-color)]">
                    <h3 className="font-medium text-[var(--text-main)]">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-sm text-[var(--text-muted)] text-center">No new notifications</p>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-4 border-b border-[var(--border-color)] hover:bg-[var(--bg-main)] cursor-pointer"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <p className="text-sm font-medium text-[var(--text-main)]">{notification.title}</p>
                          <p className="text-xs text-[var(--text-muted)] mt-1">{notification.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </header>
    );
  }