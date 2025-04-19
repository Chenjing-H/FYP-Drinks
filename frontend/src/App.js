import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './screens/Login';
import Signup from './screens/Signup';
import Profile from './screens/Profile';
import Drinks from './screens/Drinks';
import DrinkDetail from './screens/DrinkDetail';
import Navbar from './screens/Navbar';
import CreateRecipe from "./screens/CreateRecipe";
import EditRecipe from './screens/EditRecipe';
import Homepage from "./screens/Homepage";
import API_URL from './config';

fetch(`${API_URL}/drink-recipes`, {
  method: "GET",
  headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}` // ensure token is stored in localStorage
  },
  credentials: "include"  // if using cookies for authentication
})
.then(response => {
  if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return response.json();
})
.then(data => console.log("Fetched data:", data))
.catch(error => console.error("Error fetching drinks:", error));



function App() {
  return (
    <BrowserRouter>
    <Navbar />
      <div style={styles.pageContent}>
      <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={<Navbar />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/drinks" element={<Drinks />} />
            <Route path="/drink/:id" element={<DrinkDetail />} />
            <Route path="/create-recipe" element={<CreateRecipe />} />
            <Route path="/edit-recipe/:recipeId" element={<EditRecipe />} />
            <Route path="/" element={<Homepage />} />
            <Route path="*" element={<Homepage />} />
          </Route>
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
    padding: "20px",
  }
}


export default App;
