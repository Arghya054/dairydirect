import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";



const API_BASE = "https://dairydirect-1.onrender.com";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [monthlyBill, setMonthlyBill] = useState(null);
  //const [monthlyDues, setMonthlyDues] = useState(0);
  const [history, setHistory] = useState([]);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const fetchAll = async () => {
    try {
      const profile = await axios.get(`${API_BASE}/api/user/profile`, { headers });
      const bill = await axios.get(`${API_BASE}/api/daily-log/monthly-bill`, { headers });
      //const dues = await axios.get(`${API_BASE}/api/daily-log/monthly-dues`, { headers });
      const historyRes = await axios.get(`${API_BASE}/api/daily-log/my-history`, { headers });

      setUser(profile.data);
      setMonthlyBill(bill.data);
      //setMonthlyDues(dues.data.totalDues);
      setHistory(historyRes.data);
    } catch {
      alert("Error loading dashboard");
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="page">
      <div className="container">

        <div className="topbar">
          <h1>Customer Dashboard</h1>
          <button onClick={handleLogout}>Logout</button>
        </div>

        {user && (
          <>
            <div className="stats">
              <div>₹{monthlyBill?.totalAmount || 0}</div>
              <div>Paid ₹{monthlyBill?.paidAmount || 0}</div>
              <div>Pending ₹{monthlyBill?.pendingAmount || 0}</div>
            </div>

            <div className="card">
              <h2>Delivery History</h2>

              {history.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Liters</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((log) => (
                      <tr key={log._id}>
                        <td>{log.date}</td>
                        <td>{log.litersDelivered}</td>
                        <td>₹{log.totalAmount}</td>
                        <td>{log.paymentStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No history</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;