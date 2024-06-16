import { openDB, IDBPDatabase, deleteDB } from "idb";
import { User, Reservation, Availability } from "./types";

interface SchedulerDBSchema {
  users: {
    key: number;
    value: User;
    indexes: { role: string };
  };
  reservations: {
    key: number;
    value: Reservation;
    indexes: { userIds: number[]; status: string };
  };
  availability: {
    key: number;
    value: Availability;
    indexes: { userId: number };
  };
}

export default class IndexedDB {
  private DB_NAME: string = "scheduler-db";
  private DB_VERSION: number = 1;
  private dbPromise: Promise<IDBPDatabase<SchedulerDBSchema>>;

  constructor() {
    this.dbPromise = this.openDB();
  }

  public async initializeDatabase(): Promise<void> {
    await this.dbPromise; // Ensure the database is opened
    await this.initializeUsers();
    await this.initializeReservations();
    await this.initializeAvailability();
  }

  private async openDB(): Promise<IDBPDatabase<SchedulerDBSchema>> {
    return openDB<SchedulerDBSchema>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("users")) {
          const userStore = db.createObjectStore("users", {
            keyPath: "id",
            autoIncrement: true,
          });
          userStore.createIndex("role", "role");
        }
        if (!db.objectStoreNames.contains("reservations")) {
          const reservationStore = db.createObjectStore("reservations", {
            keyPath: "id",
            autoIncrement: true,
          });
          reservationStore.createIndex("userIds", "userIds", {
            multiEntry: true,
          });
          reservationStore.createIndex("status", "status");
        }
        if (!db.objectStoreNames.contains("availability")) {
          const availabilityStore = db.createObjectStore("availability", {
            keyPath: "id",
            autoIncrement: true,
          });
          availabilityStore.createIndex("userId", "userId", {
            unique: false,
          });
        }
        console.log("Database upgrade completed");
      },
    });
  }

  private async initializeUsers(): Promise<void> {
    console.log("Initializing users");
    try {
      const db = await this.dbPromise;
      const users = await db.getAll("users");
      if (users.length === 0) {
        await db.add("users", { name: "Provider 1", role: "provider" });
        await db.add("users", { name: "Client 2", role: "client" });
        await db.add("users", { name: "Provider 3", role: "provider" });
        await db.add("users", { name: "Client 4", role: "client" });
        console.log("Users initialized");
      }
    } catch (error) {
      console.error("Error initializing users:", error);
    }
  }

  private async initializeReservations(): Promise<void> {
    console.log("Initializing reservations");
    try {
      const db = await this.dbPromise;
      const reservations = await db.getAll("reservations");

      if (reservations.length === 0) {
        const now = new Date();
        const dateStr = now.toISOString().split("T")[0];

        const startTime = "08:00";
        const endTime = "08:15";

        await db.add("reservations", {
          name: "Test Reservation",
          date: dateStr,
          startTime,
          endTime,
          status: "pending",
          userIds: [1, 2],
        });
        await db.add("reservations", {
          name: "Discuss Stuff",
          date: dateStr,
          startTime,
          endTime,
          status: "pending",
          userIds: [3, 2],
        });
      }
    } catch (error) {
      console.error("Error initializing reservations:", error);
    }
  }

  private async initializeAvailability(): Promise<void> {
    console.log("Initializing availability");
    try {
      const db = await this.dbPromise;
      const availability = await db.getAll("availability");
      if (availability.length === 0) {
        const today = new Date().toISOString().split("T")[0];
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];

        await db.add("availability", {
          userId: 1,
          date: today,
          startTime: "09:00",
          endTime: "17:00",
        });
        await db.add("availability", {
          userId: 3,
          date: tomorrow,
          startTime: "09:00",
          endTime: "14:00",
        });
      }
    } catch (error) {
      console.error("Error initializing availability:", error);
    }
  }

  // User Methods
  async getAllUsers(): Promise<User[]> {
    try {
      const db = await this.dbPromise;
      return db.getAll("users");
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  }

  async addUser(user: User): Promise<IDBValidKey> {
    try {
      const db = await this.dbPromise;
      return db.add("users", user);
    } catch (error) {
      console.error("Error adding user:", error);
      return -1;
    }
  }

  async getUserById(id: number): Promise<User | undefined> {
    try {
      const db = await this.dbPromise;
      return db.get("users", id);
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      return undefined;
    }
  }

  async getUsersByRole(role: "client" | "provider"): Promise<User[]> {
    try {
      const db = await this.dbPromise;
      return db.getAllFromIndex("users", "role", role);
    } catch (error) {
      console.error("Error fetching users by role:", error);
      return [];
    }
  }

  // Reservation Methods
  async getAllReservations(): Promise<Reservation[]> {
    try {
      const db = await this.dbPromise;
      return db.getAll("reservations");
    } catch (error) {
      console.error("Error fetching reservations:", error);
      return [];
    }
  }

  async getPendingReservations(): Promise<Reservation[]> {
    try {
      const db = await this.dbPromise;
      return db.getAllFromIndex("reservations", "status", "pending");
    } catch (error) {
      console.error("Error fetching pending reservations:", error);
      return [];
    }
  }

  async getPendingReservationsByUser(userId: number): Promise<Reservation[]> {
    try {
      const db = await this.dbPromise;
      const index = db.transaction("reservations").store.index("userIds");
      const allUserReservations = await index.getAll(IDBKeyRange.only(userId));

      const pendingReservations = allUserReservations.filter(
        (reservation) => reservation.status === "pending"
      );

      return pendingReservations;
    } catch (error) {
      console.error("Error fetching pending reservations by user ID:", error);
      return [];
    }
  }

  async getReservationsByDate(date: string): Promise<Reservation[]> {
    const db = await this.dbPromise;
    const allReservations = await db.getAll("reservations");
    return allReservations.filter((reservation) => reservation.date === date);
  }

  async cancelReservationsByDate(date: string): Promise<void> {
    const db = await this.dbPromise;
    const reservations = await this.getReservationsByDate(date);

    const tx = db.transaction("reservations", "readwrite");
    const store = tx.objectStore("reservations");

    const updatePromises = reservations.map(async (reservation) => {
      if (reservation.status === "approved") {
        reservation.status = "denied";
        await store.put(reservation);
      }
    });

    await Promise.all(updatePromises);
    await tx.done;
  }

  async getOverlappingReservations(
    userId: number,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<Reservation[]> {
    const db = await this.dbPromise;
    const reservations = await db.getAllFromIndex(
      "reservations",
      "userIds",
      userId
    );
    return reservations.filter(
      (reservation) =>
        reservation.date === date &&
        ((startTime >= reservation.startTime &&
          startTime < reservation.endTime) ||
          (endTime > reservation.startTime && endTime <= reservation.endTime) ||
          (startTime <= reservation.startTime &&
            endTime >= reservation.endTime))
    );
  }

  async getReservationById(id: IDBValidKey): Promise<Reservation | undefined> {
    const db = await this.dbPromise;
    return db.get("reservations", id);
  }

  async getReservationsByUserId(userId: number): Promise<Reservation[]> {
    try {
      const db = await this.dbPromise;
      const index = db.transaction("reservations").store.index("userIds");
      return index.getAll(IDBKeyRange.only(userId));
    } catch (error) {
      console.error("Error fetching reservations by user ID:", error);
      return [];
    }
  }

  async addReservation(reservation: Reservation): Promise<IDBValidKey> {
    try {
      const db = await this.dbPromise;
      return db.add("reservations", reservation);
    } catch (error) {
      console.error("Error adding reservation:", error);
      throw error;
    }
  }

  async updateReservation(reservation: Reservation): Promise<void> {
    try {
      const db = await this.dbPromise;
      await db.put("reservations", reservation);
      this.notifyReservationUpdated();
    } catch (error) {
      console.error("Error updating reservation:", error);
    }
  }

  private reservationUpdateListeners: (() => void)[] = [];

  onReservationUpdate(listener: () => void) {
    this.reservationUpdateListeners.push(listener);
  }

  private notifyReservationUpdated() {
    this.reservationUpdateListeners.forEach((listener) => listener());
  }

  async deleteReservation(id: number): Promise<void> {
    try {
      const db = await this.dbPromise;
      await db.delete("reservations", id);
    } catch (error) {
      console.error("Error deleting reservation:", error);
    }
  }

  // Availability Methods
  async getAllAvailability(): Promise<Availability[]> {
    try {
      const db = await this.dbPromise;
      return db.getAll("availability");
    } catch (error) {
      console.error("Error fetching availability:", error);
      return [];
    }
  }

  async getAvailabilityByUserId(userId: number): Promise<Availability[]> {
    try {
      const db = await this.dbPromise;
      return db.getAllFromIndex("availability", "userId", userId);
    } catch (error) {
      console.error("Error fetching availability by user ID:", error);
      return [];
    }
  }

  async getAvailabilityByUserIdAndDate(
    userId: number,
    date: string
  ): Promise<Availability | undefined> {
    try {
      const db = await this.dbPromise;
      const allAvailability = await db.getAllFromIndex(
        "availability",
        "userId",
        userId
      );
      return allAvailability.find((avail) => avail.date === date);
    } catch (error) {
      console.error("Error fetching availability by user ID and date:", error);
      return undefined;
    }
  }

  async addAvailability(availability: Availability): Promise<IDBValidKey> {
    try {
      const db = await this.dbPromise;
      return db.add("availability", availability);
    } catch (error) {
      console.error("Error adding availability:", error);
      return -1;
    }
  }

  async updateAvailability(availability: Availability): Promise<void> {
    try {
      const db = await this.dbPromise;
      await db.put("availability", availability);
    } catch (error) {
      console.error("Error updating availability:", error);
    }
  }

  async deleteAvailability(id: number): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction("availability", "readwrite");
    await tx.store.delete(id);
    await tx.done;
  }

  async deleteAvailabilityByUserId(userId: number): Promise<void> {
    try {
      const db = await this.dbPromise;
      const availability = await db.getAllFromIndex(
        "availability",
        "userId",
        userId
      );
      const tx = db.transaction("availability", "readwrite");
      for (const a of availability) {
        tx.store.delete(a.id);
      }
      await tx.done;
    } catch (error) {
      console.error("Error deleting availability by user ID:", error);
    }
  }

  // DB Methods
  private async closeConnections() {
    if (this.dbPromise) {
      const db = await this.dbPromise;
      db.close();
      this.dbPromise = new Promise(() => {});
    }
  }

  async deleteDB(): Promise<void> {
    try {
      await this.closeConnections();
      await deleteDB(this.DB_NAME, {
        blocked() {
          console.log("Deleting database is blocked");
        },
      });
      console.log("Database deleted successfully");
    } catch (error) {
      console.error("Error deleting database:", error);
    }
  }
}
