import { Header } from "./components/Header";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Debug from "./pages/Debug";
import Home from "./pages/Home";
import Login from "./pages/SignInOut";
import Analytics from "./pages/Analytics";

// TESTING 

//import Test, { BlockPreview } from "./components/BlockPreview"
//import BlockPage from "./components/BlockPreview";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/debug" element={<Debug />} />
        <Route path="/account" element={<Login />} />
        <Route path="/analytics" element={<Analytics />} />  
        {/* <Route path="/learn" element={<Learn />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
