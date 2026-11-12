
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import "./App.css";

const API_URL = "http://localhost:8080/api/expenses";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "Food",
    date: new Date().toISOString().slice(0, 10),
    description: "",
  });

  const fetchExpenses = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Could not load expenses");

      const data = await response.json();
      setExpenses(data);
      setError("");
    } catch (err) {
      setError("Cannot connect to backend. Please check Spring Boot.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addExpense = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
        }),
      });

      if (!response.ok) throw new Error("Unable to add expense");

      setForm({
        title: "",
        amount: "",
        category: "Food",
        date: new Date().toISOString().slice(0, 10),
        description: "",
      });

      await fetchExpenses();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteExpense = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Unable to delete expense");

      await fetchExpenses();
    } catch (err) {
      setError(err.message);
    }
  };

  const total = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );
  const categoryData = Object.values(
  expenses.reduce((result, expense) => {
    const category = expense.category || "Other";

    if (!result[category]) {
      result[category] = {
        name: category,
        value: 0,
      };
    }

    result[category].value += Number(expense.amount || 0);

    return result;
  }, {})
);
const monthlyData = Object.values(
  expenses.reduce((result, expense) => {
    if (!expense.date) return result;

    const month = expense.date.slice(0, 7);

    if (!result[month]) {
      result[month] = {
        month,
        total: 0,
      };
    }

    result[month].total += Number(expense.amount || 0);

    return result;
  }, {})
).sort((a, b) => a.month.localeCompare(b.month));

  const currency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">₹ ExpenseFlow</div>
        <p className="nav-label">MENU</p>
        <div className="nav-item active">▦ Dashboard</div>
        <div className="nav-item">↗ Transactions</div>
        <div className="nav-item">▤ Reports</div>
        <div className="sidebar-bottom">Personal Finance Tracker</div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">PERSONAL FINANCE</p>
            <h1>Dashboard</h1>
            <p className="subtitle">
              Track your spending and manage your money.
            </p>
          </div>
          <div className="profile">PG</div>
        </header>

        {error && <div className="error">{error}</div>}

        <section className="summary-grid">
          <div className="summary-card">
            <p>Total Expenses</p>
            <h2>{currency(total)}</h2>
            <span>All recorded spending</span>
          </div>

          <div className="summary-card">
            <p>Total Transactions</p>
            <h2>{expenses.length}</h2>
            <span>Expenses recorded</span>
          </div>

          <div className="summary-card">
            <p>Average Expense</p>
            <h2>
              {currency(expenses.length ? total / expenses.length : 0)}
            </h2>
            <span>Per transaction</span>
          </div>
        </section>
        <section className="panel chart-panel">
  <h2>Category-wise Expenses</h2>
  <p className="panel-subtitle">
    See how your money is distributed across categories.
  </p>

  {categoryData.length === 0 ? (
    <p className="empty">No expense data available yet.</p>
  ) : (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={categoryData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {categoryData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={[
                "#315b9b",
                "#16a36a",
                "#f0a43c",
                "#d75b76",
                "#8064c8",
                "#27a5a5",
                "#8995aa",
              ][index % 7]}
            />
          ))}
        </Pie>

        <Tooltip formatter={(value) => `₹${value}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )}
</section>
<section className="panel chart-panel">
  <h2>Monthly Expense Report</h2>
  <p className="panel-subtitle">
    Compare your spending month by month.
  </p>

  {monthlyData.length === 0 ? (
    <p className="empty">No monthly data available yet.</p>
  ) : (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={monthlyData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value) => `₹${value}`} />
        <Legend />
        <Bar
          dataKey="total"
          name="Total Expenses"
          fill="#315b9b"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )}
</section>

        <section className="content-grid">
          <div className="panel">
            <h2>Add New Expense</h2>
            <p className="panel-subtitle">
              Enter the details of your spending.
            </p>

            <form onSubmit={addExpense}>
              <label>Expense Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Shopping"
                required
              />

              <label>Amount (₹)</label>
              <input
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                required
              />

              <label>Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option>Food</option>
                <option>Travel</option>
                <option>Shopping</option>
                <option>Education</option>
                <option>Entertainment</option>
                <option>Health</option>
                <option>Other</option>
              </select>

              <label>Date</label>
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                required
              />

              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Add a short note..."
              />

              <button type="submit" className="add-button">
                + Add Expense
              </button>
            </form>
          </div>

          <div className="panel">
            <div className="history-heading">
              <div>
                <h2>Recent Expenses</h2>
                <p className="panel-subtitle">
                  Your recorded transactions.
                </p>
              </div>
              <span className="count">{expenses.length} records</span>
            </div>

            {loading ? (
              <p className="empty">Loading expenses...</p>
            ) : expenses.length === 0 ? (
              <p className="empty">No expenses found. Add your first one!</p>
            ) : (
              <div className="expense-list">
                {expenses.map((expense) => (
                  <div className="expense-item" key={expense.id}>
                    <div className="expense-icon">₹</div>
                    <div className="expense-details">
                      <strong>{expense.title}</strong>
                      <span>
                        {expense.category} · {expense.date}
                      </span>
                    </div>
                    <div className="expense-right">
                      <strong>{currency(expense.amount)}</strong>
                      <button
                        className="delete-button"
                        onClick={() => deleteExpense(expense.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
