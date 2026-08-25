/**
 * Values for date inputs must be built from local date parts. Calling these
 * from an effect keeps the server render and the first client render aligned.
 */
function formatLocalDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function getLocalDateInputValue() {
  return formatLocalDate(new Date());
}

export function getLocalMonthInputValue() {
  return getLocalDateInputValue().slice(0, 7);
}

export function getLocalYear() {
  return new Date().getFullYear();
}
