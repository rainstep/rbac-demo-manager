import moment from "moment";

const MOMENT_DATE_PATTERN = "YYYY-MM-DD";

const MOMENT_DATE_TIME_PATTERN = "YYYY-MM-DD HH:mm:ss";

export default {
  format(date, momentPattern) {
    return moment(date).format(momentPattern);
  },
  formatDate(date) {
    return moment(date).format(MOMENT_DATE_PATTERN);
  },
  formatDateTime(date) {
    return moment(date).format(MOMENT_DATE_TIME_PATTERN);
  },
  addDays(date, days) {
    return moment(date).add(days, "days");
  },
  subtractDays(date, days) {
    return moment(date).subtract(days, "days");
  },
  addMonths(date, months) {
    return moment(date).add(months, "months");
  },
  subtractMonths(date, months) {
    return moment(date).subtract(months, "months");
  }
};
