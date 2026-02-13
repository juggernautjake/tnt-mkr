import { useState, useEffect } from 'react';
import axios from 'axios';

export function useServerYear() {
  const [year, setYear] = useState<number>(new Date().getFullYear()); // Initialize with client year

  useEffect(() => {
    const fetchServerYear = async () => {
      try {
        const response = await axios.head('/'); // Make a HEAD request to the root
        const dateHeader = response.headers.date;
        if (dateHeader) {
          const serverDate = new Date(dateHeader);
          setYear(serverDate.getFullYear());
        }
      } catch (error) {
        console.error('Error fetching server date:', error);
        // If the request fails, keep the client year
      }
    };

    fetchServerYear();
  }, []);

  return year;
}