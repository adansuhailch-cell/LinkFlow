// ============================================================
// LinkFlow - Resources Data
// All curated resources are stored here as a JavaScript array.
// Each resource has: title, category, platform, description, link
// ============================================================

const resources = [
  {
    id: 1,
    title: "JavaScript Full Course",
    category: "Programming",
    platform: "YouTube",
    description: "Complete beginner-friendly JavaScript tutorial covering ES6+, async programming, and DOM manipulation.",
    link: "https://www.youtube.com/watch?v=PkZNo7MFNFg"
  },
  {
    id: 2,
    title: "Python for Data Science",
    category: "Programming",
    platform: "YouTube",
    description: "Learn Python from scratch with a focus on data analysis, pandas, and visualization.",
    link: "https://www.youtube.com/watch?v=rfscVS0vtbw"
  },
  {
    id: 3,
    title: "React.js Crash Course",
    category: "Programming",
    platform: "YouTube",
    description: "Build modern web applications with React hooks, components, and state management.",
    link: "https://www.youtube.com/watch?v=w7ejDZ8SWv8"
  },
  {
    id: 4,
    title: "World History Documentary",
    category: "Education",
    platform: "YouTube",
    description: "Comprehensive journey through human civilization from ancient times to modern era.",
    link: "https://www.youtube.com/watch?v=Je23_UD7p9s"
  },
  {
    id: 5,
    title: "Learn Spanish in 30 Days",
    category: "Education",
    platform: "YouTube",
    description: "Structured Spanish lessons for beginners with daily practice exercises.",
    link: "https://www.youtube.com/watch?v=Zf42eB6P4Cs"
  },
  {
    id: 6,
    title: "Photography Masterclass",
    category: "Education",
    platform: "Instagram",
    description: "Professional photography tips covering composition, lighting, and editing techniques.",
    link: "https://www.instagram.com/photography/"
  },
  {
    id: 7,
    title: "Home Workout Routine",
    category: "Fitness",
    platform: "YouTube",
    description: "No-equipment full-body workout perfect for beginners starting their fitness journey.",
    link: "https://www.youtube.com/watch?v=CBWQGb4TyMY"
  },
  {
    id: 8,
    title: "Yoga for Beginners",
    category: "Fitness",
    platform: "Instagram",
    description: "Daily yoga flows and stretching routines to improve flexibility and reduce stress.",
    link: "https://www.instagram.com/yoga/"
  },
  {
    id: 9,
    title: "Healthy Meal Prep",
    category: "Fitness",
    platform: "Instagram",
    description: "Nutritious and delicious meal prep ideas for a balanced diet throughout the week.",
    link: "https://www.instagram.com/mealprep/"
  },
  {
    id: 10,
    title: "Indie Music Discoveries",
    category: "Entertainment",
    platform: "YouTube",
    description: "Curated playlist of hidden gems from independent artists across all genres.",
    link: "https://www.youtube.com/watch?v=5qap5aO4i9A"
  },
  {
    id: 11,
    title: "Movie Review Channel",
    category: "Entertainment",
    platform: "YouTube",
    description: "In-depth reviews and analysis of classic and contemporary films.",
    link: "https://www.youtube.com/watch?v=h9HbpbGH_ik"
  },
  {
    id: 12,
    title: "Gaming Strategy Guides",
    category: "Gaming",
    platform: "YouTube",
    description: "Pro-level tips and walkthroughs for popular strategy and RPG games.",
    link: "https://www.youtube.com/watch?v=Nj4B5y1XxUc"
  }
];

// Category configuration
const categories = [
  { name: "All", count: resources.length },
  { name: "Education", count: resources.filter(r => r.category === "Education").length },
  { name: "Programming", count: resources.filter(r => r.category === "Programming").length },
  { name: "Fitness", count: resources.filter(r => r.category === "Fitness").length },
  { name: "Entertainment", count: resources.filter(r => r.category === "Entertainment").length },
  { name: "Gaming", count: resources.filter(r => r.category === "Gaming").length }
];

// Platform colors for UI
const platformColors = {
  "YouTube": "#FF0000",
  "Instagram": "#E4405F"
};

// Category colors for UI accents
const categoryColors = {
  "Education": "#4A90D9",
  "Programming": "#7B68EE",
  "Fitness": "#2ECC71",
  "Entertainment": "#E67E22",
  "Gaming": "#9B59B6"
};
