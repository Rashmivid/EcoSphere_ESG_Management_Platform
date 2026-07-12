import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", full_name: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-eco-50">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-eco-900 mb-1">🌍 Join EcoSphere</h1>
        <p className="text-sm text-gray-500 mb-6">New accounts are created as Employee.</p>
        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-2 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Full name</label>
            <input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-eco-500"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-eco-500"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-eco-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-eco-600 hover:bg-eco-700 text-white rounded-lg py-2 text-sm font-semibold transition disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-4">
          Already have an account? <Link to="/login" className="text-eco-600 font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}
