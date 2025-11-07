// lib/logoutHelper.ts
let logoutFn: (() => void) | null = null;

export const setLogoutHandler = (fn: () => void) => {
  logoutFn = fn;
};

export const callLogout = () => {
  if (logoutFn) {
    logoutFn();
  }
};
