import Image from "next/image";
import Link from "next/link";

const cards = [
  {
    title: "BMI Calculator",
    type: "Calculate",
    img: "/bmi.jpg",
    href: "/progress/bmi",
  },
  {
    title: "Meal plan",
    type: "Meal",
    img: "/school.jpg",
    href: "/progress/meal",
  },
  {
    title: "Goals",
    type: "Challenge",
    img: "/autumn.jpg",
    href: "/progress/goals",
  },
  {
    title: "Workouts",
    type: "Activity",
    img: "/year2025.jpg",
    href: "/progress/workouts",
  },
];

export default function Progress() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black-500 to-gray-500 flex items-center justify-center">
      <div className="grid grid-cols-2 gap-8 w-full max-w-5xl">
        {cards.map((card, idx) => (
          <Link href={card.href} key={idx} className="group">
            <div className="relative rounded-2xl overflow-hidden shadow-lg cursor-pointer transition-transform group-hover:scale-105">
              <Image
                src={card.img}
                alt={card.title}
                width={500}
                height={300}
                className="w-full h-64 object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              {/* Badge */}
              <span className="absolute top-4 left-4 bg-white/80 text-black text-xs font-semibold px-3 py-1 rounded-full">
                {card.type}
              </span>
              {/* Title & Info */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h2 className="text-2xl font-bold mb-2">{card.title}</h2>
                <div className="flex items-center gap-6 text-sm font-medium">
                  <span className="flex items-center gap-1">
                    {/* Fire SVG */}
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M12 2C12 2 7 7 7 12a5 5 0 0010 0c0-5-5-10-5-10zm0 17a3 3 0 01-3-3c0-2 3-6 3-6s3 4 3 6a3 3 0 01-3 3z"
                      />
                    </svg>
                  </span>
                  <span className="flex items-center gap-1">
                    {/* Clock SVG */}
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        d="M12 6v6l4 2"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}