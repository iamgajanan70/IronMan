import React from 'react'
import './Navbar.css'

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-logo">THE <span>AVENGER</span></div>

      <ul className="nav-links">
        <li data-cursor="link">The Villains</li>
        <li data-cursor="link">Tony Stark</li>
        <li data-cursor="link">The suits</li>
        <li data-cursor="link">The Mission</li>
      </ul>
    </nav>
  )
}

export default Navbar