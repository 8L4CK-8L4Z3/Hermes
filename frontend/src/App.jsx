import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "@/Elements/Login/Login";
import RegisterPage from "@/Elements/Register/Register";
import Lander from "@/Elements/Lander/Lander";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Lander />} />
      </Routes>
    </Router>
  );
}

export default App;
