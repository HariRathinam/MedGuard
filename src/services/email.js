const Catalyst = require('@zcatalyst/sdk');
const { dispatchEmailTemplate } = require('../config/constants');

const getCatalyst = (context) => {
  if (!context) {
    throw new Error('Catalyst request/context object is required');
  }
  return Catalyst.initialize(context);
};

const sendEmail = async (context, to, subject, body) => {
  const catalyst = getCatalyst(context);
  const emailService = catalyst.email();
  await emailService.send({
    from: dispatchEmailTemplate.from,
    to: [to],
    subject: `${dispatchEmailTemplate.subjectPrefix} ${subject}`,
    content: body
  });
};

module.exports = {
  sendEmail
};
