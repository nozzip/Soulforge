import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export const formatRelativeDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: es });
  } catch (error) {
    return dateString;
  }
};
