import { Link } from "react-router-dom";

const Sidebar = ({ role }) => {
    return (
        <div className="sidebar">
            <h2>Dashboard</h2>

            {role === "admin" && (
                <>
                    <Link to="/admin/dashboard">Dashboard</Link>
                    <Link to="/admin/users">User Management</Link>
                    <Link to="/admin/tasks">Task Monitoring</Link>
                    <Link to="/admin/logs">Activity Logs</Link>
                    <Link to="/admin/analytics">Analytics</Link>
                </>
            )}
            {role === "user" && (
                <>
                    <Link to="/user/dashboard">User Dashboard</Link>
                    <Link to="/user/tasks">My Tasks</Link>
                </>
            )}
        </div>
    );
};

export default Sidebar;