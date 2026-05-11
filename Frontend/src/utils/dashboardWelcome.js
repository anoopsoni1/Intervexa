/** Session flag: show "Welcome" (not "Welcome back") after first successful login this tab session. */

export function dashboardFirstWelcomeStorageKey(userId) {
  if (userId == null) return null;
  return `dashboardWelcomeFirst_${String(userId)}`;
}

export function setDashboardFirstWelcomeFlag(userId) {
  const key = dashboardFirstWelcomeStorageKey(userId);
  if (!key) return;
  try {
    sessionStorage.setItem(key, "1");
  } catch {
    /* quota / private mode */
  }
}

export function shouldShowDashboardFirstWelcome(userId) {
  const key = dashboardFirstWelcomeStorageKey(userId);
  return Boolean(key && sessionStorage.getItem(key) === "1");
}

export function clearDashboardFirstWelcomeFlags() {
  try {
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith("dashboardWelcomeFirst_"))
      .forEach((k) => sessionStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}
