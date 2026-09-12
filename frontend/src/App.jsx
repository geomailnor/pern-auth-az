import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Navbar from './components/Navbar';
import Register from './components/Register';
import Login from './components/Login';
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import InputBel from './components/InputBel';
import ListBels from './components/ListBels';
import ResetPassword from './components/ResetPassword';
import './App.css'; // Това стилизира навбара и login и register
import './todo.css'; // Това стил. списъка

function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position='top-center' />
        <div className='app-cont'>
          <Navbar />
          <main className='app-main'>
            <Routes>
              <Route path='/' element={<ProtectedRoute><Navigate to="/tasks" /></ProtectedRoute>} />
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path='/tasks' element={<div className='container'><InputBel /><ListBels /></div>} />
              <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App
