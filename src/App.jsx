import { Header } from "./components/Header";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Debug from "./pages/Debug";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        {/* <Route path="/home" element={<Home />} /> */}
        <Route path="/debug" element={<Debug />} />
        {/* <Route path="/learn" element={<Learn />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
