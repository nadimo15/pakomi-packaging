// This is a mock email service for the frontend-only application.
// In a real-world scenario, this would be a backend service that sends emails.

/**
 * Simulates sending an email.
 * @param to The recipient's email address.
 * @param subject The subject of the email.
 * @param body The HTML or text body of the email.
 */
export const sendEmail = async (to: string, subject: string, body: string): Promise<void> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  console.log(`
  ==================================================
  📧 MOCK EMAIL SENT 📧
  --------------------------------------------------
  Recipient: ${to}
  Subject: ${subject}
  --------------------------------------------------
  Body:
  ${body}
  ==================================================
  `);

  // In a real app, you would make an API call to your backend here, e.g.:
  // await fetch('/api/send-email', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ to, subject, body }),
  // });
};
