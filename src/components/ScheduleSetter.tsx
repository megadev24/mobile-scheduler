import React from "react";
import IndexedDB from "../indexedDB";
import {
  Alert,
  Box,
  Button,
  FormControl,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { MobileDatePicker } from "@mui/x-date-pickers";

interface ScheduleSetterProps {
  db: IndexedDB;
  userId: number;
  onNewAvailability: () => void;
}

const ScheduleSetter: React.FC<ScheduleSetterProps> = ({
  db,
  userId,
  onNewAvailability,
}) => {
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(
    new Date()
  );
  const [startTime, setStartTime] = React.useState<string>("08:00");
  const [endTime, setEndTime] = React.useState<string>("05:00");
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<
    "success" | "error" | "info" | "warning"
  >("success");

  const resetState = () => {
    setSelectedDate(new Date());
    setStartTime("08:00");
    setEndTime("17:00");
    setSnackbarSeverity("success");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      if (selectedDate) {
        const dateStr = selectedDate.toISOString().split("T")[0]; // Format date as YYYY-MM-DD
        const existingAvailability = await db.getAvailabilityByUserIdAndDate(
          userId,
          dateStr
        );

        if (existingAvailability) {
          existingAvailability.startTime = startTime;
          existingAvailability.endTime = endTime;
          await db.updateAvailability(existingAvailability);
          setSnackbarMessage("Availability updated");
        } else {
          const newAvailability = {
            userId: userId,
            date: dateStr,
            startTime,
            endTime,
          };

          await db.addAvailability(newAvailability);
          setSnackbarMessage("Availability added");
        }

        onNewAvailability(); // Refresh the availability list
        resetState();
      } else {
        setSnackbarMessage("Please select a date");
        setSnackbarSeverity("error");
      }
    } catch (error) {
      console.error("Error updating availability:", error);
      setSnackbarMessage("Error updating availability");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleStartTimeChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newStartTime = event.target.value;
    setStartTime(newStartTime);

    // // Whoops! This is the logic for clients, not providers
    // const [hours, minutes] = newStartTime.split(":").map(Number);
    // const endDate = new Date();
    // endDate.setHours(hours, minutes + 15);

    // // Convert the end time to
    // const newEndTime = endDate.toTimeString().slice(0, 5);
    // setEndTime(newEndTime);
  };

  const handleEndTimeChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newEndTime = event.target.value;
    setEndTime(newEndTime);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Typography sx={{ marginTop: "16px" }} variant="h2">
        Schedule Availability
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
            onChange={setSelectedDate}
          ></MobileDatePicker>
        </FormControl>
        <Box mt={2} display="flex">
          <FormControl sx={{ flexGrow: "1", marginRight: "2px" }}>
            <TextField
              id="startTime"
              label="Start Time"
              type="time"
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                step: 300,
              }}
              value={startTime}
              onChange={handleStartTimeChange}
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
              value={endTime}
              onChange={handleEndTimeChange}
            />
          </FormControl>
        </Box>
        <Button sx={{ marginTop: "8px" }} type="submit" variant="contained">
          Submit
        </Button>
      </Box>
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
    </>
  );
};

export default ScheduleSetter;
