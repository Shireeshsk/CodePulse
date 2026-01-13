import { sendEmail } from '../../utils/sendEmail.js';

export const SubmitFeedback = async (req, res) => {
    const { rating, feedback } = req.body;
    const user = req.user; // From authentication middleware

    try {
        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                message: 'Rating must be between 1 and 5 stars'
            });
        }

        // Validate feedback (optional but should be a string if provided)
        if (feedback && typeof feedback !== 'string') {
            return res.status(400).json({
                message: 'Feedback must be a valid text'
            });
        }

        // Prepare star rating display
        const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);

        // Create email HTML content
        const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #ffffff; border: 1px solid #e1e4e8; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <h2 style="color: #137fec; margin-top: 0; text-align: center;">New User Feedback Received</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">User Information</h3>
          <p style="color: #444; font-size: 14px; margin: 5px 0;"><strong>User ID:</strong> ${user.id}</p>
          <p style="color: #444; font-size: 14px; margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
        </div>

        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3 style="color: #333; margin-top: 0;">Rating</h3>
          <div style="text-align: center; margin: 15px 0;">
            <span style="font-size: 32px; letter-spacing: 4px;">${stars}</span>
          </div>
          <p style="text-align: center; color: #666; font-size: 18px; font-weight: bold; margin: 10px 0;">${rating} out of 5 stars</p>
        </div>

        ${feedback ? `
        <div style="background-color: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #137fec;">
          <h3 style="color: #333; margin-top: 0;">Feedback / Suggestions / Complaints</h3>
          <p style="color: #444; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${feedback}</p>
        </div>
        ` : '<p style="color: #999; font-style: italic; text-align: center;">No additional feedback provided.</p>'}

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px;">
          <p>Received on: ${new Date().toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })}</p>
          &copy; 2026 CodePulse - Master the Art of Coding
        </div>
      </div>
    `;

        // Send email to admin (using the same email that sends OTPs)
        try {
            await sendEmail({
                email: process.env.SMTP_USER, // Send to your own email
                subject: `CodePulse Feedback - ${rating} Star Rating from ${user.email}`,
                html: html
            });

            return res.status(200).json({
                message: 'Thank you for your feedback! We appreciate your input.'
            });
        } catch (emailError) {
            console.error('Email Sending failed:', emailError);
            return res.status(500).json({
                message: 'Failed to submit feedback. Please try again later.'
            });
        }

    } catch (error) {
        console.error('Submit Feedback Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
