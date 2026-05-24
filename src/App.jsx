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

function App() {
  const { authUser } = useAuthContext();

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
