export interface Availability {
  id?: number;
  userId: number;
  date: string;
  startTime: string;
  endTime: string;
}

export interface User {
  id?: number;
  name: string;
  role: "client" | "provider";
}

export interface Reservation {
  id?: number;
  userIds: number[];
  users?: User[]; // Optional property
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "pending" | "approved" | "denied" | "expired";
}
