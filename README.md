# LinkFlow

> Stop Searching. Start Discovering.

LinkFlow is a curated content discovery platform that helps users find useful and high-quality content from YouTube and Instagram without wasting time scrolling through algorithms.

## Overview

LinkFlow organizes curated links into five categories: **Education**, **Programming**, **Fitness**, **Entertainment**, and **Gaming**. Users can browse, search, and filter resources to quickly find the content they need.

## Features

- **Curated Resources** - Hand-picked links from YouTube and Instagram
- **Category Filtering** - Filter by Education, Programming, Fitness, Entertainment, or Gaming
- **Live Search** - Instantly search by title, platform, category, or description
- **3D Flip Card Detail View** - Click any card to see an expanded detail panel with a smooth 3D animation
- **3D Animated Hero** - Interactive particle flow-field visualization in the hero section
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Accessibility** - Keyboard navigable, respects `prefers-reduced-motion`, proper ARIA labels

## Project Structure

```
LinkFlow/
|-- index.html          # Homepage (hero, categories, cards, about, footer)
|-- style.css           # Complete stylesheet with responsive design
|-- script.js           # Main JavaScript (3D particles, cards, search, filter, flip)
|-- resources.js        # Sample resource data (12 curated links)
|-- pages/
|   |-- categories.html # Dedicated category browsing page
|   |-- about.html      # Project information page
|-- assets/
|   |-- images/         # Image assets folder
|   |-- icons/          # Icon assets folder
|-- README.md           # This file
```

## Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Grid, Flexbox, animations, transitions
- **Vanilla JavaScript** - No frameworks, no dependencies (except Three.js for 3D)
- **Three.js** (via CDN) - 3D particle flow-field in the hero section
- **No backend** - All data stored in JavaScript arrays
- **No database** - Static data in `resources.js`
- **No login system** - Open access

## How to Run

1. Open `index.html` in any modern web browser
2. No server or build step required
3. For the best experience, use a local server (recommended):

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (npx)
npx serve .

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## How It Works

### Data Flow
1. Resource data is stored in `resources.js` as a JavaScript array of objects
2. Each resource has: `id`, `title`, `category`, `platform`, `description`, `link`
3. `script.js` reads this data and dynamically renders cards into the HTML
4. Categories are also defined in `resources.js` with item counts

### Search & Filtering
- **Category filter**: Clicking a category chip filters cards to that category only
- **Search**: Typing in the search box filters cards by title, platform, category, or description
- Both filters work together - you can search within a selected category
- Results update instantly as you type or click

### 3D Particle System (Hero)
- 10,000 particles flow along curved paths using 3D simplex noise
- Particles brighten and subtly attract toward the mouse cursor
- The animation pauses when the hero is scrolled out of view (performance optimization)
- Respects `prefers-reduced-motion: reduce` by using fewer particles

### 3D Flip Card Transition
- Clicking a card triggers a 3D rotation animation
- The card appears to flip over, revealing an expanded detail panel on the back
- The card animates from its grid position to the center of the screen
- Click the overlay or X button to close and reverse the animation
- Falls back to a simple modal for users who prefer reduced motion

### Responsive Behavior
- **Desktop (>1024px)**: 3-column card grid, full hero text, visible nav
- **Tablet (768-1024px)**: 2-column grid, smaller hero text
- **Mobile (<768px)**: 1-column grid, hamburger nav menu, smaller text

## Customization

### Adding New Resources

Edit `resources.js` and add a new object to the `resources` array:

```javascript
{
  id: 13,
  title: "Your Resource Title",
  category: "Education",  // Must match an existing category
  platform: "YouTube",    // "YouTube" or "Instagram"
  description: "A brief description of the resource.",
  link: "https://www.youtube.com/watch?v=..."
}
```

Then update the category count in the `categories` array.

### Adding New Categories

1. Add a new category object to the `categories` array in `resources.js`
2. Add a color for the new category in the `categoryColors` object in `script.js`
3. The UI will automatically show the new category chip

### Changing Colors

Edit the CSS custom properties at the top of `style.css`:

```css
:root {
  --color-accent-blue: #4A90D9;
  --color-accent-amber: #E8A838;
  /* ... */
}
```

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Performance Notes

- The 3D particle system runs at 60fps on most modern devices
- On low-end devices, reduce `particleCount` in `script.js` from `10000` to `5000`
- The animation automatically pauses when the hero is not visible
- Card images and assets are minimal for fast loading

## License

This project is open source and available for personal and educational use.

---

Built with plain HTML, CSS, and JavaScript. No frameworks. No backend. Simple and fast.
