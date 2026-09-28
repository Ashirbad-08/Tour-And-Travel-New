import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WishlistCartProvider } from './context/WishlistCartContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Gallery from './pages/Gallery';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import AllDestinations from './pages/AllDestinations';
import DestinationDetails from './pages/DestinationDetails';
import PackageDetails from './pages/PackageDetails';
import CategoryPage from './pages/Categorypage';
import './App.css';
import SelectDestination from './components/HomeComponents/SelectDestination';
import TourDestination from './components/HomeComponents/TourDestination';
import Footer from './components/Footer';

function App() {
  return (
    <>
    <Router>
      <WishlistCartProvider>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/destinations" element={<AllDestinations />} />
            <Route path="/destination/:id" element={<DestinationDetails />} />
            <Route path="/packages/:id" element={<PackageDetails />} />

            {/* Category Routes */}
            <Route path="/beaches" element={<CategoryPage />} />
            <Route path="/hiking" element={<CategoryPage />} />
            <Route path="/waterfalls" element={<CategoryPage />} />
            <Route path="/volcanoes" element={<CategoryPage />} />
            <Route path="/monuments" element={<CategoryPage />} />
            <Route path="/bucket-list" element={<CategoryPage />} />

            {/* Component Routes */}
            <Route path="/select-destination" element={<SelectDestination />} />
            <Route path="/tour-destination" element={<TourDestination />} />
          </Routes>
        </div>
      </WishlistCartProvider>
      </Router>
      <Footer />    </>
    
  );
}

export default App;
