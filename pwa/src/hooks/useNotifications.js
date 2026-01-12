import { useState, useEffect, useCallback } from 'react';

const useNotifications = () => {
  const [permission, setPermission] = useState('default');
  const [swRegistration, setSwRegistration] = useState(null);

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission);
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        setSwRegistration(registration);
        console.log('Service Worker ready for notifications');
      });
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') {
      console.warn('Notifications not supported');
      return 'denied';
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    console.log('Notification permission:', result);
    return result;
  }, []);

  const notify = useCallback(async (title, options = {}) => {
    if (permission !== 'granted') {
      console.log('Notifications not granted, skipping');
      return null;
    }

    const defaultOptions = {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100],
      requireInteraction: false,
      silent: false,
      tag: 'cricket-event',
      renotify: true,
      ...options
    };

    if (defaultOptions.silent) {
      delete defaultOptions.vibrate;
    }

    try {
      if (swRegistration) {
        const notifications = await swRegistration.getNotifications({ tag: defaultOptions.tag });
        notifications.forEach((notification) => notification.close());

        await swRegistration.showNotification(title, defaultOptions);
        console.log('SW Notification sent:', title, 'tag:', defaultOptions.tag);
        return true;
      }

      const notification = new Notification(title, defaultOptions);
      setTimeout(() => notification.close(), 3000);
      console.log('Regular Notification sent:', title);
      return notification;
    } catch (err) {
      console.warn('Notification failed:', err);
      return null;
    }
  }, [permission, swRegistration]);

  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    const handleMessage = (event) => {
      console.log('Message from SW:', event.data);
      if (event.data?.type === 'UNDO_ACTION') {
        setPendingAction({ type: 'undo', tag: event.data.tag });
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, []);

  const consumeAction = useCallback(() => {
    const action = pendingAction;
    setPendingAction(null);
    return action;
  }, [pendingAction]);

  return { permission, requestPermission, notify, swRegistration, pendingAction, consumeAction };
};

export { useNotifications };
