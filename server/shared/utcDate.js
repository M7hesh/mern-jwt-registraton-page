const getUTCdate = () => {
  return new Date().toISOString().slice(0, 19).replace("T", " "); // convert the date to a string in ISO format, then remove the time and replace the 'T' with a space
};

module.exports = getUTCdate;
