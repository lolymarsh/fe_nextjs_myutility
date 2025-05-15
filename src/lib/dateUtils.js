// npm install dayjs
import dayjs from "dayjs";

export const fromEpochSeconds = (epochSeconds) => {
  if (!epochSeconds || isNaN(epochSeconds)) {
    return null; 
  }
  return dayjs.unix(epochSeconds); 
}

export const fromEpochMilliseconds = (epochMilliseconds) => {
  if (!epochMilliseconds || isNaN(epochMilliseconds)) {
    return null; 
  }
  return dayjs(epochMilliseconds); 
}

export const toEpochSeconds = (date) => {
  return dayjs(date).unix();
}

export const toEpochMilliseconds = (date) => {
  return dayjs(date).valueOf();
}

export const epochSecondsToDate = (epochSeconds) => {
  if (!epochSeconds || isNaN(epochSeconds || epochSeconds === 0)) {
    return "-"; 
  }
  return dayjs.unix(epochSeconds).format("DD/MM/YYYY HH:mm:ss");
}

export const epochMillisecondsToDate = (epochMilliseconds) => {
  if (!epochMilliseconds || isNaN(epochMilliseconds || epochMilliseconds === 0)) {
    return "-"; 
  }
  return dayjs(epochMilliseconds).format("DD/MM/YYYY HH:mm:ss");
}

export const epochMillisecondsToOnlyDate = (epochMilliseconds) => {
  if (!epochMilliseconds || isNaN(epochMilliseconds || epochMilliseconds === 0)) {
    return "-"; 
  }
  return dayjs(epochMilliseconds).format("DD/MM/YYYY");
}
