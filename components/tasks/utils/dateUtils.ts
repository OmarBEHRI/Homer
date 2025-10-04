import { formatDistanceToNow, isAfter, isBefore, addDays } from "date-fns";

export function getTimeRemaining(deadline: number): string | null {
  const now = Date.now();
  
  if (deadline < now) {
    return "Overdue";
  }
  
  return formatDistanceToNow(deadline, { addSuffix: true });
}

export function isOverdue(deadline: number): boolean {
  return deadline < Date.now();
}

export function isDueSoon(deadline: number, daysThreshold: number = 3): boolean {
  const threshold = addDays(Date.now(), daysThreshold).getTime();
  return deadline <= threshold && deadline > Date.now();
}

export function getDeadlineStatus(deadline: number): {
  status: "overdue" | "due-soon" | "normal";
  message: string;
} {
  if (isOverdue(deadline)) {
    return {
      status: "overdue",
      message: "Overdue"
    };
  }
  
  if (isDueSoon(deadline)) {
    return {
      status: "due-soon",
      message: "Due soon"
    };
  }
  
  return {
    status: "normal",
    message: getTimeRemaining(deadline) || ""
  };
}
