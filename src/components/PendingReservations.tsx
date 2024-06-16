import React, { useState, useEffect, useCallback } from "react";
import IndexedDB from "../indexedDB";
import { Reservation } from "../types";
import { Box, Chip, Typography } from "@mui/material";
import PendingReservationCard from "./PendingReservationCard";

interface PendingReservationsProps {
  db: IndexedDB;
  userId: number;
  userType: "provider" | "client";
}

const PendingReservations: React.FC<PendingReservationsProps> = ({
  db,
  userId,
  userType,
}) => {
  const [pendingReservations, setPendingReservations] = useState<Reservation[]>(
    []
  );
  const [showChip, setShowChip] = useState(true);

  const fetchPendingReservations = useCallback(async () => {
    try {
      const reservations = await db.getPendingReservationsByUser(userId);
      setPendingReservations(reservations);
    } catch (error) {
      console.error("Error fetching pending tasks:", error);
    }
  }, [db, userId]);

  useEffect(() => {
    fetchPendingReservations();

    const intervalId = setInterval(fetchPendingReservations, 1000); // Poll every 10 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [db, fetchPendingReservations, userId]);

  const handleReservationUpdate = async (updatedReservation: Reservation) => {
    try {
      await db.updateReservation(updatedReservation);
      setPendingReservations((prevReservations) =>
        prevReservations.filter(
          (reservation) => reservation.id !== updatedReservation.id
        )
      );
    } catch (error) {
      console.error("Error updating reservation status:", error);
    }
  };

  const handleDelete = () => {
    setShowChip(false);
  };

  return (
    <>
      {pendingReservations.length === 0 ? (
        <Box display="flex" justifyContent="center">
          {showChip && (
            <Chip label="No pending reservations" onDelete={handleDelete} />
          )}
        </Box>
      ) : (
        <Box>
          <Box mb={2} sx={{ justifyContent: "center" }}>
            <Typography variant="h2">Pending Reservations</Typography>
          </Box>
          <Box>
            {pendingReservations.map((reservation) => (
              <PendingReservationCard
                key={reservation.id}
                userType={userType}
                handleReservationUpdate={handleReservationUpdate}
                reservation={reservation}
              />
            ))}
          </Box>
        </Box>
      )}
    </>
  );
};

export default PendingReservations;
