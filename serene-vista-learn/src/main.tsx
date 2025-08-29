import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initGA } from './lib/ga';

// Initialize Google Analytics if VITE_GA_MEASUREMENT_ID is set
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
if (GA_MEASUREMENT_ID) {
	initGA(GA_MEASUREMENT_ID);
}

createRoot(document.getElementById("root")!).render(<App />);
