import React from 'react';
import logo from '../assets/logo.jpg';
import styles from '../styles/Header.module.css';


const Header = () => {
  return (
    <header className={styles.header}>
      <img src={logo} alt="VyVy's Garden Logo" className={styles.logo} />
      <h1 className={styles.title}>Handicraft Order Form</h1>
    </header>
  );
};

export default Header;