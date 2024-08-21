import Home from "./components/Home";
import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import FamilyTree from "./components/FamilyTree";
import AddRootNode from "./components/SignUp/AddRootNode";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/family-tree" element={<FamilyTree />} />
        <Route path="/add-root-node" element={<AddRootNode />} />
      </Routes>
    </Router>
  );
}

export default App;
