import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://dairydirect-1.onrender.com";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [address, setAddress] = useState("");
  const [dailyLiters, setDailyLiters] = useState(1);
  const [pricePerLiter, setPricePerLiter] = useState(60);

  const [monthlyDues, setMonthlyDues] = useState(0);
  const [monthlyBill, setMonthlyBill] = useState(null);
  const [history, setHistory] = useState([]);

  const [skippedDates, setSkippedDates] = useState([]);
  const [newSkipDate, setNewSkipDate] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const fetchProfile = async () => {
    const res = await axios.get(`${API_BASE}/api/user/profile`, {
      headers,
    });

    setUser(res.data);
    setAddress(res.data.address || "");
    setDailyLiters(res.data.dailyLiters || 1);
    setPricePerLiter(res.data.pricePerLiter || 60);
    setSkippedDates(res.data.skippedDates || []);
  };

  const fetchMonthlyDues = async () => {
    const res = await axios.get(`${API_BASE}/api/daily-log/monthly-dues`, {
      headers,
    });

    setMonthlyDues(res.data.totalDues);
  };

  const fetchMonthlyBill = async () => {
    const res = await axios.get(`${API_BASE}/api/daily-log/monthly-bill`, {
      headers,
    });

    setMonthlyBill(res.data);
  };

  const fetchHistory = async () => {
    const res = await axios.get(`${API_BASE}/api/daily-log/my-history`, {
      headers,
    });

    setHistory(res.data);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchProfile();
        await fetchMonthlyDues();
        await fetchMonthlyBill();
        await fetchHistory();
      } catch (error) {
        console.log(error);
        alert("Failed to load dashboard");
      }
    };

    loadData();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdate = async () => {
    try {
      const res = await axios.put(
        `${API_BASE}/api/user/update`,
        {
          address,
          dailyLiters: Number(dailyLiters),
          pricePerLiter: Number(pricePerLiter),
          skippedDates,
        },
        { headers }
      );

      setUser(res.data.user);
      setSkippedDates(res.data.user.skippedDates || []);

      await fetchMonthlyBill();
      await fetchHistory();

      alert("Profile updated successfully");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Update failed");
    }
  };

  const handleAddSkipDate = () => {
    if (!newSkipDate) {
      alert("Please select a date");
      return;
    }

    if (skippedDates.includes(newSkipDate)) {
      alert("Date already added");
      return;
    }

    setSkippedDates([...skippedDates, newSkipDate]);
    setNewSkipDate("");
  };

  const handleRemoveSkipDate = (dateToRemove) => {
    const updatedDates = skippedDates.filter((date) => date !== dateToRemove);
    setSkippedDates(updatedDates);
  };

  return (
    <div className="page">
      <div className="container">
        <div className="topbar">
          <h1 className="title">Customer Dashboard</h1>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {user ? (
          <>
            <div className="stats">
              <div className="stat-box">
                <h3>Monthly Total</h3>
                <p>₹{monthlyBill?.totalAmount || 0}</p>
              </div>

              <div className="stat-box">
                <h3>Paid Amount</h3>
                <p>₹{monthlyBill?.paidAmount || 0}</p>
              </div>

              <div className="stat-box">
                <h3>Pending Amount</h3>
                <p>₹{monthlyBill?.pendingAmount || 0}</p>
              </div>

              <div className="stat-box">
                <h3>Total Liters</h3>
                <p>{monthlyBill?.totalLiters || 0} L</p>
              </div>
            </div>

            <div className="grid grid-2 section-space">
              <div className="card">
                <h2>Profile</h2>

                <div className="info-row">
                  <span className="label">Name:</span> {user.name}
                </div>
                <div className="info-row">
                  <span className="label">Phone:</span> {user.phone}
                </div>
                <div className="info-row">
                  <span className="label">Role:</span> {user.role}
                </div>

                <label>Address</label>
                <input
                  className="input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />

                <label>Daily Liters</label>
                <input
                  className="input"
                  type="number"
                  value={dailyLiters}
                  onChange={(e) => setDailyLiters(e.target.value)}
                />

                <label>Price Per Liter</label>
                <input
                  className="input"
                  type="number"
                  value={pricePerLiter}
                  onChange={(e) => setPricePerLiter(e.target.value)}
                />

                <button className="btn btn-primary" onClick={handleUpdate}>
                  Save Changes
                </button>
              </div>

              <div className="card">
                <h2>Skip Delivery Dates</h2>

                <input
                  className="date-input"
                  type="date"
                  value={newSkipDate}
                  onChange={(e) => setNewSkipDate(e.target.value)}
                />

                <button className="btn btn-primary" onClick={handleAddSkipDate}>
                  Add Skip Date
                </button>

                <div className="section-space">
                  {skippedDates.length > 0 ? (
                    <ul className="list">
                      {skippedDates.map((date) => (
                        <li key={date}>
                          {date}{" "}
                          <button
                            className="btn btn-danger btn-small"
                            onClick={() => handleRemoveSkipDate(date)}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No skipped dates added</p>
                  )}
                </div>

                <div className="section-space">
                  <button className="btn btn-secondary" onClick={handleUpdate}>
                    Save Skip Dates
                  </button>
                </div>
              </div>
            </div>

            <div className="card section-space">
              <h2>Monthly Bill Summary</h2>

              {monthlyBill ? (
                <>
                  <div className="info-row">
                    <span className="label">Month:</span> {monthlyBill.month}
                  </div>
                  <div className="info-row">
                    <span className="label">Total Delivery Days:</span>{" "}
                    {monthlyBill.totalDays}
                  </div>
                  <div className="info-row">
                    <span className="label">Total Liters:</span>{" "}
                    {monthlyBill.totalLiters}
                  </div>
                  <div className="info-row">
                    <span className="label">Total Amount:</span> ₹
                    {monthlyBill.totalAmount}
                  </div>
                  <div className="info-row">
                    <span className="label">Paid Amount:</span> ₹
                    {monthlyBill.paidAmount}
                  </div>
                  <div className="info-row">
                    <span className="label">Pending Amount:</span> ₹
                    {monthlyBill.pendingAmount}
                  </div>
                </>
              ) : (
                <p>Loading monthly bill...</p>
              )}
            </div>

            <div className="card section-space">
              <h2>Monthly Dues</h2>
              <p>
                <strong>Total Pending Amount:</strong> ₹{monthlyDues}
              </p>
            </div>

            <div className="card section-space">
              <h2>Delivery History</h2>

              <div className="table-wrapper">
                {history.length > 0 ? (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Liters</th>
                        <th>Price/Liter</th>
                        <th>Total</th>
                        <th>Delivery</th>
                        <th>Payment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((log) => (
                        <tr key={log._id}>
                          <td>{log.date}</td>
                          <td>{log.litersDelivered}</td>
                          <td>₹{log.pricePerLiter}</td>
                          <td>₹{log.totalAmount}</td>
                          <td>
                            <span
                              className={
                                log.deliveryStatus === "Skipped"
                                  ? "badge badge-skipped"
                                  : log.deliveryStatus === "Out for Delivery"
                                  ? "badge badge-delivered"
                                  : "badge badge-delivered"
                              }
                            >
                              {log.deliveryStatus}
                            </span>
                          </td>
                          <td>
                            <span
                              className={
                                log.paymentStatus === "Paid"
                                  ? "badge badge-paid"
                                  : "badge badge-pending"
                              }
                            >
                              {log.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No history found</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;