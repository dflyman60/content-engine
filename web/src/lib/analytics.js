export const trackEvent = (eventName, params = {}) => {
  if (!window.gtag) return;

  window.gtag('event', eventName, {
    ...params,
    page_path: window.location.pathname,
    page_title: document.title,
  });
};
