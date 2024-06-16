import React, { useState, useEffect } from "react";
import IndexedDB from "../indexedDB";
import { Reservation } from "../types";
import { Box, Chip, Typography, ListItem, ListItemText } from "@mui/material";
import PendingReservationCard from "./PendingReservationCard";
import { format, parseISO } from "date-fns";

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

  useEffect(() => {
    const fetchPendingReservations = async () => {
      try {
        const reservations = await db.getPendingReservationsByUser(userId);
        setPendingReservations(reservations);
      } catch (error) {
        console.error("Error fetching pending tasks:", error);
      }
    };
    fetchPendingReservations();
  }, [db, userId]);

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

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return format(date, "hh:mm a");
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
