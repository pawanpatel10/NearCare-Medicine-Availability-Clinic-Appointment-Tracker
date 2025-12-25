import { useState } from 'react'

import './App.css'
import Login from './components/Login'
import Signup from './components/Signup'
import UserHome from './components/UserHome'
import ClinicHome from './components/ClinicHome'
import PharmacyHome from './components/PharmacyHome'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <Login/>
    </>
  )
}

export default App
