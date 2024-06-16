import React from "react";
import { Box, Card, IconButton, Typography, useTheme } from "@mui/material";
import { Check, Close } from "@mui/icons-material";
import { format, parseISO } from "date-fns";
import { Reservation } from "../types";

interface PendingReservationCardProps {
  reservation: Reservation;
  handleReservationUpdate: (updatedReservation: Reservation) => void;
  userType: "provider" | "client";
}

const PendingReservationCard: React.FC<PendingReservationCardProps> = ({
  reservation,
  handleReservationUpdate,
  userType,
}) => {
  const theme = useTheme();

  const backgroundColor = theme.palette.secondary.main;
  const readableDate = format(parseISO(reservation.date), "MM/dd/yyyy");

  const formatTime = (time: string) => {
    try {
      const date = new Date(`1970-01-01T${time}:00`);
      return format(date, "hh:mm a");
    } catch {
      return "Invalid time";
    }
  };

  const readableStartTime = formatTime(reservation.startTime);
  const readableEndTime = formatTime(reservation.endTime);

  return (
    <Card sx={{ backgroundColor: backgroundColor, marginBottom: "4px" }}>
      <Box
        display="flex"
        flexDirection={"row"}
        alignItems="center"
        justifyContent="space-between"
        p={2}
      >
        <Box>
          <Typography variant="h3" fontWeight="bold">
            {reservation.name}
          </Typography>
          <Typography variant="h5">{`${readableStartTime} - ${readableEndTime}`}</Typography>
          <Typography variant="h5">{readableDate}</Typography>
        </Box>
        <Box>
          {userType === "provider" && (
            <IconButton
              onClick={() =>
                handleReservationUpdate({ ...reservation, status: "approved" })
              }
            >
              <Check />
            </IconButton>
          )}
          <IconButton
            onClick={() =>
              handleReservationUpdate({ ...reservation, status: "denied" })
            }
          >
            <Close />
          </IconButton>
        </Box>
      </Box>
    </Card>
  );
};

export default PendingReservationCard;
