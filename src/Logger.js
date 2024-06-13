const timestampOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
};

const timestamp = () => {
  const date = new Date();
  return `[${date.toLocaleString(Intl.DateTimeFormat().resolvedOptions().locale, timestampOptions)}]`;
};

console._log = console.log;
console._debug = console.debug;
console._error = console.error;
console._info = console.info;

console.log = (...data) => {
  console._log(`${timestamp()} [LOG]`, ...data);
};

console.debug = (...data) => {
  if (process.env.DEBUG !== "true") return;
  console._debug(`${timestamp()} [DEBUG]`, ...data);
};

console.error = (...data) => {
  console._error(`${timestamp()} [ERROR]`, ...data);
};

console.info = (...data) => {
  console._info(`${timestamp()} [INFO]`, ...data);
};
