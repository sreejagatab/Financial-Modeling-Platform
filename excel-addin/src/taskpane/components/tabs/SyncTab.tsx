/**
 * Sync Tab Component
 */

import * as React from 'react';
import { useState, useCallback } from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
  Card,
  CardHeader,
  ProgressBar,
  MessageBar,
  MessageBarBody,
  Badge,
  Divider,
} from '@fluentui/react-components';
import {
  ArrowSync24Regular,
  CloudCheckmark24Regular,
  CloudDismiss24Regular,
  Clock24Regular,
  Delete24Regular,
} from '@fluentui/react-icons';

import { syncEngine } from '../../../sync/SyncEngine';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  statusCard: {
    padding: tokens.spacingHorizontalM,
  },
  statusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${tokens.spacingVerticalS} 0`,
  },
  statusLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  progressContainer: {
    marginTop: tokens.spacingVerticalM,
  },
  syncResult: {
    marginTop: tokens.spacingVerticalM,
  },
  dangerZone: {
    borderColor: tokens.colorPaletteRedBorder1,
  },
  dangerContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
});

interface SyncStatus {
  isOnline: boolean;
  pendingOperations: number;
  lastSyncTime: string | null;
  linkedCells: number;
}

interface SyncTabProps {
  syncStatus: SyncStatus;
  isAuthenticated: boolean;
}

export const SyncTab: React.FC<SyncTabProps> = ({ syncStatus, isAuthenticated }) => {
  const styles = useStyles();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: number; failed: number } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleSync = useCallback(async () => {
    setIsSyncing(true);
    setError(null);
    setSyncResult(null);

    try {
      const result = await syncEngine.forceSyncAll();
      setSyncResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const handleClearOfflineData = useCallback(async () => {
    if (confirm('Are you sure you want to clear all offline data? This cannot be undone.')) {
      try {
        await syncEngine.clearOfflineData();
        setSyncResult(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to clear data');
      }
    }
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className={styles.container}>
      {/* Connection Status */}
      <Card className={styles.statusCard}>
        <CardHeader header={<Text weight="semibold">Connection Status</Text>} />

        <div className={styles.statusRow}>
          <div className={styles.statusLabel}>
            {syncStatus.isOnline ? (
              <CloudCheckmark24Regular />
            ) : (
              <CloudDismiss24Regular />
            )}
            <Text>Platform Connection</Text>
          </div>
          <Badge
            appearance="filled"
            color={syncStatus.isOnline ? 'success' : 'danger'}
          >
            {syncStatus.isOnline ? 'Connected' : 'Offline'}
          </Badge>
        </div>

        <div className={styles.statusRow}>
          <div className={styles.statusLabel}>
            <ArrowSync24Regular />
            <Text>Pending Changes</Text>
          </div>
          <Badge
            appearance="filled"
            color={syncStatus.pendingOperations > 0 ? 'warning' : 'subtle'}
          >
            {syncStatus.pendingOperations}
          </Badge>
        </div>

        <div className={styles.statusRow}>
          <div className={styles.statusLabel}>
            <Clock24Regular />
            <Text>Last Sync</Text>
          </div>
          <Text>{formatDate(syncStatus.lastSyncTime)}</Text>
        </div>
      </Card>

      {/* Sync Actions */}
      {isAuthenticated && (
        <>
          <Divider>Sync Actions</Divider>

          <div className={styles.actions}>
            {!syncStatus.isOnline && (
              <MessageBar intent="warning">
                <MessageBarBody>
                  You are offline. Changes will be saved locally and synced when you
                  reconnect.
                </MessageBarBody>
              </MessageBar>
            )}

            {error && (
              <MessageBar intent="error">
                <MessageBarBody>{error}</MessageBarBody>
              </MessageBar>
            )}

            <Button
              appearance="primary"
              icon={<ArrowSync24Regular />}
              onClick={handleSync}
              disabled={
                isSyncing ||
                !syncStatus.isOnline ||
                syncStatus.pendingOperations === 0
              }
            >
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>

            {isSyncing && (
              <div className={styles.progressContainer}>
                <ProgressBar />
              </div>
            )}

            {syncResult && (
              <MessageBar
                intent={syncResult.failed === 0 ? 'success' : 'warning'}
                className={styles.syncResult}
              >
                <MessageBarBody>
                  Sync complete: {syncResult.success} succeeded
                  {syncResult.failed > 0 && `, ${syncResult.failed} failed`}
                </MessageBarBody>
              </MessageBar>
            )}
          </div>
        </>
      )}

      {/* Offline Data Info */}
      <Divider>Offline Storage</Divider>

      <Card className={styles.statusCard}>
        <Text>
          The Excel Add-in stores data locally for offline access. This includes
          cached values, pending changes, and linked cell information.
        </Text>

        <div className={styles.statusRow}>
          <Text>Linked Cells</Text>
          <Badge appearance="filled" color="informative">
            {syncStatus.linkedCells}
          </Badge>
        </div>

        <div className={styles.statusRow}>
          <Text>Pending Operations</Text>
          <Badge
            appearance="filled"
            color={syncStatus.pendingOperations > 0 ? 'warning' : 'subtle'}
          >
            {syncStatus.pendingOperations}
          </Badge>
        </div>
      </Card>

      {/* Danger Zone */}
      <Divider>Danger Zone</Divider>

      <Card className={`${styles.statusCard} ${styles.dangerZone}`}>
        <div className={styles.dangerContent}>
          <Text weight="semibold">Clear Offline Data</Text>
          <Text size={200}>
            This will delete all locally cached data, pending changes, and linked
            cell information. Any unsynced changes will be lost.
          </Text>
          <Button
            appearance="secondary"
            icon={<Delete24Regular />}
            onClick={handleClearOfflineData}
          >
            Clear All Data
          </Button>
        </div>
      </Card>
    </div>
  );
};
