import Home from "./components/Home";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import FamilyTree from "./components/FamilyTree";
import AddRouteNode from "./components/SignUp/AddRouteNode";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/familytree" element={<FamilyTree />} />
        <Route path="/add-root-node" element={<AddRouteNode />} />
      </Routes>
    </Router>
  );
}

export default App;
