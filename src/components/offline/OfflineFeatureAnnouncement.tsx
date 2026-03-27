import React, { useState, useEffect, useCallback } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useTranslation } from 'react-i18next';
import { getDeviceId } from '@/services/offline/syncEngine';
import { useUserType } from '@/hooks/useUserType';

const OFFLINE_FEATURE_SEEN_KEY = 'offline-feature-seen-v1';
const TOUR_COMPLETED_KEY = 'product-tour-completed';
const TOUR_VERSION = '1';

function getStorageKey(): string {
  return `${OFFLINE_FEATURE_SEEN_KEY}-${getDeviceId()}`;
}

export function OfflineFeatureAnnouncement() {
  const { t } = useTranslation('onboarding');
  const { isMainAdminUser } = useUserType();
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(getStorageKey()) === 'true') return;
    const tourCompleted = localStorage.getItem(TOUR_COMPLETED_KEY) === TOUR_VERSION;
    if (isMainAdminUser && !tourCompleted) return; // Let product tour run first
    const timer = setTimeout(() => setRun(true), 1500);
    return () => clearTimeout(timer);
  }, [isMainAdminUser]);

  const handleEnd = useCallback(() => {
    setRun(false);
    localStorage.setItem(getStorageKey(), 'true');
  }, []);

  const handleCallback = useCallback(
    (data: CallBackProps) => {
      const { status } = data;
      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        handleEnd();
      }
    },
    [handleEnd]
  );

  const steps: Step[] = [
    {
      target: 'body',
      content: t('tour.offlineFeature.content'),
      title: t('tour.offlineFeature.title'),
      placement: 'center',
      disableBeacon: true,
    },
  ];

  if (!run) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress={false}
      showSkipButton
      scrollToFirstStep
      spotlightClicks={false}
      disableOverlayClose={false}
      callback={handleCallback}
      locale={{
        back: t('tour.buttons.back'),
        close: t('tour.buttons.close'),
        last: t('tour.buttons.finish'),
        next: t('tour.buttons.finish'),
        skip: t('tour.buttons.skip'),
      }}
      styles={{
        options: {
          zIndex: 10001,
          primaryColor: 'hsl(var(--primary))',
          textColor: 'hsl(var(--foreground))',
          backgroundColor: 'hsl(var(--card))',
          arrowColor: 'hsl(var(--card))',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
        },
        tooltip: {
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '420px',
        },
        tooltipContainer: { textAlign: 'left' },
        tooltipTitle: {
          fontSize: '18px',
          fontWeight: 600,
          marginBottom: '12px',
          color: 'hsl(var(--foreground))',
        },
        tooltipContent: {
          fontSize: '14px',
          lineHeight: '1.7',
          color: 'hsl(var(--muted-foreground))',
        },
        buttonNext: {
          backgroundColor: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
          borderRadius: '10px',
          padding: '10px 20px',
          fontSize: '14px',
          fontWeight: 500,
        },
        buttonSkip: {
          color: 'hsl(var(--muted-foreground))',
          fontSize: '13px',
        },
        spotlight: { borderRadius: '12px' },
        beacon: { display: 'none' },
      }}
    />
  );
}
