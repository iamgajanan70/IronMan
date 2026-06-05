
import React, { useState, useEffect } from 'react'
import './App.css'
import Hero from './components/Hero'
import FluidCursor from './components/FluidCursor'
import LoadingScreen from './components/LoadingScreen'

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
     <FluidCursor />
     <Hero />
    </>
  )
}

export default App