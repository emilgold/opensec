import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Company from "./pages/Company";
import Filing from "./pages/Filing";
import Search from "./pages/Search";
import Compare from "./pages/Compare";
import Watchlist from "./pages/Watchlist";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/company/:cik" element={<Company />} />
        <Route path="/filing/:cik/:accession" element={<Filing />} />
        <Route path="/search" element={<Search />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/watchlist" element={<Watchlist />} />
      </Routes>
    </Layout>
  );
}
