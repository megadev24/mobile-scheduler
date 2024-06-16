import React, { useEffect, useState, useCallback } from "react";
import IndexedDB from "../indexedDB";
import {
  Alert,
  Box,
  Button,
  FormControl,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { MobileDatePicker } from "@mui/x-date-pickers";
import { Reservation } from "../types";
import useUserAvailability from "../hooks/useUserAvailability";
import useSoonestAvailability from "../hooks/useSoonestAvailability";
import { addDays, format, parseISO } from "date-fns";

interface ReservationSetterProps {
  db: IndexedDB;
  userId: number;
  providerId: number;
  onNewAvailability: () => void;
}

const ReservationSetter: React.FC<ReservationSetterProps> = ({
  db,
  userId,
  providerId,
  onNewAvailability,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    addDays(new Date(), 1)
  ); // Default to tomorrow
  const [startTime, setStartTime] = useState<string>("08:00");
  const [endTime, setEndTime] = useState<string>("08:15");
  const { availability, loading, error } = useUserAvailability(db, providerId);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const soonestAvailability = useSoonestAvailability(
    availability,
    reservations
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("success");

  const fetchReservations = useCallback(async () => {
    if (!db) return;
    const res = await db.getAllReservations();
    setReservations(res);
  }, [db]);

  useEffect(() => {
    fetchReservations();
  }, [db, fetchReservations]);

  const resetState = () => {
    setSelectedDate(addDays(new Date(), 1)); // Reset to tomorrow
    setStartTime("08:00");
    setEndTime("08:15");
    setSnackbarSeverity("success");
  };

  const isLessThan24Hours = (selectedDate: Date) => {
    const now = new Date();
    const selectedDateTime = new Date(selectedDate);
    selectedDateTime.setHours(
      parseInt(startTime.split(":")[0]),
      parseInt(startTime.split(":")[1])
    );
    return selectedDateTime.getTime() - now.getTime() < 24 * 60 * 60 * 1000;
  };

  const isOverlapping = async (dateStr: string) => {
    const overlappingReservations = await db.getOverlappingReservations(
      userId,
      dateStr,
      startTime,
      endTime
    );
    if (overlappingReservations.length > 0) {
      setSnackbarMessage(
        "The selected time overlaps with an existing reservation."
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return true;
    }
    return false;
  };

  const handleDayOutRequirement = (selectedDate: Date | null) => {
    if (selectedDate && isLessThan24Hours(selectedDate)) {
      console.log("reservation out of bounds");
      setErrorMessage("The reservation must be at least 24 hours out.");
    } else {
      setErrorMessage("");
    }
  };

  const handleTimeLimit = (reservationId: IDBValidKey) => {
    setTimeout(async () => {
      const reservation = await db.getReservationById(reservationId);
      if (reservation && reservation.status === "pending") {
        reservation.status = "expired";
        await db.updateReservation(reservation);
        alert("A reservation has expired due to inactivity.");
      }
    }, 30 * 60 * 1000); // 30 minutes
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedDate) {
      if (isLessThan24Hours(selectedDate)) {
        setErrorMessage("The reservation must be at least 24 hours out.");
        return;
      }
      const dateStr = selectedDate.toISOString().split("T")[0];
      if (await isOverlapping(dateStr)) return;

      const newReservation: Reservation = {
        userIds: [userId, providerId],
        name: "New Reservation",
        date: dateStr,
        startTime,
        endTime,
        status: "pending",
      };

      const reservationId = await db.addReservation(newReservation);
      if (typeof reservationId === "number") {
        handleTimeLimit(reservationId);
        onNewAvailability(); // Notify that availability has changed
      }
    }
    resetState();
  };

  const handleTimeChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newStartTime = event.target.value;
    setStartTime(newStartTime);

    const [hours, minutes] = newStartTime.split(":").map(Number);
    const endDate = new Date();
    endDate.setHours(hours, minutes + 15);

    const newEndTime = endDate.toTimeString().slice(0, 5);
    setEndTime(newEndTime);
  };

  const handleDatePickerChange = (date: Date | null) => {
    setSelectedDate(date);
    handleDayOutRequirement(date!);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };


  return (
    <>
      <Typography sx={{ marginTop: "16px" }} variant="h2">
        Schedule Reservation
      </Typography>
      <Box
        mt={2}
        flexDirection={"column"}
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex" }}
      >
        <FormControl>
          <MobileDatePicker
            label="Select Date"
            value={selectedDate}
            onChange={handleDatePickerChange}
            disabled={!providerId}
            shouldDisableDate={(date) =>
              !availability.some(
                (avail) =>
                  parseISO(avail.date).toDateString() === date.toDateString()
              )
            }
            slotProps={{
              textField: {
                error: Boolean(errorMessage),
                helperText: errorMessage,
              },
            }}
          />
        </FormControl>
        <Box mt={2} display="flex">
          <FormControl sx={{ flexGrow: "1", marginRight: "2px" }}>
            <TextField
              id="startTime"
              label="Start Time"
              type="time"
              disabled={!providerId}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                step: 300,
              }}
              value={startTime}
              onChange={handleTimeChange}
            />
          </FormControl>
          <FormControl sx={{ flexGrow: "1", marginLeft: "2px" }}>
            <TextField
              id="endTime"
              label="End Time"
              type="time"
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                step: 300, // 5 min
              }}
              disabled
              value={endTime}
              onChange={handleTimeChange}
            />
          </FormControl>
        </Box>
        <Button
          sx={{ marginTop: "8px" }}
          type="submit"
          variant="contained"
          disabled={!providerId}
        >
          Submit
        </Button>
      </Box>
      <Typography mt={2} variant="h4">
        Provider's Availability
      </Typography>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      <List>
        {availability.map((avail) => (
          <ListItem key={avail.id}>
            <ListItemText
              primary={format(new Date(avail.date), "yyyy-MM-dd")}
              secondary={`${avail.startTime} - ${avail.endTime}`}
            />
          </ListItem>
        ))}
      </List>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      {soonestAvailability && (
        <Typography mt={2} variant="h6">
          Soonest Available:{" "}
          {format(parseISO(soonestAvailability.date), "MM-dd-yyyy")} from{" "}
          {format(
            parseISO(`1970-01-01T${soonestAvailability.startTime}`),
            "hh:mm a"
          )}{" "}
          to{" "}
          {format(
            parseISO(`1970-01-01T${soonestAvailability.endTime}`),
            "hh:mm a"
          )}
        </Typography>
      )}
    </>
  );
};

export default ReservationSetter;
