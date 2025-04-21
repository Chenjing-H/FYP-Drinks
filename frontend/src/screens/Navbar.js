import { Outlet } from "react-router";
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
      <div style={styles.container}>
        <nav style={styles.navbar}>
            <div style={styles.topBar}>
                <Link to="/" style={styles.logo} className="logo">MagicalMix</Link>
                <div style={styles.navbarLink}>
                    {user ? (
                        <>
                            <button onClick={handleLogout} style={styles.logoutButton}>Log out</button>
                        </>
                    ) : (
                        <> </>
                    )}
            </div>
          </div>
        </nav>

        {/* Main content */}
        <div style={styles.main}>
          <Outlet />
        </div>

        {/* Bottom Navigation */}
        <footer style={styles.bottomBar}>
          <button style={styles.tab} onClick={() => navigate("/")}>Main</button>
          <button style={styles.tab} onClick={() => navigate("/profile")}>Profile</button>
          <button style={styles.tab} onClick={() => navigate("/drinks")}>Drinks</button>
        </footer>
      </div>
    );
}

const styles = {
  container: {
    minHeight: "100%",
    display: "flex",
    flexDirection: "column",
  },
  navbar: {
    width: "100%",
    backgroundColor: "white", 
    padding: "15px",
    boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
    position: "fixed",
    top: 0,
    left: 0, 
    zIndex: 1000,
  },
  topBar: {
    maxWidth: "100%",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 20px",    
  },
  main: {
    flexGrow: 1,
    top: 0,
    marginBottom: "5%",
  },
  bottomBar: {
    backgroundColor: "white",
    padding: "15px",
    display: "flex",
    justifyContent: "space-around",
    position: "fixed",
    width: "100%",
    boxShadow: "0 -4px 6px rgba(0,0,0,0.1)",
    left: 0,
    bottom: 0,
    zIndex: 1000,
  },
  logo: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#0275e6",
    textDecoration: "none",
    marginLeft: "40%",
  },
  navbarLink: {
    display: "flex",
    gap: "20px",
  },
  link: {
    fontSize: "1rem",
    textDecoration: "none",
    marginRight: "15px",
    color: "#194f85",
  },
  logoutButton: {
      fontSize: "1rem",
      textDecoration: "none",
      background: "none",
      border: "none",
      cursor: "pointer",
      marginRight: "15px",
  }, 
  tab: {
    background: "none",
    border: "none",
    fontWeight: "bold",
    fontSize: "1rem",
    cursor: "pointer",
  },
};

export default Navbar;  