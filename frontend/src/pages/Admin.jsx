import { useEffect, useState } from "react";
import api from "../api/client";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

export default function Admin() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [config, setConfig] = useState(null);
  const [deptForm, setDeptForm] = useState({ name: "", code: "" });

  const load = async () => {
    const [d, c] = await Promise.all([
      api.get("/org/departments"),
      api.get("/scoring/config"),
    ]);
    setDepartments(d.data);
    setConfig(c.data);
  };

  useEffect(() => {
    load();
  }, []);

  if (user && user.role !== "admin") {
    return (
      <Layout>
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-600">Admin settings are only visible to Admin users.</p>
        </div>
      </Layout>
    );
  }

  const createDept = async (e) => {
    e.preventDefault();
    await api.post("/org/departments", deptForm);
    setDeptForm({ name: "", code: "" });
    load();
  };

  const updateWeights = async (e) => {
    e.preventDefault();
    await api.put("/scoring/config", {
      environmental_weight: Number(config.environmental_weight),
      social_weight: Number(config.social_weight),
      governance_weight: Number(config.governance_weight),
      auto_emission_calculation: config.auto_emission_calculation,
      evidence_requirement: config.evidence_requirement,
      badge_auto_award: config.badge_auto_award,
    });
    alert("ESG configuration updated");
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">⚙️ Admin Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Departments</h2>
          <ul className="text-sm space-y-1 mb-4">
            {departments.map((d) => (
              <li key={d.id} className="flex justify-between border-b py-1">
                <span>{d.name} ({d.code})</span>
                <span className="text-gray-400">{d.employee_count} employees</span>
              </li>
            ))}
          </ul>
          <form onSubmit={createDept} className="flex gap-2">
            <input
              placeholder="Name"
              value={deptForm.name}
              onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm flex-1"
              required
            />
            <input
              placeholder="Code"
              value={deptForm.code}
              onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm w-28"
              required
            />
            <button className="bg-eco-600 hover:bg-eco-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
              Add
            </button>
          </form>
        </div>

        {config && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold text-gray-700 mb-4">ESG Configuration & Business Rules</h2>
            <form onSubmit={updateWeights} className="space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <label className="flex flex-col">
                  Environmental weight
                  <input type="number" step="0.05" value={config.environmental_weight}
                    onChange={(e) => setConfig({ ...config, environmental_weight: e.target.value })}
                    className="border rounded-lg px-2 py-1 mt-1" />
                </label>
                <label className="flex flex-col">
                  Social weight
                  <input type="number" step="0.05" value={config.social_weight}
                    onChange={(e) => setConfig({ ...config, social_weight: e.target.value })}
                    className="border rounded-lg px-2 py-1 mt-1" />
                </label>
                <label className="flex flex-col">
                  Governance weight
                  <input type="number" step="0.05" value={config.governance_weight}
                    onChange={(e) => setConfig({ ...config, governance_weight: e.target.value })}
                    className="border rounded-lg px-2 py-1 mt-1" />
                </label>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.auto_emission_calculation}
                  onChange={(e) => setConfig({ ...config, auto_emission_calculation: e.target.checked })} />
                Auto Emission Calculation
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.evidence_requirement}
                  onChange={(e) => setConfig({ ...config, evidence_requirement: e.target.checked })} />
                Evidence Requirement (CSR/Challenge approvals)
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.badge_auto_award}
                  onChange={(e) => setConfig({ ...config, badge_auto_award: e.target.checked })} />
                Badge Auto-Award
              </label>
              <button className="bg-eco-600 hover:bg-eco-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
                Save Configuration
              </button>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}
