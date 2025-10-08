// File: components/BMICalculator.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type HistoryItem = { date: string; bmi: number; weight: number; height: number; age: number; gender: string };

export default function BMICalculator() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // preserve when coming back
  const [gender, setGender] = useState<string>(searchParams.get("gender") || "male");
  const [age, setAge] = useState<number>(Number(searchParams.get("age") || 25));
  const [height, setHeight] = useState<number>(Number(searchParams.get("height") || 170));
  const [weight, setWeight] = useState<number>(Number(searchParams.get("weight") || 70));
  const [units, setUnits] = useState<"metric" | "imperial">("metric");

  const [bmi, setBmi] = useState<number>(0);
  const [status, setStatus] = useState<string>("");
  const [color, setColor] = useState<string>("text-gray-400");
  const [error, setError] = useState<string>("");
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // load history from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("bmi_history");
      if (raw) setHistory(JSON.parse(raw));
    } catch (e) {
      console.warn("failed to parse history", e);
    }
  }, []);

  // compute BMI
  useEffect(() => {
    setError("");
    // basic validation
    if (age <= 0 || height <= 0 || weight <= 0) {
      setBmi(0);
      setStatus("");
      setColor("text-gray-400");
      return;
    }

    let hMeters = height / 100; // default metric
    let wKg = weight;

    if (units === "imperial") {
      // height stored as inches, weight as lbs
      hMeters = (height * 0.0254);
      wKg = weight * 0.45359237;
    }

    if (isNaN(hMeters) || isNaN(wKg) || hMeters <= 0) {
      setError("Please enter valid numeric values.");
      return;
    }

    const bmiValue = Number((wKg / (hMeters * hMeters)).toFixed(1));
    setBmi(bmiValue);

    if (bmiValue < 18.5) {
      setStatus("Underweight");
      setColor("text-blue-400");
    } else if (bmiValue < 25) {
      setStatus("Normal weight");
      setColor("text-green-500");
    } else if (bmiValue < 30) {
      setStatus("Overweight");
      setColor("text-yellow-400");
    } else {
      setStatus("Obese");
      setColor("text-red-500");
    }
  }, [height, weight, age, gender, units]);

  // save to history
  const saveToHistory = () => {
    if (!bmi || bmi === 0) return;
    const item: HistoryItem = {
      date: new Date().toISOString(),
      bmi,
      weight,
      height,
      age,
      gender,
    };
    const next = [...history, item].slice(-30); // keep last 30
    setHistory(next);
    localStorage.setItem("bmi_history", JSON.stringify(next));
  };

  const clearHistory = () => {
    localStorage.removeItem("bmi_history");
    setHistory([]);
  };

  const getArrowRotation = () => {
    if (!bmi || bmi === 0) return -90; // neutral
    const angle = (bmi / 40) * 180 - 90;
    return Math.min(Math.max(angle, -90), 90);
  };

  const goToMealPlan = () => {
    if (!bmi || bmi === 0) {
      setError("Calculate a valid BMI before continuing.");
      return;
    }
    const params = new URLSearchParams({ bmi: bmi.toString(), gender, age: age.toString(), height: height.toString(), weight: weight.toString(), status });
    router.push(`/meal-plan?${params.toString()}`);
  };

  const toggleUnits = () => {
    if (units === "metric") {
      // convert metric -> imperial (cm -> inches, kg -> lbs)
      setHeight(Number((height / 2.54).toFixed(1)));
      setWeight(Number((weight * 2.2046226218).toFixed(1)));
      setUnits("imperial");
    } else {
      setHeight(Number((height * 2.54).toFixed(0)));
      setWeight(Number((weight / 2.2046226218).toFixed(1)));
      setUnits("metric");
    }
  };

  // chart data from history
  const chartData = history.map((h) => ({ date: new Date(h.date).toLocaleDateString(), bmi: h.bmi }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-6 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* LEFT: Gauge & summary */}
        <div className="col-span-1 flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold mb-2 text-green-600">BMI Calculator</h2>
          <p className="text-gray-600 mb-4">Calculate BMI, save history, and get a personalized meal plan.</p>

          <div className={`relative w-44 h-24 mx-auto ${color}`}>
            <div className="w-44 h-24 rounded-t-full border-8 border-b-0 border-current"></div>
            <div className="absolute bottom-0 left-1/2 w-1 h-24 bg-gray-700 origin-bottom" style={{ transform: `rotate(${getArrowRotation()}deg)` }}></div>
          </div>

          <p className="text-3xl font-bold mt-4">BMI: {bmi || "--"}</p>
          <p className="text-lg text-gray-700">{status || "--"}</p>
          <p className="text-sm text-gray-500 capitalize">{gender} • {age} yrs</p>

          <div className="flex gap-3 mt-4">
            <button onClick={saveToHistory} className="px-4 py-2 bg-blue-500 text-white rounded-md shadow">Save</button>
            <button onClick={goToMealPlan} className="px-4 py-2 bg-green-500 text-white rounded-md shadow">Get Meal Plan</button>
            <button onClick={clearHistory} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md">Clear</button>
          </div>

          {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
        </div>

        {/* MIDDLE: Controls */}
        <div className="col-span-1 md:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <label className="font-medium">Units</label>
            <button onClick={toggleUnits} className="px-3 py-1 bg-gray-100 rounded">{units === "metric" ? "Metric" : "Imperial"}</button>
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Gender</label>
            <div className="flex gap-3">
              {(["male", "female"] as const).map((g) => (
                <button key={g} onClick={() => setGender(g)} className={`px-4 py-2 rounded-lg ${gender === g ? "bg-blue-500 text-white" : "bg-gray-100"}`}>{g[0].toUpperCase()+g.slice(1)}</button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="block mb-1 font-medium">Age: {age} yrs</label>
            <input type="range" min={1} max={120} value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full" />
            <input type="number" min={1} max={120} value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full mt-2 p-2 border rounded" />
          </div>

          <div className="mb-3">
            <label className="block mb-1 font-medium">Height: {height} {units === 'metric' ? 'cm' : 'in'}</label>
            <input type="range" min={30} max={220} value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full" />
            <input type="number" min={30} max={220} value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full mt-2 p-2 border rounded" />
          </div>

          <div className="mb-3">
            <label className="block mb-1 font-medium">Weight: {weight} {units === 'metric' ? 'kg' : 'lbs'}</label>
            <input type="range" min={10} max={400} value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full" />
            <input type="number" min={10} max={400} value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full mt-2 p-2 border rounded" />
          </div>
        </div>

        {/* RIGHT: History & Chart */}
        <div className="col-span-1">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">BMI History</h3>
              <button onClick={() => { navigator.clipboard?.writeText(JSON.stringify(history)); }} className="text-sm text-gray-500 hover:underline">Copy JSON</button>
            </div>
            <div className="mt-2 p-2 border rounded bg-gray-50 h-48">
              {history.length === 0 ? (
                <p className="text-sm text-gray-500">No history yet. Save your BMI.</p>
              ) : (
                <ul className="text-sm text-gray-700 space-y-1 overflow-auto h-40">
                  {history.slice().reverse().map((h, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{new Date(h.date).toLocaleString()}:</span>
                      <span className="font-semibold">{h.bmi}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="h-36">
            {chartData.length === 0 ? (
              <p className="text-sm text-gray-500">Chart will show after you save history.</p>
            ) : (
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={chartData}>
                  <XAxis dataKey="date" />
                  <YAxis domain={[10, 40]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="bmi" stroke="#4ade80" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
