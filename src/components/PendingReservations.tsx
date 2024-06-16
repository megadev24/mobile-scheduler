import React from "react";
import { format, parseISO } from "date-fns";
import { ListItem, ListItemText, Typography } from "@mui/material";
import { Reservation } from "../types";

interface PendingReservationCardProps {
  reservation: Reservation;
  handleReservationUpdate: (updatedReservation: Reservation) => void;
  userType: "provider" | "client";
}

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes));
  return format(date, "hh:mm a");
};

const PendingReservationCard: React.FC<PendingReservationCardProps> = ({
  reservation,
  handleReservationUpdate,
  userType,
}) => {
  const { date, startTime, endTime, name } = reservation;

  return (
    <ListItem>
      <ListItemText
        primary={name}
        secondary={
          <>
            <Typography component="span" variant="body2">
              {format(parseISO(date), "yyyy-MM-dd")}
            </Typography>
            {" - "}
            <Typography component="span" variant="body2">
              {formatTime(startTime)} - {formatTime(endTime)}
            </Typography>
          </>
        }
      />
    </ListItem>
  );
};

export default PendingReservationCard;
