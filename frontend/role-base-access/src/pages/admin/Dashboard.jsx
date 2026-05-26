import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

const Dashboard = () => {
  return (
    <div className="dashboard-layout">
      <Navbar />
      <Sidebar role="admin" />

      <div className="content">
        <h1>Admin Dashboard</h1>

      </div>
    </div>
  );
};

export default Dashboard;