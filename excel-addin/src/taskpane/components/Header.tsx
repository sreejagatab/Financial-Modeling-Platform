/**
 * Header Component for Task Pane
 */

import * as React from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Badge,
  Tooltip,
} from '@fluentui/react-components';
import {
  CloudCheckmark24Regular,
  CloudDismiss24Regular,
  ArrowSync24Regular,
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.spacingHorizontalM,
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  logoText: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase400,
  },
  status: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  statusIcon: {
    display: 'flex',
    alignItems: 'center',
  },
});

interface HeaderProps {
  isOnline: boolean;
  pendingOperations: number;
  isAuthenticated: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isOnline,
  pendingOperations,
  isAuthenticated,
}) => {
  const styles = useStyles();

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Text className={styles.logoText}>Financial Platform</Text>
      </div>

      <div className={styles.status}>
        {pendingOperations > 0 && (
          <Tooltip content={`${pendingOperations} changes pending sync`} relationship="label">
            <Badge
              appearance="filled"
              color="warning"
              icon={<ArrowSync24Regular />}
            >
              {pendingOperations}
            </Badge>
          </Tooltip>
        )}

        <Tooltip
          content={isOnline ? 'Connected to platform' : 'Offline - changes will sync when online'}
          relationship="label"
        >
          <div className={styles.statusIcon}>
            {isOnline ? (
              <CloudCheckmark24Regular />
            ) : (
              <CloudDismiss24Regular />
            )}
          </div>
        </Tooltip>
      </div>
    </header>
  );
};
