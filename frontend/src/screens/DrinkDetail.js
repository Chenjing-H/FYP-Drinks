import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function RecipeInstructions({ instructions }) {
    // split instructions into numbered steps
    const steps = instructions.split(".").filter(Boolean);
  
    return (
        <ol style={styles.instructionList}>
            {steps.map((step, index) => (
                <li key={index}>
                    {/* remove whitespaces from both side */}
                    {step.trim()}
                    {/* add fullstop for every sentence */}
                    {index < steps.length ? "." : ""}
                </li>
            ))}
        </ol>
    );
}

  
function DrinkDetails() {
    // hooks to store drink recipes and search filters
    const { id } = useParams();
    const [drink, setDrink] = useState(null);
    const [savedRecipes, setSavedRecipes] = useState({});
    const [activeTab, setActiveTab] = useState("ingredients");
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || { name: "Guest" });
  
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDrinkDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:5173/drink-recipes/${id}`);
                const userEmail = JSON.parse(localStorage.getItem("user"))?.email || "guest";

                // check if user already liked the comment
                const updatedComments = response.data.comments.map(comment => ({
                    ...comment, liked: comment.likedBy?.includes(userEmail) || false,
                }));

                setDrink(response.data);
                setComments(updatedComments);
            } catch (error) {
                console.error("Error fetching drink details:", error);
            }
        };

        fetchDrinkDetails();

        // save recipes
        const saved = JSON.parse(localStorage.getItem("savedRecipes")) || {};
        setSavedRecipes(saved);
    }, [id]);

    if (!drink) return <p>No drink selected</p>;

    // toggle save recipe
    const toggleSaveRecipe = () => {
        setSavedRecipes((prev) => {
          const updated = { ...prev, [id] : !prev[id] };
          localStorage.setItem("savedRecipes", JSON.stringify(updated));
          return updated;
        });
    };

    // add a comment
    const handleAddComment = async () => {
        if (!newComment.trim()) return;
    
        try {
          const response = await axios.post(`http://localhost:5173/drink-recipes/${id}/comments`, {
            user: user.name,
            text: newComment,
          });
    
          setComments(response.data.comments.sort((a, b) => b.likes - a.likes || new Date(b.date) - new Date(a.date)));
          setNewComment("");
        } catch (error) {
          console.error("Error adding comment:", error);
        }
      };

      // delete a comment
      const handleDeleteComment = async (commentId) => {
        const userEmail = JSON.parse(localStorage.getItem("user"))?.email || "guest";

        if (!userEmail) {
            console.error("User not logged in.");
            return;
        }

        try{
            const response = await axios.delete(`http://localhost:5173/drink-recipes/${id}/comments/${commentId}`, {data: { userEmail: userEmail.trim().toLowerCase() }, headers: { "Content-Type": "application/json"}});
            setComments(response.data);
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
      }

      // like a comment
      const handleLikeComment = async (commentId) => {
        const userEmail = JSON.parse(localStorage.getItem("user"))?.email || "guest";

        if (!userEmail) {
            console.error("User not logged in.");
            return;
        }

        try {
          const response = await axios.put(`http://localhost:5173/drink-recipes/${id}/comments/${commentId}/like`, {userEmail});
          const updatedComments = response.data.map(comment => ({
            ...comment, liked: comment.likedBy?.includes(userEmail) || false, 
          }));
          setComments(updatedComments);
        } catch (error) {
          console.error("Error liking comment:", error);
        }
      };

    return (
        <div style={styles.container}>
            <div style={styles.contentWrapper}>
                <div style={styles.leftColumn}>
                    <button onClick={() => navigate("/")} style={styles.backButton}>← Back</button><br/>
                    <img src={drink.imageUrl || "https://via.placeholder.com/300"} alt={drink.name} style={styles.image} />
                    <h2 style={styles.title}>{drink.name}</h2>
                    <div style={styles.ratingRow}>
                        <p><strong>Average Rating:</strong> ⭐{drink.avgRate.toFixed(1)}</p>
                        {/* save button */}
                        <button style={styles.saveButton} 
                            onClick={toggleSaveRecipe}>
                            {savedRecipes[id] ? "♥" : "♡"}
                        </button>
                    </div>
                </div>

                <div style={styles.rightColumn}>
                    <div>
                    {/* tabs for ingredients and instructions*/}
                        <div style={styles.tabHeader}>
                            <button style={activeTab === "ingredients" ? styles.activeTab : styles.tab}
                            onClick={() => setActiveTab("ingredients")}>
                                Ingredients
                            </button>
                            <button style={activeTab === "instructions" ? styles.activeTab : styles.tab}
                            onClick={() => setActiveTab("instructions")}>
                                Instructions
                            </button>
                        </div>
                        {/* tab contents */}
                        <div style={styles.tabContent}>
                            {activeTab === "ingredients" ? (
                                <ul style={styles.ingredientList}>
                                    {drink.ingredients
                                        .filter(ing => ing.ingredient) 
                                        .map((ing, index) => (
                                            <li key={index}>
                                                {ing.measure ? `${ing.measure} ${ing.ingredient}` : ing.ingredient}
                                            </li>
                                        ))}
                                </ul>
                            ) : (
                                <RecipeInstructions instructions={drink.instructions} /> 
                            )}
                        </div>
                    </div>
                    {/* comments */}
                    <div>
                        <h3>Comments</h3>
                        <div style={styles.comments}>
                            <input type="text" placeholder="Add comment" value={newComment} onChange={(e) => setNewComment(e.target.value)} style={styles.commentInput} />
                            <button onClick={handleAddComment} style={styles.commentButton}>Post</button>
                        </div>

                        {/* display comments */}
                        <div>
                            {comments.map((comment) => (
                                <div key={comment._id} style={styles.comment}>
                                    {/* username and comment */}
                                    <div style={styles.commentText}>
                                        <strong>{comment.user}</strong> : {comment.text}
                                    </div>
                                    {/* likes and delete */}
                                    <div style={styles.likeContainer}>
                                        <button style={styles.likeButton} onClick={() => handleLikeComment(comment._id)}>
                                            {comment.liked ? "♥" : "♡"} {comment.likes}
                                        </button>

                                        {/* only show delete button when the comment belongs to the user */}
                                        {comment.user === user.name && (
                                            <button style={styles.deleteButton} onClick={() => handleDeleteComment(comment._id)}>🗑</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: "90%",
        margin: "auto",
        padding: "20px",
        textAlign: "center",
    },
    contentWrapper: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginTop: "5%",
    },
    leftColumn: {
        width: "40%",
        textAlign: "left",
    },
    rightColumn: {
        width: "55%",
        textAlign: "left",
    },
    ratingRow: {
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginTop: "10px",
    },
    title: {
        fontSize: "2rem",
        marginBottom: "1rem",
        textAlign: "center",
    },
    image: {
        width: "90%",
        height: "300px",
        objectFit: "cover",
        borderRadius: "5px",
        marginTop: "10%",
    },
    backButton: {
        textAlign: "left",
        marginBottom: "10px",
        padding: "10px",
        borderRadius: "5px",
        border: "none",
        backgroundColor: "#0080ff",
        color: "white",
        cursor: "pointer",
    },
    saveButton: {
        background: "none", 
        fontSize: "1.5rem",
        cursor: "pointer",
        border: "none",
        marginRight: "9%",
    },
    ingredientList: {
        listStyleType: "square",
        textAlign: "left",
    },
    instructionList: {
        listStyleType: "decimal",
        textAlign: "left",
    },
    tabHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginLeft: "15%",
        marginRight: "15%",
        marginTop: "10%",
        //maxWidth: "60%",
    },
    tab: {
        padding: "10px 20px",
        cursor: "pointer",
        border: "none",
        borderBottom: "none",
        backgroundColor: "#fff",
        fontWeight: "bold",
        fontSize: "20px",
    },
    activeTab: {
        padding: "10px 20px",
        cursor: "pointer",
        border: "none",
        borderBottom: "3px solid #0080ff",
        backgroundColor: "#fff",
        fontWeight: "bold",
        fontSize: "20px",
    },
    tabContent: {
        textAlign: "left",
        padding: "10px", 
        borderRadius: "5px",
        backgroundColor: "#f9f9f9",
    }, 
    comments: {
        display: "flex", 
        gap: "10px", 
        marginTop: "20px", 
    },
    commentInput: {
        flex: 1, 
        padding: "10px", 
        borderRadius: "5px",
        border: "1px solid #ccc",
    },
    commentButton: {
        padding: "10px 15px",
        marginTop: "10px",
        fontSize: "1rem",
        backgroundColor: "#0080ff",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
    comment: {
        display: "flex", 
        justifyContent: "space-between",
        alignItems: "center", 
        padding: "10px", 
        borderBottom: "1px solid #ccc",
    }, 
    likeButton: {
        textAlign: "right",
        background: "none",
        fontSize: "1rem",
        cursor: "pointer",
        border: "none",
    }, 
    deleteButton: {
        background: "none",
        fontSize: "1.3rem",
        cursor: "pointer",
        border: "none",
        marginLeft: "10px",
    },      
    commentText: {
        flex: 1,
        textAlign: "left",
    },
    likeContainer: {
        display: "flex",
        alignItems: "center", 
        gap: "5px",
    }
  };

export default DrinkDetails;
