import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const basename = '';  // replace with your GitHub repo name

function App() {
  return (
    <Router basename={basename}>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <Routes>
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route 
            path="/admin" 
            element={
              <PrivateRoute>
                <AdminPage />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/video" element={<Video />} />
          <Route path="/category" element={<Category />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}
