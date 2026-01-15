/**
 * Home Tab Component
 */

import * as React from 'react';
import { useState, useCallback } from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Card,
  CardHeader,
  Button,
  Input,
  Label,
  Divider,
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components';
import {
  DocumentText24Regular,
  Calculator24Regular,
  ArrowDownload24Regular,
  PersonAccounts24Regular,
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  welcomeCard: {
    padding: tokens.spacingHorizontalM,
  },
  welcomeContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: tokens.spacingHorizontalM,
  },
  statCard: {
    padding: tokens.spacingHorizontalM,
    textAlign: 'center',
  },
  statValue: {
    fontSize: tokens.fontSizeHero700,
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorBrandForeground1,
  },
  statLabel: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  quickActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  functionHelp: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  functionItem: {
    backgroundColor: tokens.colorNeutralBackground3,
    padding: tokens.spacingHorizontalS,
    borderRadius: tokens.borderRadiusMedium,
    fontFamily: 'monospace',
    fontSize: tokens.fontSizeBase200,
  },
});

interface SyncStatus {
  isOnline: boolean;
  pendingOperations: number;
  lastSyncTime: string | null;
  linkedCells: number;
}

interface HomeTabProps {
  isAuthenticated: boolean;
  syncStatus: SyncStatus;
  onLoginClick: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  isAuthenticated,
  syncStatus,
  onLoginClick,
}) => {
  const styles = useStyles();
  const [modelPath, setModelPath] = useState('');

  const handleInsertFunction = useCallback(
    async (functionName: string) => {
      try {
        await Excel.run(async (context) => {
          const range = context.workbook.getSelectedRange();
          let formula = '';

          switch (functionName) {
            case 'GET':
              formula = `=FP.GET("${modelPath || 'ModelPath'}", "A1")`;
              break;
            case 'LINK':
              formula = `=FP.LINK("${modelPath || 'ModelPath'}", "A1")`;
              break;
            case 'SCENARIO':
              formula = `=FP.SCENARIO("Base_Case", "A1")`;
              break;
            case 'LIVE':
              formula = `=FP.LIVE("market", "AAPL", "price")`;
              break;
          }

          range.formulas = [[formula]];
          await context.sync();
        });
      } catch (error) {
        console.error('Error inserting function:', error);
      }
    },
    [modelPath]
  );

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <Card className={styles.welcomeCard}>
          <CardHeader
            header={<Text weight="semibold" size={400}>Welcome to Financial Platform</Text>}
          />
          <div className={styles.welcomeContent}>
            <Text>
              Connect your Excel workbooks to the Financial Modeling Platform.
              Sign in to access your models and enable real-time sync.
            </Text>
            <Button
              appearance="primary"
              icon={<PersonAccounts24Regular />}
              onClick={onLoginClick}
            >
              Sign In
            </Button>
          </div>
        </Card>

        <Divider>Custom Functions</Divider>

        <div className={styles.functionHelp}>
          <Text weight="semibold">Available Functions:</Text>
          <div className={styles.functionItem}>
            =FP.GET("model/path", "A1") - Fetch a value
          </div>
          <div className={styles.functionItem}>
            =FP.LINK("model/path", "A1") - Create link
          </div>
          <div className={styles.functionItem}>
            =FP.SCENARIO("Base_Case", "A1") - Scenario value
          </div>
          <div className={styles.functionItem}>
            =FP.LIVE("market", "AAPL", "price") - Live data
          </div>
          <div className={styles.functionItem}>
            =FP.SENSITIVITY("B2", "D5", 10) - Sensitivity table
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <Text className={styles.statValue}>{syncStatus.linkedCells}</Text>
          <Text className={styles.statLabel}>Linked Cells</Text>
        </Card>
        <Card className={styles.statCard}>
          <Text className={styles.statValue}>{syncStatus.pendingOperations}</Text>
          <Text className={styles.statLabel}>Pending Sync</Text>
        </Card>
      </div>

      {!syncStatus.isOnline && (
        <MessageBar intent="warning">
          <MessageBarBody>
            You are currently offline. Changes will sync when connection is restored.
          </MessageBarBody>
        </MessageBar>
      )}

      <Divider>Quick Actions</Divider>

      <div className={styles.quickActions}>
        <div>
          <Label htmlFor="modelPath">Model Path</Label>
          <Input
            id="modelPath"
            placeholder="e.g., Portfolio/CompanyA/DCF"
            value={modelPath}
            onChange={(_, data) => setModelPath(data.value)}
          />
        </div>

        <Button
          appearance="secondary"
          icon={<ArrowDownload24Regular />}
          onClick={() => handleInsertFunction('GET')}
        >
          Insert FP.GET
        </Button>

        <Button
          appearance="secondary"
          icon={<DocumentText24Regular />}
          onClick={() => handleInsertFunction('LINK')}
        >
          Insert FP.LINK
        </Button>

        <Button
          appearance="secondary"
          icon={<Calculator24Regular />}
          onClick={() => handleInsertFunction('SCENARIO')}
        >
          Insert FP.SCENARIO
        </Button>
      </div>

      <Divider>Function Reference</Divider>

      <div className={styles.functionHelp}>
        <div className={styles.functionItem}>
          =FP.GET("model/path", "A1", [version])
        </div>
        <div className={styles.functionItem}>
          =FP.LINK("model/path", "A1")
        </div>
        <div className={styles.functionItem}>
          =FP.SCENARIO("scenario_name", "A1")
        </div>
        <div className={styles.functionItem}>
          =FP.LIVE("source", "id", "field")
        </div>
        <div className={styles.functionItem}>
          =FP.SENSITIVITY("input", "output", steps)
        </div>
        <div className={styles.functionItem}>
          =FP.AUDIT("A1", "last_modified_by")
        </div>
        <div className={styles.functionItem}>
          =FP.COMMENT("A1")
        </div>
      </div>
    </div>
  );
};
