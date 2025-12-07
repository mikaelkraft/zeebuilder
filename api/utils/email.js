
import { Resend } from 'resend';

// Initialize Resend with API key from environment variables
// If no key is provided, it will fallback to console logging (mock mode)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const sendEmail = async ({ to, subject, html }) => {
  if (resend) {
    try {
      const data = await resend.emails.send({
        from: 'ZeeBuilder <noreply@zeebuilder.com>',
        to,
        subject,
        html,
      });
      return { success: true, data };
    } catch (error) {
      console.error('Failed to send email:', error);
      return { success: false, error };
    }
  } else {
    // Mock mode
    console.log('---------------------------------------------------');
    console.log(`[MOCK EMAIL] To: ${to}`);
    console.log(`[MOCK EMAIL] Subject: ${subject}`);
    console.log(`[MOCK EMAIL] Content: ${html}`);
    console.log('---------------------------------------------------');
    return { success: true, mock: true };
  }
};
