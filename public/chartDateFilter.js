moment.updateLocale("en", {week: {dow: 1}});

const range = (max) => Array.from({length: max}, (_x, i) => i);

const createLabels = (filter) => {
  const now = moment();
  switch (filter) {
    case "day":
      return Array.from({length: 24}, (_x, i) => i + "h");
    case "week":
      return ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
    case "month":
      const daysInMonth = now.daysInMonth();
      const days = [];
      for (let i = 1; i <= daysInMonth; i++) {
        days.push((i < 10 ? "0" : "") + i + "/" + now.format("MM"));

      }
      return days;
    case "year":
      return ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    case "last_years":
      const year = moment().year();
      const years = [];
      for (let i = year - 10; i <= year; i++) {
        years.push(i);
      }
      return years;
  }
}

const filterLogs = (filter, logs) => {
  const now = moment();

  switch (filter) {
    case "day":
      const logsByHour = [];
      for (let i of range(24)) {
        logsByHour.push(logs.filter(log => {
          const date = moment(log.time);
          if (!date.isSame(now, "day")) {
            return false;
          }
          return date.hour() == i;
        }).length);
      }
      return logsByHour;
    case "week":
      const logsByWeek = [];
      for (let i of range(7)) {
        logsByWeek.push(logs.filter(log => {
          const date = moment(log.time);
          if (!date.isSame(now, "week")) {
            return false;
          }

          return date.weekday() == i;
        }).length);
      }
      return logsByWeek;
    case "month":
      const logsByDate = [];
      for (let i of range(now.daysInMonth())) {
        logsByDate.push(logs.filter(log => {
          const date = moment(log.time);
          if (!date.isSame(now, "month")) {
            return false;
          }

          return (date.date() - 1) == i;
        }).length);
      }
      return logsByDate;
    case "year":
      const logsByMonth = [];
      for (let i of range(12)) {
        logsByMonth.push(logs.filter(log => {
          const date = moment(log.time);
          if (!date.isSame(now, "year")) {
            return false;
          }

          return date.month() == i;
        }).length);
      }
      return logsByMonth;
    case "last_years":
      const logsByYear = [];
      const year = now.year();
      for (let i = year - 10; i <= year; i++) {
        logsByYear.push(logs.filter(log => {
          const date = moment(log.time);
          return date.year() == i;
        }).length);
      }
      return logsByYear;
  }
}

window.createChartLabels = createLabels;
window.filterLogs = filterLogs;
