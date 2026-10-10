/**
 * Umami (estadísticas sin cookies). Solo se carga si el build recibe ambas variables;
 * sin ellas, o sin conexión, la app funciona igual.
 */
export function loadAnalytics(): void {
  const src = import.meta.env.VITE_UMAMI_SCRIPT_URL;
  const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID;
  if (!src || !websiteId) return;
  const script = document.createElement('script');
  script.defer = true;
  script.src = src;
  script.dataset.websiteId = websiteId;
  const domains = import.meta.env.VITE_UMAMI_DOMAINS;
  if (domains) script.dataset.domains = domains;
  document.head.append(script);
}
