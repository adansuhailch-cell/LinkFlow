// ============================================================
// LinkFlow - Resources Data (Expanded)
// All curated resources organized by 8 categories
// ============================================================

const resources = [
  // EDUCATION
  { id: 1, title: "Web Development Roadmap 2025", category: "Education", platform: "YouTube", description: "Complete roadmap to become a web developer with latest technologies.", link: "https://www.youtube.com/watch?v=VfGW0Qiy2I0" },
  { id: 2, title: "Python for Data Science", category: "Education", platform: "YouTube", description: "Learn Python from scratch with focus on data analysis and visualization.", link: "https://www.youtube.com/watch?v=rfscVS0vtbw" },
  { id: 3, title: "World History Documentary", category: "Education", platform: "YouTube", description: "Comprehensive journey through human civilization from ancient times.", link: "https://www.youtube.com/watch?v=Je23_UD7p9s" },
  { id: 4, title: "Learn Spanish in 30 Days", category: "Education", platform: "YouTube", description: "Structured Spanish lessons for beginners with daily practice.", link: "https://www.youtube.com/watch?v=Zf42eB6P4Cs" },
  
  // TECH
  { id: 5, title: "React.js Complete Guide", category: "Tech", platform: "YouTube", description: "Master React with hooks, components, and state management.", link: "https://www.youtube.com/watch?v=w7ejDZ8SWv8" },
  { id: 6, title: "JavaScript ES6+ Fundamentals", category: "Tech", platform: "YouTube", description: "Deep dive into modern JavaScript features and best practices.", link: "https://www.youtube.com/watch?v=PkZNo7MFNFg" },
  { id: 7, title: "CSS Grid & Flexbox Mastery", category: "Tech", platform: "YouTube", description: "Learn modern CSS layout techniques for responsive design.", link: "https://www.youtube.com/watch?v=x7cQ3mrcKaY" },
  { id: 8, title: "Machine Learning Basics", category: "Tech", platform: "YouTube", description: "Introduction to ML concepts and practical implementations.", link: "https://www.youtube.com/watch?v=aircAruvnKk" },
  
  // ENTERTAINMENT
  { id: 9, title: "Movie Review Channel", category: "Entertainment", platform: "YouTube", description: "In-depth reviews and analysis of classic and contemporary films.", link: "https://www.youtube.com/watch?v=h9HbpbGH_ik" },
  { id: 10, title: "Indie Music Discoveries", category: "Entertainment", platform: "YouTube", description: "Curated playlist of hidden gems from independent artists.", link: "https://www.youtube.com/watch?v=5qap5aO4i9A" },
  { id: 11, title: "Gaming Strategy Guides", category: "Entertainment", platform: "YouTube", description: "Pro-level tips and walkthroughs for strategy and RPG games.", link: "https://www.youtube.com/watch?v=Nj4B5y1XxUc" },
  
  // MOTIVATIONAL
  { id: 12, title: "Morning Motivation Shorts", category: "Motivational", platform: "Instagram", description: "Daily motivational reels to start your day right.", link: "https://www.instagram.com/motivation/" },
  { id: 13, title: "Success Stories & Inspiration", category: "Motivational", platform: "YouTube", description: "Real stories of people achieving their dreams.", link: "https://www.youtube.com/watch?v=ZXsQAXx_ao0" },
  { id: 14, title: "Personal Growth Mindset", category: "Motivational", platform: "YouTube", description: "Transform your mindset for personal and professional growth.", link: "https://www.youtube.com/watch?v=v0ztxdvnH3A" },
  
  // COOKING
  { id: 15, title: "Quick 5-Minute Recipes", category: "Cooking", platform: "Instagram", description: "Easy and delicious recipes you can make in 5 minutes.", link: "https://www.instagram.com/5minutecrafts/" },
  { id: 16, title: "Healthy Meal Prep Guide", category: "Cooking", platform: "YouTube", description: "Nutritious meal prep ideas for a balanced diet.", link: "https://www.youtube.com/watch?v=qBTNYeXJGWQ" },
  { id: 17, title: "Street Food Cooking", category: "Cooking", platform: "YouTube", description: "Learn to cook authentic street food recipes at home.", link: "https://www.youtube.com/watch?v=Mxz0-7Uk9ZY" },
  
  // FITNESS
  { id: 18, title: "Home Workout Routine", category: "Fitness", platform: "YouTube", description: "No-equipment full-body workout for beginners.", link: "https://www.youtube.com/watch?v=CBWQGb4TyMY" },
  { id: 19, title: "Yoga for Beginners", category: "Fitness", platform: "Instagram", description: "Daily yoga flows and stretching routines.", link: "https://www.instagram.com/yogaforbeginners/" },
  { id: 20, title: "HIIT Training 20 Minutes", category: "Fitness", platform: "YouTube", description: "High-intensity interval training for maximum results.", link: "https://www.youtube.com/watch?v=aqz-KE-bXYs" },
  
  // BUSINESS
  { id: 21, title: "Startup Fundamentals", category: "Business", platform: "YouTube", description: "Everything you need to know to start your own business.", link: "https://www.youtube.com/watch?v=rvKsZyTCqWo" },
  { id: 22, title: "Digital Marketing Strategies", category: "Business", platform: "YouTube", description: "Master digital marketing in 2025 with proven strategies.", link: "https://www.youtube.com/watch?v=T8Zl2qF98rU" },
  { id: 23, title: "Personal Finance Mastery", category: "Business", platform: "YouTube", description: "Learn investment and wealth-building strategies.", link: "https://www.youtube.com/watch?v=vQjWUlC8EjE" },
  
  // OTHER
  { id: 24, title: "Photography Masterclass", category: "Other", platform: "Instagram", description: "Professional photography tips and techniques.", link: "https://www.instagram.com/photography/" },
  { id: 25, title: "DIY Home Improvement", category: "Other", platform: "YouTube", description: "Simple DIY projects to upgrade your home.", link: "https://www.youtube.com/watch?v=vEOqXiBhQFA" }
];

// Category configuration
const categories = [
  { name: "All", count: resources.length },
  { name: "Education", count: resources.filter(r => r.category === "Education").length },
  { name: "Tech", count: resources.filter(r => r.category === "Tech").length },
  { name: "Entertainment", count: resources.filter(r => r.category === "Entertainment").length },
  { name: "Motivational", count: resources.filter(r => r.category === "Motivational").length },
  { name: "Cooking", count: resources.filter(r => r.category === "Cooking").length },
  { name: "Fitness", count: resources.filter(r => r.category === "Fitness").length },
  { name: "Business", count: resources.filter(r => r.category === "Business").length },
  { name: "Other", count: resources.filter(r => r.category === "Other").length }
];

// Category colors for UI
const categoryColors = {
  "Education": "#4A90D9",
  "Tech": "#7B68EE",
  "Entertainment": "#E67E22",
  "Motivational": "#FF6B6B",
  "Cooking": "#F38181",
  "Fitness": "#2ECC71",
  "Business": "#3498DB",
  "Other": "#95A5A6"
};

// Platform colors
const platformColors = {
  "YouTube": "#FF0000",
  "Instagram": "#E4405F"
};