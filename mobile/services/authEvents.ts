type AuthListener = () => void;

let authListener: AuthListener | null = null;

export const setAuthListener = (listener: AuthListener) => {
  authListener = listener;
};

export const notifyAuthExpired = () => {
  if (authListener) {
    authListener();
  }
};
