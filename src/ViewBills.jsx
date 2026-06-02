import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import "./ViewCustomer.css"; // Reusing existing styles

function ViewBills({ onNavigate, onLoadBill }) {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState("invoice_date");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    fetchBills();
  }, []);

  useEffect(() => {
    // Filter bills based on search term
    if (searchTerm.trim() === "") {
      setFilteredBills(bills);
    } else {
      const filtered = bills.filter(
        (bill) =>
          bill.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bill.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (bill.customer_gstin && bill.customer_gstin.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredBills(filtered);
    }
  }, [searchTerm, bills]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("vsrbills")
        .select("*")
        .order(sortField, { ascending: sortOrder === "asc" });

      if (error) {
        console.error("Supabase error:", error);
        alert("Error fetching bills: " + error.message);
      } else {
        setBills(data || []);
        setFilteredBills(data || []);
      }
    } catch (error) {
      console.error("Error fetching bills:", error);
      alert("Error fetching bills!");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle sort order
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    // Re-fetch with new sort
    setTimeout(() => fetchBills(), 0);
  };

  const handleDelete = async (id, invoiceNumber) => {
    if (window.confirm(`Are you sure you want to delete invoice ${invoiceNumber}?`)) {
      try {
        const { error } = await supabase
          .from("vsrbills")
          .delete()
          .eq("id", id);

        if (error) throw error;

        alert("Bill deleted successfully!");
        fetchBills(); // Refresh the list
      } catch (error) {
        console.error("Error deleting bill:", error);
        alert("Error deleting bill: " + error.message);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN");
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹0.00";
    return `₹${parseFloat(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="view-customer-container">
      <div className="header">
        <h2>View Bills / Invoices</h2>
        <button className="back-button" onClick={() => onNavigate("dashboard")}>
          ← Back to Dashboard
        </button>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search by Invoice Number, Customer Name, or GSTIN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button onClick={fetchBills} className="refresh-button">
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading bills...</div>
      ) : (
        <>
          <div className="table-info">
            Total Bills: <strong>{filteredBills.length}</strong>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort("invoice_number")} style={{ cursor: "pointer" }}>
                    Invoice Number {sortField === "invoice_number" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th onClick={() => handleSort("invoice_date")} style={{ cursor: "pointer" }}>
                    Date {sortField === "invoice_date" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th onClick={() => handleSort("customer_name")} style={{ cursor: "pointer" }}>
                    Customer {sortField === "customer_name" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th>GSTIN</th>
                  <th style={{ textAlign: "right" }}>Total Amount</th>
                  <th>Period</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>
                      No bills found
                    </td>
                  </tr>
                ) : (
                  filteredBills.map((bill) => (
                    <tr key={bill.id}>
                      <td>
                        <strong>{bill.invoice_number}</strong>
                      </td>
                      <td>{formatDate(bill.invoice_date)}</td>
                      <td>{bill.customer_name}</td>
                      <td>{bill.customer_gstin || "N/A"}</td>
                      <td style={{ textAlign: "right", fontWeight: "500" }}>
                        {formatCurrency(bill.total_after_tax)}
                      </td>
                      <td>
                        {bill.from_date && bill.to_date
                          ? `${formatDate(bill.from_date)} - ${formatDate(bill.to_date)}`
                          : "N/A"}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          onClick={() => {
                            if (onLoadBill) {
                              onLoadBill(bill.invoice_number);
                            } else {
                              alert("Load bill functionality not available");
                            }
                          }}
                          className="view-button"
                          style={{
                            padding: "5px 10px",
                            marginRight: "5px",
                            background: "#2196F3",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          📄 View
                        </button>
                        <button
                          onClick={() => handleDelete(bill.id, bill.invoice_number)}
                          className="delete-button"
                          style={{
                            padding: "5px 10px",
                            background: "#f44336",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default ViewBills;
