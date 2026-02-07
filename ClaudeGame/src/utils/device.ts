const MOBILE_UA_PATTERN = /Android|webOS|iPhone|iPad|iPod|Mobile|BlackBerry|IEMobile|Opera Mini/i;

export function isLikelyMobileClient(): boolean {
  const touchPoints = typeof navigator === 'undefined' ? 0 : navigator.maxTouchPoints;
  const userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent;
  const viewportWidth = typeof window === 'undefined' ? 1280 : window.innerWidth;
  const viewportHeight = typeof window === 'undefined' ? 720 : window.innerHeight;
  const coarsePointer = typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(pointer: coarse)').matches;
  const touchCapable = touchPoints > 0 || coarsePointer;
  const shortestEdge = Math.min(viewportWidth, viewportHeight);

  return MOBILE_UA_PATTERN.test(userAgent) || (touchCapable && shortestEdge <= 1024);
}

export function isMobileDevice(): boolean {
  return isLikelyMobileClient();
}
