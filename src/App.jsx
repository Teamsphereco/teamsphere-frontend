import Login from './pages/login/Login'
import Signup from './pages/signup/SignUp'
import Home from './pages/home/Home'
import Chat from './pages/chat/Chat'
import Settings from './pages/settings/Settings'
import Friends from './pages/friends/Friends'
import OAuthCallback from './pages/auth/OAuthCallback'
import CardStackDemo from './pages/cardstack/CardStackDemo'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuthContext } from "./context/AuthContext";
import AppToaster from "./components/AppToaster";
import useSettings from "./zustand/useSettings";
import { useEffect, useState } from "react";

const resolveTheme = (theme) => {
  if (theme !== "system") {
    return theme;
  }

  if (typeof window === "undefined" || !window.matchMedia) {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

function App() {
  const { authUser } = useAuthContext();
  const token = authUser?.jwt;
  const { settings, loadAppearanceSettings } = useSettings();
  const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(settings.theme));

  useEffect(() => {
    if (token) {
      void loadAppearanceSettings(token);
    }
  }, [loadAppearanceSettings, token]);

  useEffect(() => {
    const updateResolvedTheme = () => setResolvedTheme(resolveTheme(settings.theme));
    updateResolvedTheme();

    if (settings.theme !== "system" || typeof window === "undefined" || !window.matchMedia) {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", updateResolvedTheme);
    return () => mediaQuery.removeEventListener("change", updateResolvedTheme);
  }, [settings.theme]);

  useEffect(() => {
    document.documentElement.style.setProperty("--ts-message-font-size", `${settings.messageTextSize}px`);
    document.documentElement.style.setProperty("--ts-code-font-size", `${settings.codeFontSize}px`);
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.dataset.themePreference = settings.theme;
    document.documentElement.dataset.density = settings.chatDensity;
    document.documentElement.dataset.reduceMotion = settings.reduceMotion ? "true" : "false";
  }, [resolvedTheme, settings.chatDensity, settings.codeFontSize, settings.messageTextSize, settings.reduceMotion, settings.theme]);

  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={authUser ? <Navigate to='/chat' /> : <Login />} />
        <Route path='/signin' element={authUser ? <Navigate to='/chat' /> : <Login />} />
        <Route path='/signup' element={authUser ? <Navigate to='/chat' /> : <Signup />} />
        <Route path='/chat' element={authUser ? <Chat /> : <Navigate to='/login' />} />
        <Route path='/friends' element={authUser ? <Friends /> : <Navigate to='/login' />} />
        <Route path='/settings' element={authUser ? <Settings /> : <Navigate to='/login' />} />
        <Route path='/card-stack' element={<CardStackDemo />} />
        <Route path='/oauth/callback' element={<OAuthCallback />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
      <AppToaster />
    </div>
  )
}

export default App
