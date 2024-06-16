import React, { useState, FC, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Delete } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import {
  addDays,
  startOfWeek,
  format,
  subWeeks,
  addWeeks,
  parse,
  parseISO,
} from "date-fns";
import IndexedDB from "../indexedDB";
import { Availability, Reservation } from "../types";

const getWeekDays = (date: Date) => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

interface ScheduleInsightsProps {
  availability: Availability[];
  fetchAvailability: () => void;
  userId: number;
  db: IndexedDB;
}

const ScheduleInsights: FC<ScheduleInsightsProps> = ({
  db,
  availability,
  fetchAvailability,
  userId,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dialogOpen, setOpenDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [acceptedReservations, setAcceptedReservations] = useState<
    Reservation[]
  >([]);

  const handlePreviousWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };

  const weekDays = getWeekDays(currentDate);

  const fetchAcceptedReservations = useCallback(async () => {
    if (!db) return;
    try {
      const reservations = await db.getReservationsByUserId(userId);
      const accepted = reservations.filter((res) => res.status === "approved");
      setAcceptedReservations(accepted);
    } catch (error) {
      console.error("Error fetching accepted reservations:", error);
    }
  }, [db, userId]);

  useEffect(() => {
    fetchAcceptedReservations();
    db.onReservationUpdate(fetchAcceptedReservations);
  }, [fetchAcceptedReservations, db]);

  const filteredAcceptedReservations = acceptedReservations.filter((item) => {
    const date = parseISO(item.date);
    return weekDays.some((day) => day.toDateString() === date.toDateString());
  });

  const usersAvailability = availability.filter((item) => {
    const date = parseISO(item.date);
    return weekDays.some((day) => day.toDateString() === date.toDateString());
  });

  const handleDelete = async (_: any) => {
    if (selectedId !== null && selectedDate !== null) {
      try {
        await db.deleteAvailability(selectedId);
        await db.cancelReservationsByDate(selectedDate);
        await fetchAvailability();
        await fetchAcceptedReservations();
      } catch (error) {
        console.error(
          "Error deleting availability or cancelling reservations:",
          error
        );
      }
      setSelectedId(null);
      setSelectedDate(null);
      setOpenDialog(false);
    }
  };

  const handleOpenDialog = (id: number, date: string) => {
    setSelectedId(id);
    setSelectedDate(date);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedId(null);
    setSelectedDate(null);
    setOpenDialog(false);
  };

  const formatTime = (time: string) => {
    const parsedTime = parse(time, "HH:mm", new Date());
    return format(parsedTime, "hh:mm a");
  };

  const formatDateWithDay = (date: string) => {
    const parsedDate = parseISO(date);
    const dayOfWeek = format(parsedDate, "EEEE");
    const dayOfMonth = format(parsedDate, "do");
    return `${dayOfWeek}, ${dayOfMonth}`;
  };

  return (
    <>
      <Typography sx={{ marginTop: "16px" }} variant="h2">
        Schedule Insights
      </Typography>
      <Accordion sx={{ marginTop: "8px" }}>
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon />}
          aria-controls="schedule_insights_content"
          id="schedule_insights_header"
        >
          <Typography variant="h3">Availability</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <IconButton onClick={handlePreviousWeek}>
                <ChevronLeft />
              </IconButton>
              <Box width="50%">
                <Typography variant="h5">
                  {format(weekDays[0], "MMMM dd, yyyy")} -{" "}
                  {format(weekDays[6], "MMMM dd, yyyy")}
                </Typography>
              </Box>
              <IconButton onClick={handleNextWeek}>
                <ChevronRight />
              </IconButton>
            </Box>
            <Box>
              <List dense={true}>
                {usersAvailability.length > 0 ? (
                  usersAvailability.map((item) => (
                    <ListItem
                      key={item.id}
                      sx={{ backgroundColor: "#f9f9f9", borderRadius: "8px" }}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleOpenDialog(item.id!, item.date)}
                        >
                          <Delete />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={formatDateWithDay(item.date)}
                        secondary={`${formatTime(
                          item.startTime
                        )} - ${formatTime(item.endTime)}`}
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography sx={{ marginTop: "8px" }} variant="h5">
                    No availability data for this week.
                  </Typography>
                )}
              </List>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ marginTop: "8px" }}>
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon />}
          aria-controls="accepted_reservations_content"
          id="accepted_reservations_header"
        >
          <Typography variant="h3">Accepted Reservations</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <IconButton onClick={handlePreviousWeek}>
                <ChevronLeft />
              </IconButton>
              <Box width="50%">
                <Typography variant="h5">
                  {format(weekDays[0], "MMMM dd, yyyy")} -{" "}
                  {format(weekDays[6], "MMMM dd, yyyy")}
                </Typography>
              </Box>
              <IconButton onClick={handleNextWeek}>
                <ChevronRight />
              </IconButton>
            </Box>
            <Box>
              <List dense={true}>
                {filteredAcceptedReservations.length > 0 ? (
                  filteredAcceptedReservations.map((item) => (
                    <ListItem
                      key={item.id}
                      sx={{ backgroundColor: "#f9f9f9", borderRadius: "8px" }}
                    >
                      <ListItemText
                        primary={formatDateWithDay(item.date)}
                        secondary={`${formatTime(
                          item.startTime
                        )} - ${formatTime(item.endTime)}`}
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography sx={{ marginTop: "8px" }} variant="h5">
                    No accepted reservations for this week.
                  </Typography>
                )}
              </List>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Delete Availability"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this availability?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            No
          </Button>
          <Button onClick={handleDelete} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ScheduleInsights;
