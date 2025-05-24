
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './components/Home/Home';
import Shop from './components/Shop/Shop';
import Contacts from './components/Contacts/Contacts';
import Profile from './components/Profile/Profile';
import Cart from './components/Cart/Cart';
import { GoogleOAuthProvider } from "@react-oauth/google";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function App() {
  return (
    <GoogleOAuthProvider clientId="472136523798-njate5d2pd2lqh57vmfs5l9gqt6foasu.apps.googleusercontent.com">
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </Router>
  </GoogleOAuthProvider>
);
}

export default App;
