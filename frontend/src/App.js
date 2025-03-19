import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Login from './screens/Login';
import Signup from './screens/Signup';
import Profile from './screens/Profile';
import Drinks from './screens/Drinks';
import DrinkDetail from './screens/DrinkDetail';
import Navbar from './screens/Navbar';
import CreateRecipe from "./screens/CreateRecipe";
import EditRecipe from './screens/EditRecipe';
import API_URL from './config';

fetch(`${API_URL}/api/drinks`)
  .then(response => response.json())
  .then(data => console.log(data));


function App() {
  return (
    <BrowserRouter>
    <Navbar />
      <div style={styles.pageContent}>
      <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/drinks" element={<Drinks />} />
          <Route path="/drink/:id" element={<DrinkDetail />} />
          <Route path="/create-recipe" element={<CreateRecipe />} />
          <Route path="/edit-recipe/:recipeId" element={<EditRecipe />} />
          <Route path="*" element={<Drinks />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}


const styles = {
  navbar: {
    width: "100%",
    backgroundColor: "#7a9bff", 
    padding: "15px",
    boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
    position: "fixed",
    top: 0,
    left: 0, 
    zIndex: 1000,
  },
  navbarContainer: {
    maxWidth: "90%",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 20px",    
  },
  logo: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "white",
    textDecoration: "none",
  },
  navbarLink: {
    display: "flex",
    gap: "20px",
  },
  link: {
    fontSize: "1rem",
    color: "white",
    textDecoration: "none",
  },
  pageContent: {
    marginTop: "50px",
    padding: "20px",
  }
}


export default App;
