/**
 * Main App Component for Excel Task Pane
 */

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  FluentProvider,
  webLightTheme,
  webDarkTheme,
  Tab,
  TabList,
  Spinner,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  Home24Regular,
  Link24Regular,
  ArrowSync24Regular,
  Settings24Regular,
} from '@fluentui/react-icons';

import { syncEngine } from '../../sync/SyncEngine';
import { Header } from './Header';
import { HomeTab } from './tabs/HomeTab';
import { LinksTab } from './tabs/LinksTab';
import { SyncTab } from './tabs/SyncTab';
import { SettingsTab } from './tabs/SettingsTab';
import { LoginDialog } from './LoginDialog';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: tokens.spacingHorizontalM,
  },
  tabList: {
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    padding: `0 ${tokens.spacingHorizontalM}`,
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
});

type TabValue = 'home' | 'links' | 'sync' | 'settings';

interface SyncStatus {
  isOnline: boolean;
  pendingOperations: number;
  lastSyncTime: string | null;
  linkedCells: number;
}

export const App: React.FC = () => {
  const styles = useStyles();
  const [selectedTab, setSelectedTab] = useState<TabValue>('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    pendingOperations: 0,
    lastSyncTime: null,
    linkedCells: 0,
  });
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);

  // Initialize on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check for stored auth token
        const token = localStorage.getItem('fp_auth_token');
        if (token) {
          syncEngine.setAuthToken(token);
          setIsAuthenticated(true);

          // Get user info
          const userInfo = localStorage.getItem('fp_user_info');
          if (userInfo) {
            setUser(JSON.parse(userInfo));
          }
        }

        // Get initial sync status
        const status = await syncEngine.getSyncStatus();
        setSyncStatus(status);
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // Subscribe to sync status changes
  useEffect(() => {
    const unsubscribe = syncEngine.onSyncStatusChange((status) => {
      setSyncStatus(status);
    });

    return () => unsubscribe();
  }, []);

  // Check system dark mode preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handleLogin = useCallback(
    (token: string, userInfo: { email: string; name: string }) => {
      localStorage.setItem('fp_auth_token', token);
      localStorage.setItem('fp_user_info', JSON.stringify(userInfo));
      syncEngine.setAuthToken(token);
      setIsAuthenticated(true);
      setUser(userInfo);
      setShowLoginDialog(false);
    },
    []
  );

  const handleLogout = useCallback(() => {
    localStorage.removeItem('fp_auth_token');
    localStorage.removeItem('fp_user_info');
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const handleTabChange = useCallback(
    (_: unknown, data: { value: TabValue }) => {
      setSelectedTab(data.value);
    },
    []
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'home':
        return (
          <HomeTab
            isAuthenticated={isAuthenticated}
            syncStatus={syncStatus}
            onLoginClick={() => setShowLoginDialog(true)}
          />
        );
      case 'links':
        return <LinksTab isAuthenticated={isAuthenticated} />;
      case 'sync':
        return <SyncTab syncStatus={syncStatus} isAuthenticated={isAuthenticated} />;
      case 'settings':
        return (
          <SettingsTab
            isDarkMode={isDarkMode}
            onThemeChange={setIsDarkMode}
            user={user}
            onLogout={handleLogout}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <FluentProvider theme={isDarkMode ? webDarkTheme : webLightTheme}>
        <div className={styles.root}>
          <div className={styles.loadingContainer}>
            <Spinner size="large" label="Loading..." />
          </div>
        </div>
      </FluentProvider>
    );
  }

  return (
    <FluentProvider theme={isDarkMode ? webDarkTheme : webLightTheme}>
      <div className={styles.root}>
        <Header
          isOnline={syncStatus.isOnline}
          pendingOperations={syncStatus.pendingOperations}
          isAuthenticated={isAuthenticated}
        />

        <TabList
          className={styles.tabList}
          selectedValue={selectedTab}
          onTabSelect={handleTabChange}
        >
          <Tab icon={<Home24Regular />} value="home">
            Home
          </Tab>
          <Tab icon={<Link24Regular />} value="links">
            Links
          </Tab>
          <Tab icon={<ArrowSync24Regular />} value="sync">
            Sync
          </Tab>
          <Tab icon={<Settings24Regular />} value="settings">
            Settings
          </Tab>
        </TabList>

        <div className={styles.content}>{renderTabContent()}</div>

        <LoginDialog
          open={showLoginDialog}
          onClose={() => setShowLoginDialog(false)}
          onLogin={handleLogin}
        />
      </div>
    </FluentProvider>
  );
};
