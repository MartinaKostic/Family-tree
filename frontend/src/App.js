import Home from "./components/Home";
import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./helpers/AuthContext";
import { FirstSignupProvider } from "./helpers/FirstSignupContext";
import FamilyTree from "./components/FamilyTree";
import AddRootNode from "./components/SignUp/AddRootNode";
import AboutUs from "./components/AboutUs";

function App() {
  return (
    <AuthProvider>
      <FirstSignupProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/family-tree" element={<FamilyTree />} />
            <Route path="/add-root-node" element={<AddRootNode />} />
            <Route path="/about" element={<AboutUs />} />
          </Routes>
        </Router>
      </FirstSignupProvider>
    </AuthProvider>
  );
}

export default App;
