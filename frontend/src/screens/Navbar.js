import { useNavigate, Link } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    // handle logout 
    const handleLogout = () => {
        localStorage.removeItem("user"); // Remove stored user data
        navigate("/login"); // Redirect to login page
    };

    return (
        <nav style={styles.navbar}>
            <div style={styles.navbarContainer}>
                <Link to="/" style={styles.logo}>DrinkApp</Link>
                <div style={styles.navbarLink}>
                    {user ? (
                        <>
                            <Link to="/drinks" style={styles.link}>Drinks</Link>
                            <Link to="/profile" style={styles.link}>Profile</Link>
                            <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={styles.link}>Login</Link>
                            <Link to="/signup" style={styles.link}>Signup</Link>
                            <Link to="/drinks" style={styles.link}>Drinks</Link>
                        </>
                    )}
            </div>
          </div>
        </nav>
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
    logoutButton: {
        fontSize: "1rem",
        color: "white",
        textDecoration: "none",
        background: "none",
        border: "none",
        cursor: "pointer",
    }, 
  };

export default Navbar;  