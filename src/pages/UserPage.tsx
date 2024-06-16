import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { User } from "../types";
import MobileHeader from "../components/MobileHeader";
import PendingReservations from "../components/PendingReservations";
import ScheduleSettter from "../components/ScheduleSetter";
import ProviderSelector from "../components/ProviderSelector";
import ReservationSetter from "../components/ReservationSetter";
import ScheduleInsights from "../components/ScheduleInsights";
import IndexedDB from "../indexedDB";
import { useParams } from "react-router-dom";
import useAvailability from "../hooks/useUserAvailability";

interface UserPageProps {
  db: IndexedDB | null;
  setDb: (db: IndexedDB) => void;
  intializeDB: () => void;
}

const UserPage: React.FC<UserPageProps> = ({ db, setDb, intializeDB }) => {
  const { userId } = useParams<{ userId: string }>();
  const [selectedProvider, setSelectedProvider] = useState<User | null>(null);
  const [userType, setUserType] = useState<"provider" | "client">("provider");
  const { availability, fetchAvailability } = useAvailability(db, Number(userId));

  const fetchUserData = async () => {
    if (!db) return;
    try {
      const user = await db.getUserById(Number(userId));
      if (user) {
        setUserType(user.role);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchAvailability();
    fetchUserData();
  });

  const handleDeleteAndReinitializeDB = async () => {
    if (db) {
      await db.deleteDB();
      intializeDB();
    }
  };

  return (
    <>
      <MobileHeader
        handleDeleteAndReinitializeDB={handleDeleteAndReinitializeDB}
      />
      {userType === "provider" && db && (
        <Box p={2}>
          <PendingReservations
            db={db}
            userType={userType}
            userId={Number(userId)}
          />
          <ScheduleInsights
            db={db}
            userId={Number(userId)}
            availability={availability}
            fetchAvailability={fetchAvailability}
          />
          <ScheduleSettter
            userId={Number(userId)}
            onNewAvailability={fetchAvailability}
            db={db}
          />
        </Box>
      )}
      {userType === "client" && db && (
        <Box p={2}>
          <PendingReservations
            db={db}
            userType={userType}
            userId={Number(userId)}
          />{" "}
          <ProviderSelector
            db={db}
            selectedProvider={selectedProvider}
            setSelectedProvider={setSelectedProvider}
          />
          <ReservationSetter
            userId={Number(userId)}
            providerId={Number(selectedProvider?.id)}
            onNewAvailability={fetchAvailability}
            db={db}
          />
        </Box>
      )}
    </>
  );
};

export default UserPage;
