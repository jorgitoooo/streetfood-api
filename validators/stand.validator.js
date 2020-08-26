exports.validTime = function validTime(val) {
  const r = new RegExp(/^[0-1]?[0-9]:[0-5][0-9] (am|pm)/);
  if (r.test(val) && val.length <= 8) {
    const hour = parseInt(val.split(":")[0], 10);

    return hour >= 1 && hour <= 12;
  }
  return false;
};
