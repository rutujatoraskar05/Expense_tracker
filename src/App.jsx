import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from "./components/Dashboard";
import SignUpSignIn from "./components/Signup";

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={5000}  closeOnClick pauseOnHover draggable pauseOnFocusLoss />
      <Routes>
        <Route path="/" element={<SignUpSignIn />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
