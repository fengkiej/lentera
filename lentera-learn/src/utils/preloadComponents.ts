// Preload critical components for better user experience
import { lazy } from 'react';

// Preload Dashboard and LessonDetail as they are most commonly accessed
export const preloadDashboard = () => {
  const componentImport = import('../pages/Dashboard');
  return componentImport;
};

export const preloadLessonDetail = () => {
  const componentImport = import('../pages/LessonDetail');
  return componentImport;
};

export const preloadLearn = () => {
  const componentImport = import('../pages/Learn');
  return componentImport;
};

// Preload components after user login
export const preloadAfterLogin = () => {
  // Preload most commonly used components
  preloadDashboard();
  preloadLessonDetail();
  preloadLearn();
};

// Preload components on app idle
export const preloadOnIdle = () => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // Only preload components that are confirmed to exist
      import('../pages/Profile').catch(() => {});
      import('../pages/SubjectsList').catch(() => {});
      import('../pages/TopicsList').catch(() => {});
      import('../pages/LessonsList').catch(() => {});
    });
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    setTimeout(() => {
      import('../pages/Profile').catch(() => {});
      import('../pages/SubjectsList').catch(() => {});
      import('../pages/TopicsList').catch(() => {});
      import('../pages/LessonsList').catch(() => {});
    }, 2000);
  }
};