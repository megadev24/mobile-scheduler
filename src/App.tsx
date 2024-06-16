import React, { useState, useRef, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import UserPage from "./pages/UserPage";
import IndexedDB from "./indexedDB";

const App: React.FC = () => {
  const [db, setDb] = useState<IndexedDB | null>(null);
  const isInitializedRef = useRef(false);

  const initializeDB = async () => {
    console.log("Initializing database");
    try {
      const indexedDBInstance = new IndexedDB();
      await indexedDBInstance.initializeDatabase();
      setDb(indexedDBInstance);
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  };

  useEffect(() => {
    if (isInitializedRef.current === false) {
      initializeDB();
      isInitializedRef.current = true;
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage db={db} />} />
        <Route
          path="/user/:userId"
          element={
            <UserPage db={db} setDb={setDb} intializeDB={initializeDB} />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
