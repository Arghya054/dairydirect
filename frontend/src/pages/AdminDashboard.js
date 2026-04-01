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
    const res = await axios.get(`${API_BASE}/api/admin/customers`, {
      headers,
    });
    setCustomers(res.data);
  };

  const fetchTodayDelivery = async () => {
    const res = await axios.get(`${API_BASE}/api/admin/today-delivery`, {
      headers,
    });
    setDeliveryData(res.data);
  };

  const fetchCustomerSummary = async () => {
    const res = await axios.get(`${API_BASE}/api/admin/customer-summary`, {
      headers,
    });
    setCustomerSummary(res.data);
  };

  const handleMarkPaid = async (logId) => {
    try {
      await axios.put(
        `${API_BASE}/api/admin/mark-paid/${logId}`,
        {},
        { headers }
      );

      await fetchTodayDelivery();
      await fetchCustomerSummary();
      alert("Payment marked as paid");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to mark paid");
    }
  };

  const handleMarkPending = async (logId) => {
    try {
      await axios.put(
        `${API_BASE}/api/admin/mark-pending/${logId}`,
        {},
        { headers }
      );

      await fetchTodayDelivery();
      await fetchCustomerSummary();
      alert("Payment marked as pending");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to mark pending");
    }
  };

  const handleChangeDeliveryStatus = async (logId, deliveryStatus) => {
    try {
      await axios.put(
        `${API_BASE}/api/admin/update-delivery-status/${logId}`,
        { deliveryStatus },
        { headers }
      );

      await fetchTodayDelivery();
      alert("Delivery status updated");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update delivery status");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchCustomers();
        await fetchTodayDelivery();
        await fetchCustomerSummary();
      } catch (error) {
        console.log(error);
        alert("Failed to load admin dashboard");
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moneyBarData = {
    labels: customerSummary.map((item) => item.name),
    datasets: [
      {
        label: "Total Money Bought",
        data: customerSummary.map((item) => item.totalAmount),
        backgroundColor: "#2563eb",
        borderRadius: 8,
      },
    ],
  };

  const litersBarData = {
    labels: customerSummary.map((item) => item.name),
    datasets: [
      {
        label: "Total Liters Bought",
        data: customerSummary.map((item) => item.totalLiters),
        backgroundColor: "#16a34a",
        borderRadius: 8,
      },
    ],
  };

  const paymentDoughnutData = {
    labels: ["Paid", "Pending"],
    datasets: [
      {
        data: [
          customerSummary.reduce((sum, item) => sum + item.totalPaid, 0),
          customerSummary.reduce((sum, item) => sum + item.totalPending, 0),
        ],
        backgroundColor: ["#22c55e", "#ef4444"],
        borderWidth: 0,
      },
    ],
  };

  const lineData = {
    labels: customerSummary.map((item) => item.name),
    datasets: [
      {
        label: "Service Days",
        data: customerSummary.map((item) => item.totalDays),
        borderColor: "#7c3aed",
        backgroundColor: "#7c3aed",
        tension: 0.3,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
    },
  };

  return (
    <div className="page">
      <div className="container">
        <div className="topbar">
          <h1 className="title">Admin Dashboard</h1>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {deliveryData && (
          <div className="stats">
            <div className="stat-box">
              <h3>Total Customers</h3>
              <p>{deliveryData.totalCustomers}</p>
            </div>
            <div className="stat-box">
              <h3>Total Liters</h3>
              <p>{deliveryData.totalLiters}</p>
            </div>
            <div className="stat-box">
              <h3>Total Amount</h3>
              <p>₹{deliveryData.totalAmount}</p>
            </div>
          </div>
        )}

        <div className="card section-space">
          <h2>Customer Purchase Summary</h2>
          <div className="table-wrapper">
            {customerSummary.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Total Liters</th>
                    <th>Total Bought</th>
                    <th>Paid</th>
                    <th>Pending</th>
                    <th>Days</th>
                  </tr>
                </thead>
                <tbody>
                  {customerSummary.map((item) => (
                    <tr key={item.customerId}>
                      <td>{item.name}</td>
                      <td>{item.phone}</td>
                      <td>{item.totalLiters}</td>
                      <td>₹{item.totalAmount}</td>
                      <td>₹{item.totalPaid}</td>
                      <td>₹{item.totalPending}</td>
                      <td>{item.totalDays}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No summary data found</p>
            )}
          </div>
        </div>

        <div className="grid grid-2 section-space">
          <div className="card">
            <h2>Money Bought by Customer</h2>
            <Bar data={moneyBarData} options={commonOptions} />
          </div>

          <div className="card">
            <h2>Liters Bought by Customer</h2>
            <Bar data={litersBarData} options={commonOptions} />
          </div>
        </div>

        <div className="grid grid-2 section-space">
          <div className="card">
            <h2>Paid vs Pending</h2>
            <Doughnut data={paymentDoughnutData} options={commonOptions} />
          </div>

          <div className="card">
            <h2>Service Days per Customer</h2>
            <Line data={lineData} options={commonOptions} />
          </div>
        </div>

        <div className="card section-space">
          <h2>Today Delivery Sheet</h2>

          {deliveryData ? (
            <div className="table-wrapper">
              {deliveryData.deliveries && deliveryData.deliveries.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Address</th>
                      <th>Date</th>
                      <th>Liters</th>
                      <th>Total</th>
                      <th>Delivery</th>
                      <th>Payment</th>
                      <th>Payment Actions</th>
                      <th>Delivery Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveryData.deliveries.map((item) => (
                      <tr key={item._id}>
                        <td>{item.customerId?.name}</td>
                        <td>{item.customerId?.phone}</td>
                        <td>{item.customerId?.address}</td>
                        <td>{item.date}</td>
                        <td>{item.litersDelivered}</td>
                        <td>₹{item.totalAmount}</td>
                        <td>
                          <span
                            className={
                              item.deliveryStatus === "Skipped"
                                ? "badge badge-skipped"
                                : "badge badge-delivered"
                            }
                          >
                            {item.deliveryStatus}
                          </span>
                        </td>
                        <td>
                          <span
                            className={
                              item.paymentStatus === "Paid"
                                ? "badge badge-paid"
                                : "badge badge-pending"
                            }
                          >
                            {item.paymentStatus}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <button
                              className="btn btn-primary btn-small"
                              onClick={() => handleMarkPaid(item._id)}
                            >
                              Mark Paid
                            </button>

                            <button
                              className="btn btn-secondary btn-small"
                              onClick={() => handleMarkPending(item._id)}
                            >
                              Mark Pending
                            </button>
                          </div>
                        </td>
                        <td>
                          <select
                            className="select"
                            value={item.deliveryStatus}
                            onChange={(e) =>
                              handleChangeDeliveryStatus(item._id, e.target.value)
                            }
                          >
                            <option value="Ordered">Ordered</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Skipped">Skipped</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>
                  <span className="badge badge-skipped">No Delivery Today</span>
                </p>
              )}
            </div>
          ) : (
            <p>Loading delivery data...</p>
          )}
        </div>

        <div className="card section-space">
          <h2>Skipped Customers Today</h2>

          {deliveryData?.skippedCustomers &&
          deliveryData.skippedCustomers.length > 0 ? (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Daily Liters</th>
                    <th>Price/Liter</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryData.skippedCustomers.map((customer) => (
                    <tr key={customer._id}>
                      <td>{customer.name}</td>
                      <td>{customer.phone}</td>
                      <td>{customer.address}</td>
                      <td>{customer.dailyLiters}</td>
                      <td>₹{customer.pricePerLiter}</td>
                      <td>
                        <span className="badge badge-skipped">Skipped</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>
              <span className="badge badge-delivered">
                No skipped customers for today
              </span>
            </p>
          )}
        </div>

        <div className="card section-space">
          <h2>All Customers</h2>
          <div className="table-wrapper">
            {customers.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Daily Liters</th>
                    <th>Price/Liter</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer._id}>
                      <td>{customer.name}</td>
                      <td>{customer.phone}</td>
                      <td>{customer.address}</td>
                      <td>{customer.dailyLiters}</td>
                      <td>₹{customer.pricePerLiter}</td>
                      <td>{customer.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No customers found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;