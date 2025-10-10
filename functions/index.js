/* eslint-env node */
const { onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions');
const sgMail = require('@sendgrid/mail');
const cors = require('cors')({ origin: true });

// SendGrid Configuration
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_SENDER = process.env.SENDGRID_SENDER || 'hezitt0925@gmail.com';

if (!SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY environment variable is required');
}

sgMail.setApiKey(SENDGRID_API_KEY);
setGlobalOptions({ region: 'australia-southeast2' });

exports.sendEmail = onRequest((req, res) => {
  return cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Only POST allowed' });
    }

    try {
      const { to, subject, message, attachmentBase64, attachmentName } = req.body;

      if (!to || !subject || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const msg = {
        to,
        from: SENDGRID_SENDER,
        subject,
        text: message,
        html: `<p>${message}</p>`
      };

      // Add attachment if provided
      if (attachmentBase64 && attachmentName) {
        const cleanBase64 = attachmentBase64.replace(/^data:[^;]+;base64,/, '');
        msg.attachments = [{
          content: cleanBase64,
          filename: attachmentName,
          type: 'application/octet-stream',
          disposition: 'attachment'
        }];
      }

      const [response] = await sgMail.send(msg);

      return res.status(200).json({
        success: true,
        message: 'Email sent successfully',
        messageId: response?.headers?.['x-message-id']
      });

    } catch (error) {
      console.error('SendGrid Error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
});
