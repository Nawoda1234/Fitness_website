// File: app/meal-plan/page.tsx (or components/MealPlan.tsx)
"use client";
import React, { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface MealItem { name: string; kcal: number; }
interface Plan { meals: Record<string, MealItem[]>; tips: string[]; exercises: string[]; }

export default function MealPlan() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const bmi = Number(searchParams.get("bmi") || 0);
  const gender = searchParams.get("gender") || "male";
  const age = Number(searchParams.get("age") || 25);
  const statusFromParam = searchParams.get("status") || "";

  let status = statusFromParam;
  if (!status) {
    if (bmi < 18.5) status = "Underweight";
    else if (bmi < 25) status = "Normal weight";
    else if (bmi < 30) status = "Overweight";
    else status = "Obese";
  }

  const mealPlans: Record<string, Plan> = {
    Underweight: {
      meals: {
        Breakfast: [ { name: "Oats with whole milk + banana + nuts", kcal: 350 }, { name: "2 boiled eggs or omelette with cheese", kcal: 200 } ],
        Lunch: [ { name: "Rice or pasta + chicken/fish curry", kcal: 500 }, { name: "Cooked vegetables + dhal", kcal: 150 } ],
        Dinner: [ { name: "Chapati/rice + curry with lean meat/fish", kcal: 450 }, { name: "1 glass milk", kcal: 120 } ],
        Snacks: [ { name: "Peanut butter sandwich", kcal: 250 }, { name: "Fruit smoothie with yogurt", kcal: 200 }, { name: "Handful of nuts/dried fruit", kcal: 180 } ],
      },
      tips: [ "Eat calorie-dense healthy foods (nuts, milk, cheese, avocados)", "Include protein in every meal", "Eat 5–6 meals daily, don’t skip meals", "Gradually increase portion sizes" ],
      exercises: [ "Progressive resistance training (weights, 3x/week)", "Short cardio (10–20 min) only for fitness", "Yoga & stretching for flexibility" ],
    },
    "Normal weight": {
      meals: {
        Breakfast: [ { name: "2 eggs + wholegrain toast + fruit", kcal: 300 }, { name: "Oatmeal with milk + berries", kcal: 250 } ],
        Lunch: [ { name: "Wholegrain rice/roti + lean protein", kcal: 400 }, { name: "Large vegetable salad", kcal: 120 } ],
        Dinner: [ { name: "Grilled fish/chicken/tofu + salad", kcal: 350 }, { name: "Small portion of carbs", kcal: 100 } ],
        Snacks: [ { name: "Fruit + Greek yogurt", kcal: 150 }, { name: "Handful of nuts", kcal: 100 } ],
      },
      tips: [ "Maintain balanced diet with carbs, protein, and healthy fats", "Stay hydrated (2–3L water/day)", "Practice portion control (plate method)", "Consistent eating schedule" ],
      exercises: [ "Jogging/brisk walk 30 min, 3–4x/week", "Strength training 2–3x/week", "Yoga or mobility workouts" ],
    },
    Overweight: {
      meals: {
        Breakfast: [ { name: "Vegetable omelette (2 eggs + spinach/tomato)", kcal: 200 }, { name: "Green tea", kcal: 0 } ],
        Lunch: [ { name: "Grilled chicken salad with olive oil", kcal: 300 }, { name: "1 small apple", kcal: 60 } ],
        Dinner: [ { name: "Soup (vegetable/lentil)", kcal: 120 }, { name: "Grilled fish + steamed broccoli", kcal: 250 } ],
        Snacks: [ { name: "Carrot/cucumber sticks + hummus", kcal: 100 }, { name: "Handful of almonds", kcal: 70 } ],
      },
      tips: [ "Cut down on refined carbs and sugar", "Choose high-protein, high-fiber foods", "Use smaller plates for portion control", "Cook with less oil (grill/steam/bake instead of frying)" ],
      exercises: [ "Brisk walking or cycling (30–45 min, 4–5x/week)", "Strength training 2–3x/week to preserve muscle", "HIIT cardio 1–2x/week if fitness allows" ],
    },
    Obese: {
      meals: {
        Breakfast: [ { name: "Vegetable scramble (2 eggs + spinach/tomato)", kcal: 200 }, { name: "½ cup berries", kcal: 40 } ],
        Lunch: [ { name: "Large vegetable salad with olive oil", kcal: 120 }, { name: "Boiled chicken breast (100g)", kcal: 180 } ],
        Dinner: [ { name: "Baked fish (120g)", kcal: 200 }, { name: "Cauliflower rice / steamed veg", kcal: 60 } ],
        Snacks: [ { name: "Raw vegetables", kcal: 50 }, { name: "Herbal tea", kcal: 0 } ],
      },
      tips: [ "Consult healthcare provider for safe calorie deficit", "Focus on nutrient-dense, low-calorie foods", "Avoid processed and fried foods", "Track calories and progress consistently" ],
      exercises: [ "Daily walking (20–30 min, start slow, progress gradually)", "Low impact cardio (cycling, swimming, elliptical)", "Light resistance training (bands/weights) 2x/week" ],
    },
  };

  const selectedPlan = mealPlans[status];
  if (!selectedPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-6">
        <div className="bg-white p-6 rounded shadow">
          <p className="text-red-500">Invalid BMI or missing data. Please go back to the calculator.</p>
          <button onClick={() => router.back()} className="mt-4 text-green-600 hover:underline">← Back to Calculator</button>
        </div>
      </div>
    );
  }

  // total calories
  const totalCalories = Object.values(selectedPlan.meals).flat().reduce((acc, it) => acc + (it.kcal || 0), 0);

  // shopping list generator (basic: split item names into ingredients heuristically)
  const shoppingList = useMemo(() => {
    const items: Record<string, number> = {};
    Object.values(selectedPlan.meals).flat().forEach((m) => {
      const parts = m.name.split(/\+|,|with|and|\/|\(|\)/i).map(s => s.trim()).filter(Boolean);
      parts.forEach(p => { items[p] = (items[p] || 0) + 1; });
    });
    return Object.entries(items).sort((a,b) => b[1]-a[1]).map(([name,count]) => ({ name, count }));
  }, [selectedPlan]);

  const [swapMode, setSwapMode] = useState(false);

  const sharePlan = async () => {
    const body = `Meal plan (${status}) - Total: ${totalCalories} kcal\n\n` +
      Object.entries(selectedPlan.meals).map(([meal,items]) => `${meal}: ${items.map(it => `${it.name} (${it.kcal}kcal)`).join(', ')}`).join('\n');
    if (navigator.share) {
      try { await navigator.share({ title: `Meal Plan - ${status}`, text: body }); }
      catch (e) { console.warn(e); }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(body);
      alert('Plan copied to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-green-50 px-4 py-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl p-6 shadow">
        <button onClick={() => router.back()} className="text-green-600 text-sm mb-4 hover:underline">← Back to Calculator</button>

        <div className="grid md:grid-cols-4 gap-4 mb-4">
          <div className="p-4 border rounded-xl text-center">
            <p className="font-semibold">BMI</p>
            <p className="text-2xl font-bold">{bmi}</p>
          </div>
          <div className="p-4 border rounded-xl text-center">
            <p className="font-semibold">Gender</p>
            <p className="text-2xl font-bold capitalize">{gender}</p>
          </div>
          <div className="p-4 border rounded-xl text-center">
            <p className="font-semibold">Age</p>
            <p className="text-2xl font-bold">{age}</p>
          </div>
          <div className={`p-4 border rounded-xl text-center ${status === "Normal weight" ? "bg-green-100 text-green-700" : status === "Underweight" ? "bg-yellow-100 text-yellow-700" : status === "Overweight" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>
            <p className="font-semibold">Health Status</p>
            <p className="text-lg font-bold">{status}</p>
          </div>
        </div>

        <div className="p-4 border rounded-xl bg-green-50 text-center font-semibold mb-6">Total Daily Calories: {totalCalories} kcal</div>

        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(selectedPlan.meals).map(([meal, items]) => (
            <div key={meal} className="p-4 border rounded-xl shadow-sm">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg">{meal}</h3>
                <button onClick={() => setSwapMode(!swapMode)} className="text-sm text-gray-500">Swap options</button>
              </div>
              <ul className="text-sm text-gray-700 space-y-1 mt-2">
                {items.map((it, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{it.name}</span>
                    <span className="text-gray-400">({it.kcal} kcal)</span>
                  </li>
                ))}
                {swapMode && <li className="mt-2 text-xs text-gray-500">Suggested alternative(s): Try swapping fish with chicken or tofu, swap rice with quinoa or wholegrain pasta.</li>}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-xl bg-gray-50">
            <h4 className="font-semibold">Nutrition Tips</h4>
            <ul className="text-sm list-disc pl-5 mt-2 space-y-1">
              {selectedPlan.tips.map((t,i)=>(<li key={i}>{t}</li>))}
            </ul>
          </div>

          <div className="p-4 border rounded-xl bg-gray-50">
            <h4 className="font-semibold">Exercise Suggestions</h4>
            <ul className="text-sm list-disc pl-5 mt-2 space-y-1">
              {selectedPlan.exercises.map((e,i)=>(<li key={i}>{e}</li>))}
            </ul>
          </div>

          <div className="p-4 border rounded-xl bg-gray-50">
            <h4 className="font-semibold">Shopping List</h4>
            <ul className="text-sm mt-2 space-y-1">
              {shoppingList.map((s,i)=>(<li key={i}>{s.name} <span className="text-gray-400">×{s.count}</span></li>))}
            </ul>
            <div className="mt-3 flex gap-2">
              <button onClick={sharePlan} className="px-3 py-2 bg-green-600 text-white rounded">Share/Copy</button>
              <button onClick={() => { const blob = new Blob([JSON.stringify(selectedPlan,null,2)],{type:'application/json'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `mealplan-${status}.json`; a.click(); URL.revokeObjectURL(url);} } className="px-3 py-2 bg-gray-100 rounded">Download JSON</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

