import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'


import Header from './components/Header.jsx'
import WelcomeCard from './components/WelcomeCard.jsx'
import AnalysisButton from './components/AnalysisButton.jsx'
import Sidebar from './components/Sidebar.jsx'
import MainContent from './components/MainContent.jsx'

import Login from './components/Login.jsx'
import Register from './components/Register.jsx'
import Dashboard from './components/Dashboard.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    
          
    

  </StrictMode>,
)
