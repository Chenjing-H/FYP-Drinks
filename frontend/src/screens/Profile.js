import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import defaultProfileImg from "../images/defaultProfileImg.png";

function Profile() {
  // hooks to store drink recipes and search filters
  const navigate = useNavigate();
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [user, setUser] = useState(null);
  const [editField, setEditField] = useState(null);
  const [formData, setFormData] = useState({
    name:"",
    email:"",
    password:"",
    profileImage:"",
  });

  // handle logout 
  const handleLogout = () => {
    localStorage.removeItem("user"); // Remove stored user data
    navigate("/login"); // Redirect to login page
  };

  const handleEditClick = (field) => {
    setEditField(field);
  };

  const handleCancel = () => {
    setEditField(null);
    setFormData(user); // Reset form data
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [editField]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const updatedUser = { ...user, [editField]: formData[editField] };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Update backend user data
      await axios.put(`http://localhost:5173/user/update`, { [editField]: formData[editField] });

      setEditField(null);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };


  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);


  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedRecipes")) || {};
    const savedRecipeIds = Object.keys(saved).filter(id => saved[id]);

    // set empty array if no saved recipes
    if (savedRecipeIds.length === 0) {
      setSavedRecipes([]); 
      return;
    }

    // Fetch drink recipes database from the backend
    const fetchSavedRecipes = async () => {
      try {
        const response = await axios.get("http://localhost:5173/drink-recipes");
        const filteredRecipes = response.data.filter(recipe => savedRecipeIds.includes(recipe._id));
        // initialize recipes and filtered recipes to all
        setSavedRecipes(filteredRecipes);
      } catch (error) {
        console.error("Error fetching saved drink recipes:", error);
      }
    };

    fetchSavedRecipes();
  }, []);

  if (!user) return null;

  return (
    <div style={styles.container}>
      {/* user detail */}
      <div style={styles.leftColumn}>
        <img src={user.profileImage} onError={(e) => e.target.src = defaultProfileImg} alt="User Profile" style={styles.profileImage} />
        
        <h3 style={styles.username}>{user.name}</h3>
        {/* <div style={styles.inputContainer}>
        <label style={styles.label}>Name</label><br/>
          {editField === "name" ? (
            <input type="text" value={formData.name} onChange={handleChange} style={styles.input} />
          ) : (
            <span style={styles.fieldText}>{user.name}</span>
          )}
          {editField === "name" ? (
            <>
              <button onClick={handleSave} style={styles.saveButton}><FaSave /></button>
              <button onClick={handleCancel} style={styles.cancelButton}><FaTimes /></button>
            </>
          ) : (
            <button onClick={() => handleEditClick("name")} style={styles.editButton}><FaEdit /></button>
          )}
        </div> */}
        
        <p>{user.email}</p>
        <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
      </div>

      {/* saved recipes */}
      <div style={styles.rightColumn}>
        <h4>Saved</h4>
        {savedRecipes.length > 0 ? (
          <div style={styles.recipeList}>
            {savedRecipes.map((recipe) => (
              <div key={recipe._id} style={styles.recipeCard} onClick={() => navigate(`/drink/${recipe._id}`)}>
                <img src={recipe.imageUrl || "https://via.placeholder.com/150"} alt={recipe.name} style={styles.image} />
                <h3 style={styles.recipeName}>{recipe.name}</h3>
                </div>
            ))}
            </div>
        ) : (
          <p>No saved recipes</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "grid", 
    gridTemplateColumns: "30% 70%", 
    gap: "20px", 
    maxWidth: "90%", 
    margin: "auto",
    padding: "20px", 
  }, 
  leftColumn: {
    textAlign: "left",
    padding: "20px",  
    backgroundColor: "pink",
  },
  rightColumn: {
    textAlign: "left",
    padding: "20px",
    backgroundColor: "lavender",
  },
  profileImage: {
    width: "90%",
    height: "300px",
    objectFit: "cover",
    borderRadius: "5px",
    marginTop: "10%",
  },
  username: {
    fontSize: "1.5rem",
    marginBottom: "1rem",
  },
  logoutButton: {
    padding: "10px", 
    backgroundColor: "transparent", 
    border: "none",
    cursor: "pointer", 
    marginTop: "20%",
    marginLeft: "70%",
  },
  recipeList: {
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", 
    gap: "20px",
  }, 
  recipeCard: {
    backgroundColor: "#fff",
    padding: "10px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    textAlign: "center",
    position: "relative",
    cursor: "pointer",
  },
  image: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    borderRadius: "5px",
  },
  recipeName: {
    fontSize: "0.8rem",
    margin: "10px",
    fontWeight: "bold",
    wordWrap: "break-word",
    whiteSpace: "normal",
  },
}


export default Profile;
