import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE = "https://dairydirect-1.onrender.com";

function AdminDashboard() {
  const [customers, setCustomers] = useState([]);
  const [deliveryData, setDeliveryData] = useState(null);
  const [customerSummary, setCustomerSummary] = useState([]);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/customers`, { headers });
      setCustomers(res.data || []);
    } catch {
      alert("Failed to fetch customers");
    }
  };

  const fetchTodayDelivery = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/today-delivery`, { headers });
      setDeliveryData(res.data);
    } catch {
      alert("Failed to fetch delivery");
    }
  };

  const fetchCustomerSummary = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/customer-summary`, { headers });
      setCustomerSummary(res.data || []);
    } catch {
      alert("Failed to fetch summary");
    }
  };

  const handleMarkPaid = async (id) => {
    await axios.put(`${API_BASE}/api/admin/mark-paid/${id}`, {}, { headers });
    fetchTodayDelivery();
    fetchCustomerSummary();
  };

  const handleMarkPending = async (id) => {
    await axios.put(`${API_BASE}/api/admin/mark-pending/${id}`, {}, { headers });
    fetchTodayDelivery();
    fetchCustomerSummary();
  };

  const handleChangeDeliveryStatus = async (id, status) => {
    await axios.put(
      `${API_BASE}/api/admin/update-delivery-status/${id}`,
      { deliveryStatus: status },
      { headers }
    );
    fetchTodayDelivery();
  };

  useEffect(() => {
    fetchCustomers();
    fetchTodayDelivery();
    fetchCustomerSummary();
  }, []);

  return (
    <div className="page">
      <div className="container">

        {/* HEADER */}
        <div className="topbar">
          <h1 className="title">Admin Dashboard</h1>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* STATS */}
        {deliveryData && (
          <div className="stats">
            <div className="stat-box">
              <h3>Total Customers</h3>
              <p>{deliveryData.totalCustomers || 0}</p>
            </div>
            <div className="stat-box">
              <h3>Total Liters</h3>
              <p>{deliveryData.totalLiters || 0}</p>
            </div>
            <div className="stat-box">
              <h3>Total Amount</h3>
              <p>₹{deliveryData.totalAmount || 0}</p>
            </div>
          </div>
        )}

        {/* TODAY DELIVERY */}
        <div className="card">
          <h2>Today Delivery</h2>

          {deliveryData?.deliveries?.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Liters</th>
                  <th>Total</th>
                  <th>Delivery</th>
                  <th>Payment</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {deliveryData.deliveries.map((item) => (
                  <tr key={item._id}>
                    <td>{item.customerId?.name}</td>
                    <td>{item.litersDelivered}</td>
                    <td>₹{item.totalAmount}</td>

                    <td>
                      <select
                        value={item.deliveryStatus}
                        onChange={(e) =>
                          handleChangeDeliveryStatus(item._id, e.target.value)
                        }
                      >
                        <option>Delivered</option>
                        <option>Skipped</option>
                      </select>
                    </td>

                    <td>{item.paymentStatus}</td>

                    <td>
                      <button onClick={() => handleMarkPaid(item._id)}>
                        Paid
                      </button>
                      <button onClick={() => handleMarkPending(item._id)}>
                        Pending
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <span className="badge badge-skipped">
              No Delivery Today
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;