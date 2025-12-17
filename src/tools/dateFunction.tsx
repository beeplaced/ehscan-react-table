export const calcDateDiff = (date: string) => {
  const targetDate = new Date(date);
  const currentDate = new Date();
  targetDate.setHours(0, 0, 0, 0);
  currentDate.setHours(0, 0, 0, 0);
  const msInDay = 24 * 60 * 60 * 1000;
  const daysDiff = Math.floor((targetDate.getTime() - currentDate.getTime()) / msInDay);
  const daysLate = Math.abs(daysDiff);
  let dueDateType

  switch (true) {
    case daysDiff === 0:
      dueDateType = 'dueToday';
      break;

    case daysDiff > 0 && daysDiff <= 7:
      dueDateType = 'upcomingDueDate';
      break;

    case daysDiff > 7:
      dueDateType = 'futureDueDate';
      break;

    case daysDiff < 0 && daysLate <= 3:
      dueDateType = 'overdueDueDate';
      break;

    case daysDiff < 0 && daysLate <= 25:
      dueDateType = 'longOverdue';
      break;

    case daysDiff < 0 && daysLate > 25:
      dueDateType = 'criticallyOverdue';
      break;

    default:
      dueDateType = 'dateTagUnknown';
      break;
  }

  return dueDateType
};

export const formatToDDMMYYYY = (input: string, short = false) => {
  const date = new Date(input);
  if (isNaN(date.getTime())) return undefined;

  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  const currentYear = new Date().getUTCFullYear();

  if (short && year === currentYear) {
    return `${day}.${month}.`; // omit year if short and current year
  }

  return `${day}.${month}.${year}`;
};

