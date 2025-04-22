import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StoreList from './components/StoreList';
// import HomePage from './components/HomePage'; // Optional: remove if not needed

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StoreList />} />
        {/* Optional: keep this if you still want a homepage at another route */}
        {/* <Route path="/home" element={<HomePage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
