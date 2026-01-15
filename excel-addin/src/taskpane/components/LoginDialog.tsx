/**
 * Login Dialog Component
 */

import * as React from 'react';
import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogBody,
  DialogActions,
  Button,
  Input,
  Label,
  makeStyles,
  tokens,
  Spinner,
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components';

const useStyles = makeStyles({
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  error: {
    marginBottom: tokens.spacingVerticalM,
  },
});

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
  onLogin: (token: string, user: { email: string; name: string }) => void;
}

export const LoginDialog: React.FC<LoginDialogProps> = ({
  open,
  onClose,
  onLogin,
}) => {
  const styles = useStyles();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setIsLoading(true);

      try {
        const response = await fetch('http://localhost:8001/api/v1/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || 'Login failed');
        }

        const data = await response.json();
        onLogin(data.access_token, {
          email: data.email,
          name: data.full_name || email.split('@')[0],
        });

        // Reset form
        setEmail('');
        setPassword('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Login failed');
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, onLogin]
  );

  const handleClose = useCallback(() => {
    setEmail('');
    setPassword('');
    setError(null);
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onOpenChange={(_, data) => !data.open && handleClose()}>
      <DialogSurface>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <DialogTitle>Sign in to Financial Platform</DialogTitle>
            <DialogContent>
              {error && (
                <MessageBar intent="error" className={styles.error}>
                  <MessageBarBody>{error}</MessageBarBody>
                </MessageBar>
              )}

              <div className={styles.form}>
                <div className={styles.field}>
                  <Label htmlFor="email" required>
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(_, data) => setEmail(data.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className={styles.field}>
                  <Label htmlFor="password" required>
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(_, data) => setPassword(data.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button appearance="primary" type="submit" disabled={isLoading}>
                {isLoading ? <Spinner size="tiny" /> : 'Sign In'}
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
};
