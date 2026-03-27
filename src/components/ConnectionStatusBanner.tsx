import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface ConnectionStatusBannerProps {
  isOnline: boolean;
  isBackendHealthy: boolean;
  message: string;
  onDismiss: () => void;
  onRetry: () => Promise<boolean>;
}

/**
 * Banner that shows connection issues (offline or backend down).
 */
export function ConnectionStatusBanner({
  isOnline,
  isBackendHealthy,
  message,
  onDismiss,
  onRetry,
}: ConnectionStatusBannerProps) {
  const { t } = useTranslation('shared');

  if (isOnline && isBackendHealthy) {
    return null;
  }

  const isOffline = !isOnline;
  const Icon = isOffline ? WifiOff : AlertTriangle;
  const bgColor = isOffline ? 'bg-red-50 dark:bg-red-950' : 'bg-amber-50 dark:bg-amber-950';
  const borderColor = isOffline ? 'border-red-200 dark:border-red-800' : 'border-amber-200 dark:border-amber-800';
  const iconColor = isOffline ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400';
  const textColor = isOffline ? 'text-red-900 dark:text-red-100' : 'text-amber-900 dark:text-amber-100';

  return (
    <div className={`fixed bottom-4 right-4 z-[9998] max-w-sm ${bgColor} border ${borderColor} rounded-lg shadow-lg p-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 ${iconColor} flex-shrink-0 mt-0.5`} />
        
        <div className="flex-1">
          <h4 className={`font-semibold ${textColor}`}>
            {isOffline
              ? t('connection.offline') || 'No Connection'
              : t('connection.backendIssue') || 'Backend Issue'}
          </h4>
          {message && (
            <p className={`text-sm ${textColor} opacity-90 mt-1`}>
              {message}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            onClick={onRetry}
            size="sm"
            variant="outline"
            className={`text-xs ${textColor} border-current hover:bg-white/20 dark:hover:bg-black/20`}
          >
            {t('common.retry') || 'Retry'}
          </Button>
          <Button
            onClick={onDismiss}
            size="sm"
            variant="ghost"
            className={`text-xs ${textColor} hover:bg-white/20 dark:hover:bg-black/20`}
          >
            ✕
          </Button>
        </div>
      </div>
    </div>
  );
}
