import { useState, useEffect } from "react";

 function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);
    
    // Create event listener function
    const handler = (event) => setMatches(event.matches);
    
    // Add the event listener
    mediaQuery.addEventListener("change", handler);
    
    // Clean up
    return () => mediaQuery.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

export default useMediaQuery;