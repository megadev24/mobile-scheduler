import { useState, useEffect, useCallback } from "react";
import { Availability, Reservation } from "../types";
import {
  compareAsc,
  parseISO,
  isAfter,
  addDays,
  isBefore,
  format,
} from "date-fns";

const useSoonestAvailability = (
  availability: Availability[],
  reservations: Reservation[]
) => {
  const [soonestAvailability, setSoonestAvailability] =
    useState<Availability | null>(null);

  const updateSoonestAvailability = useCallback(() => {
    if (availability.length > 0) {
      const tomorrow = addDays(new Date(), 1);

      const sortedAvailability = [...availability]
        .filter((avail) => isAfter(parseISO(avail.date), tomorrow)) // Filter out dates that are today or earlier
        .sort((a, b) => {
          const dateComparison = compareAsc(parseISO(a.date), parseISO(b.date));
          if (dateComparison !== 0) return dateComparison;
          return a.startTime.localeCompare(b.startTime);
        });

      for (const avail of sortedAvailability) {
        const availStartTime = parseISO(`${avail.date}T${avail.startTime}`);
        const availEndTime = parseISO(`${avail.date}T${avail.endTime}`);

        let earliestAvailableTime = availStartTime;

        for (const res of reservations) {
          const resStartTime = parseISO(`${res.date}T${res.startTime}`);
          const resEndTime = parseISO(`${res.date}T${res.endTime}`);

          if (
            isAfter(earliestAvailableTime, resStartTime) &&
            isBefore(earliestAvailableTime, resEndTime)
          ) {
            earliestAvailableTime = resEndTime;
          }
        }

        if (isBefore(earliestAvailableTime, availEndTime)) {
          const earliestStart = format(earliestAvailableTime, "HH:mm");
          setSoonestAvailability({
            ...avail,
            startTime: earliestStart,
          });
          return;
        }
      }
      setSoonestAvailability(null); // No availability found that is at least a day ahead
    }
  }, [availability, reservations]);

  useEffect(() => {
    updateSoonestAvailability();
  }, [updateSoonestAvailability, availability, reservations]);

  return soonestAvailability;
};

export default useSoonestAvailability;
