import React from 'react'
import './Navbar.css'

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-logo">THE <span>AVENGER</span></div>

      <ul className="nav-links">
        <li>The Villains</li>
        <li>Tony Stark</li>
        <li>The suits</li>
        <li>The Mission</li>
      </ul>
    </nav>
  )
}

export default Navbar