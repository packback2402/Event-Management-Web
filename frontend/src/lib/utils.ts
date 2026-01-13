import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

//kiem tra ngay thang hop le
export function isValidDateDMY(dateStr: string) {
  const [day, month, year] = dateStr.split('/').map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() + 1 === month &&
    date.getDate() === day
  );
}


export const dateToString = (date: Date | string) => {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${month}/${day}/${year}`;
};


export const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  return {
    day: date.getDate(),
    month: date.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    year: date.getFullYear(),
  };
};


// xu li filter upcoming, this day, this week cua su kien
export const isWithinRange = (eventDate: Date, filter: string) => {
    const now = new Date();
    const d = eventDate;

    switch (filter) {
        case 'Today':
            return d.toDateString() === now.toDateString();

        case 'Tomorrow': {
            const tomorrow = new Date();
            tomorrow.setDate(now.getDate() + 1);
            return d.toDateString() === tomorrow.toDateString();
        }

        case 'This Week': {
            const weekEnd = new Date();
            weekEnd.setDate(now.getDate() + 7);
            return d >= now && d <= weekEnd;
        }

        case 'This Month':
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();

        default: // "Upcoming"
            return d >= now;
    }
};
