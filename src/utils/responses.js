module.exports = {
  success: (response, data, message = 'Success') => {
    if (response && typeof response.send === 'function') {
      return response.send({ status: 'success', message, data });
    }
    return { status: 'success', message, data };
  },

  error: (response, message = 'Error', statusCode = 500, details = null) => {
    const payload = { status: 'error', message };
    if (details) payload.details = details;
    if (response && typeof response.send === 'function') {
      return response.status(statusCode).send(payload);
    }
    return { status: 'error', message, details, statusCode };
  }
};
