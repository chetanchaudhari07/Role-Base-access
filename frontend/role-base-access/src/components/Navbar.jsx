import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <h2>Role Based Access</h2>
      </div>

      <ul className="nav-links">
        {user?.role === "admin" && (
          <>
            <li>
              <Link to="/admin/dashboard">Dashboard</Link>
            </li>

            <li>
              <Link to="/admin/users">Users</Link>
            </li>

            <li>
              <Link to="/admin/tasks">Tasks</Link>
            </li>

            <li>
              <Link to="/admin/logs">Logs</Link>
            </li>

            <li>
              <Link to="/admin/analytics">Analytics</Link>
            </li>
          </>
        )}

        {user?.role === "user" && (
          <>
            <li>
              <Link to="/user/dashboard">Dashboard</Link>
            </li>

            <li>
              <Link to="/user/tasks">My Tasks</Link>
            </li>
          </>
        )}
      </ul>

      <div className="nav-right">
        <span>{user?.email}</span>

        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;