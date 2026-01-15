/**
 * Settings Tab Component
 */

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
  Card,
  CardHeader,
  Switch,
  Input,
  Label,
  Divider,
  Avatar,
  Badge,
} from '@fluentui/react-components';
import {
  Person24Regular,
  SignOut24Regular,
  WeatherMoon24Regular,
  WeatherSunny24Regular,
  Timer24Regular,
  Server24Regular,
} from '@fluentui/react-icons';

import { offlineStore } from '../../../offline/IndexedDBStore';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  userCard: {
    padding: tokens.spacingHorizontalM,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalM,
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  settingsCard: {
    padding: tokens.spacingHorizontalM,
  },
  settingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${tokens.spacingVerticalS} 0`,
  },
  settingLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  settingDescription: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    marginTop: tokens.spacingVerticalXXS,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    marginTop: tokens.spacingVerticalM,
  },
  aboutSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  versionBadge: {
    alignSelf: 'flex-start',
  },
});

interface SettingsTabProps {
  isDarkMode: boolean;
  onThemeChange: (isDark: boolean) => void;
  user: { email: string; name: string } | null;
  onLogout: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  isDarkMode,
  onThemeChange,
  user,
  onLogout,
}) => {
  const styles = useStyles();
  const [apiUrl, setApiUrl] = useState('http://localhost:8001/api/v1');
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState(30);
  const [cacheTimeout, setCacheTimeout] = useState(5);

  // Load settings from IndexedDB
  useEffect(() => {
    const loadSettings = async () => {
      const savedApiUrl = await offlineStore.getPreference<string>('apiUrl');
      const savedAutoSync = await offlineStore.getPreference<boolean>('autoSync');
      const savedSyncInterval = await offlineStore.getPreference<number>('syncInterval');
      const savedCacheTimeout = await offlineStore.getPreference<number>('cacheTimeout');

      if (savedApiUrl) setApiUrl(savedApiUrl);
      if (savedAutoSync !== undefined) setAutoSync(savedAutoSync);
      if (savedSyncInterval) setSyncInterval(savedSyncInterval);
      if (savedCacheTimeout) setCacheTimeout(savedCacheTimeout);
    };

    loadSettings();
  }, []);

  const handleApiUrlChange = useCallback(async (value: string) => {
    setApiUrl(value);
    await offlineStore.setPreference('apiUrl', value);
  }, []);

  const handleAutoSyncChange = useCallback(async (checked: boolean) => {
    setAutoSync(checked);
    await offlineStore.setPreference('autoSync', checked);
  }, []);

  const handleSyncIntervalChange = useCallback(async (value: string) => {
    const interval = parseInt(value, 10);
    if (!isNaN(interval) && interval >= 5) {
      setSyncInterval(interval);
      await offlineStore.setPreference('syncInterval', interval);
    }
  }, []);

  const handleCacheTimeoutChange = useCallback(async (value: string) => {
    const timeout = parseInt(value, 10);
    if (!isNaN(timeout) && timeout >= 1) {
      setCacheTimeout(timeout);
      await offlineStore.setPreference('cacheTimeout', timeout);
    }
  }, []);

  return (
    <div className={styles.container}>
      {/* User Section */}
      {user && (
        <>
          <Card className={styles.userCard}>
            <CardHeader header={<Text weight="semibold">Account</Text>} />
            <div className={styles.userInfo}>
              <Avatar
                name={user.name}
                color="brand"
                size={48}
              />
              <div className={styles.userDetails}>
                <Text weight="semibold">{user.name}</Text>
                <Text size={200}>{user.email}</Text>
              </div>
            </div>
            <Button
              appearance="secondary"
              icon={<SignOut24Regular />}
              onClick={onLogout}
            >
              Sign Out
            </Button>
          </Card>
          <Divider />
        </>
      )}

      {/* Appearance Settings */}
      <Card className={styles.settingsCard}>
        <CardHeader header={<Text weight="semibold">Appearance</Text>} />

        <div className={styles.settingRow}>
          <div className={styles.settingLabel}>
            {isDarkMode ? <WeatherMoon24Regular /> : <WeatherSunny24Regular />}
            <div>
              <Text>Dark Mode</Text>
              <Text className={styles.settingDescription}>
                Use dark theme for the task pane
              </Text>
            </div>
          </div>
          <Switch
            checked={isDarkMode}
            onChange={(_, data) => onThemeChange(data.checked)}
          />
        </div>
      </Card>

      {/* Sync Settings */}
      <Card className={styles.settingsCard}>
        <CardHeader header={<Text weight="semibold">Sync Settings</Text>} />

        <div className={styles.settingRow}>
          <div className={styles.settingLabel}>
            <Timer24Regular />
            <div>
              <Text>Auto Sync</Text>
              <Text className={styles.settingDescription}>
                Automatically sync changes with the platform
              </Text>
            </div>
          </div>
          <Switch
            checked={autoSync}
            onChange={(_, data) => handleAutoSyncChange(data.checked)}
          />
        </div>

        {autoSync && (
          <div className={styles.field}>
            <Label htmlFor="syncInterval">Sync Interval (seconds)</Label>
            <Input
              id="syncInterval"
              type="number"
              min="5"
              value={String(syncInterval)}
              onChange={(_, data) => handleSyncIntervalChange(data.value)}
            />
          </div>
        )}

        <div className={styles.field}>
          <Label htmlFor="cacheTimeout">Cache Timeout (minutes)</Label>
          <Input
            id="cacheTimeout"
            type="number"
            min="1"
            value={String(cacheTimeout)}
            onChange={(_, data) => handleCacheTimeoutChange(data.value)}
          />
        </div>
      </Card>

      {/* Connection Settings */}
      <Card className={styles.settingsCard}>
        <CardHeader header={<Text weight="semibold">Connection</Text>} />

        <div className={styles.field}>
          <Label htmlFor="apiUrl">
            <div className={styles.settingLabel}>
              <Server24Regular />
              Platform API URL
            </div>
          </Label>
          <Input
            id="apiUrl"
            value={apiUrl}
            onChange={(_, data) => handleApiUrlChange(data.value)}
            placeholder="http://localhost:8001/api/v1"
          />
        </div>
      </Card>

      {/* About Section */}
      <Card className={styles.settingsCard}>
        <CardHeader header={<Text weight="semibold">About</Text>} />

        <div className={styles.aboutSection}>
          <Text weight="semibold">Financial Platform Excel Add-in</Text>
          <Badge
            className={styles.versionBadge}
            appearance="outline"
            color="informative"
          >
            Version 1.0.0
          </Badge>
          <Text size={200}>
            Connect your Excel workbooks to the Financial Modeling Platform for
            real-time collaboration and data synchronization.
          </Text>
          <Text size={200}>
            &copy; 2024 Financial Platform. All rights reserved.
          </Text>
        </div>
      </Card>
    </div>
  );
};
