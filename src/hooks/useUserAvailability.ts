import { useState, useEffect, useCallback } from "react";
import IndexedDB from "../indexedDB";
import { Availability } from "../types";

const useUserAvailability = (db: IndexedDB | null, userId: number) => {
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = useCallback(async () => {
    if (!db) return;
    try {
      setLoading(true);
      const availabilities = await db.getAvailabilityByUserId(userId);
      setAvailability(availabilities);
      setError(null);
    } catch (err) {
      setError("Failed to fetch availability");
      setAvailability([]);
    } finally {
      setLoading(false);
    }
  }, [db, userId]);

  useEffect(() => {
    fetchAvailability();
  }, [db, fetchAvailability, userId]);

  return { availability, fetchAvailability, loading, error };
};

export default useUserAvailability;
