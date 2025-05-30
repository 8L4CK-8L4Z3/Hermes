export const errorHandler = (res, code, message) => {
  return res.status(code).json({ errorMsg: message });
};

export const successHandler = (res, code, message, data = null) => {
  const response = { successMsg: message };
  if (data) {
    Object.assign(response, data);
  }
  return res.status(code).json(response);
};
