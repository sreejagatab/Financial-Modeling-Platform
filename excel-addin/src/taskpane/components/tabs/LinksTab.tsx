/**
 * Links Tab Component
 */

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
  Card,
  Spinner,
  MessageBar,
  MessageBarBody,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Tooltip,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogBody,
  DialogActions,
} from '@fluentui/react-components';
import {
  ArrowSync24Regular,
  Delete24Regular,
  Link24Regular,
  LinkDismiss24Regular,
} from '@fluentui/react-icons';

import { syncEngine } from '../../../sync/SyncEngine';
import { LinkedCell } from '../../../offline/IndexedDBStore';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingVerticalXXL,
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '48px',
    color: tokens.colorNeutralForeground3,
  },
  table: {
    width: '100%',
  },
  cellAddress: {
    fontFamily: 'monospace',
    fontWeight: tokens.fontWeightSemibold,
  },
  modelPath: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    wordBreak: 'break-all',
  },
  lastSync: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalXS,
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXL,
  },
});

interface LinksTabProps {
  isAuthenticated: boolean;
}

export const LinksTab: React.FC<LinksTabProps> = ({ isAuthenticated }) => {
  const styles = useStyles();
  const [links, setLinks] = useState<LinkedCell[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlinkTarget, setUnlinkTarget] = useState<LinkedCell | null>(null);

  const loadLinks = useCallback(async () => {
    try {
      setError(null);
      const linkedCells = await syncEngine.getLinkedCells();
      setLinks(linkedCells);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load links');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await syncEngine.refreshLinkedCells();
      await loadLinks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Refresh failed');
    } finally {
      setIsRefreshing(false);
    }
  }, [loadLinks]);

  const handleUnlink = useCallback(async () => {
    if (!unlinkTarget) return;

    try {
      await syncEngine.unlinkCell(unlinkTarget.localAddress);
      setLinks((prev) =>
        prev.filter((l) => l.localAddress !== unlinkTarget.localAddress)
      );
      setUnlinkTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlink');
    }
  }, [unlinkTarget]);

  const handleGoToCell = useCallback(async (address: string) => {
    try {
      await Excel.run(async (context) => {
        const sheet = context.workbook.worksheets.getActiveWorksheet();
        const range = sheet.getRange(address);
        range.select();
        await context.sync();
      });
    } catch (err) {
      console.error('Error navigating to cell:', err);
    }
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.emptyState}>
        <Link24Regular className={styles.emptyIcon} />
        <Text>Sign in to view and manage linked cells</Text>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="large" label="Loading links..." />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Text weight="semibold" size={400}>
          Linked Cells ({links.length})
        </Text>
        <Button
          appearance="subtle"
          icon={<ArrowSync24Regular />}
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh All'}
        </Button>
      </div>

      {error && (
        <MessageBar intent="error">
          <MessageBarBody>{error}</MessageBarBody>
        </MessageBar>
      )}

      {links.length === 0 ? (
        <div className={styles.emptyState}>
          <LinkDismiss24Regular className={styles.emptyIcon} />
          <Text weight="semibold">No Linked Cells</Text>
          <Text>
            Use =FP.LINK() to create bidirectional links between Excel and the
            platform.
          </Text>
        </div>
      ) : (
        <Table className={styles.table} size="small">
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Cell</TableHeaderCell>
              <TableHeaderCell>Model</TableHeaderCell>
              <TableHeaderCell>Value</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.map((link) => (
              <TableRow key={link.localAddress}>
                <TableCell>
                  <Button
                    appearance="subtle"
                    size="small"
                    onClick={() => handleGoToCell(link.localAddress)}
                  >
                    <span className={styles.cellAddress}>{link.localAddress}</span>
                  </Button>
                </TableCell>
                <TableCell>
                  <div>
                    <Text className={styles.modelPath}>{link.modelPath}</Text>
                    <br />
                    <Text className={styles.lastSync}>
                      Synced: {formatDate(link.lastSyncedAt)}
                    </Text>
                  </div>
                </TableCell>
                <TableCell>
                  <Text>{String(link.lastValue)}</Text>
                </TableCell>
                <TableCell>
                  <div className={styles.actions}>
                    <Tooltip content="Unlink" relationship="label">
                      <Button
                        appearance="subtle"
                        size="small"
                        icon={<Delete24Regular />}
                        onClick={() => setUnlinkTarget(link)}
                      />
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Unlink Confirmation Dialog */}
      <Dialog
        open={!!unlinkTarget}
        onOpenChange={(_, data) => !data.open && setUnlinkTarget(null)}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Unlink Cell?</DialogTitle>
            <DialogContent>
              <Text>
                Are you sure you want to unlink cell{' '}
                <strong>{unlinkTarget?.localAddress}</strong>? This will stop
                syncing between Excel and the platform for this cell.
              </Text>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setUnlinkTarget(null)}>
                Cancel
              </Button>
              <Button appearance="primary" onClick={handleUnlink}>
                Unlink
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};
