import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

const UserDashboard = () => {
  return (

    <div className="dashboard-layout">
      <Navbar />
      <Sidebar role="user" />

      <div className="content">
        <h1>User Dashboard</h1>
        <p>Welcome to your dashboard.</p>
      </div>
    </div>
  );
};

export default UserDashboard;