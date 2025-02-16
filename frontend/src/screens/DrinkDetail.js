import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function DrinkDetails() {
  const { id } = useParams();
  const [drink, setDrink] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDrinkDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5173/drink-recipes/${id}`);
        setDrink(response.data);
      } catch (error) {
        console.error("Error fetching drink details:", error);
      }
    };

    fetchDrinkDetails();
  }, [id]);

  if (!drink) return <p>No drink selected</p>;

  return (
    <div style={styles.container}>
      <button onClick={() => navigate("/")} style={styles.backButton}>← Back to Recipes</button>
      <h2 style={styles.title}>{drink.name}</h2>
      <img src={drink.imageUrl || "https://via.placeholder.com/300"} alt={drink.name} style={styles.image} />
      <p><strong>Average Rating:</strong> ⭐{drink.avgRate.toFixed(1)}</p>
      <h3>Ingredients:</h3>
      <ul>
        {drink.ingredients
          .filter(ing => ing.ingredient) // Remove nulls
          .map((ing, index) => (
            <li key={index}>{ing.ingredient} ({ing.measure})</li>
          ))}
      </ul>
      <h3>Instructions:</h3>
      <p>{drink.instructions}</p>
    </div>
  );
}

const styles = {
  container: { maxWidth: "600px", margin: "auto", padding: "20px", textAlign: "center" },
  title: { fontSize: "2rem", marginBottom: "1rem" },
  image: { width: "100%", height: "300px", objectFit: "cover", borderRadius: "5px" },
  backButton: {
    marginBottom: "10px",
    padding: "10px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#007bff",
    color: "white",
    cursor: "pointer",
  },
};

export default DrinkDetails;
