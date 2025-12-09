import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MindMapPage from './pages/MindmapPage';
// import other pages here when needed
//import LoginPage from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MindMapPage />} />
        {/*<Route path="/login" element={<LoginPage />} />*/}
      </Routes>
    </Router>
  );
}

export default App;