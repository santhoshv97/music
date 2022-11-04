import S3Upload from "./components/S3Upload";
import BucketList from "./components/S3List";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<S3Upload />} />
        <Route path="/bucketlist" element={<BucketList />} />
      </Routes>
    </>
  );
}

export default App;
