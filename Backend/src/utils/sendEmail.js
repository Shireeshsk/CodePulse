import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
    try {
        const transport = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.SMTP_USER, // Your Gmail address
                pass: process.env.APP_PASSWORD // Your Gmail App Password
            }
        });

        const mailOptions = {
            from: `"CodePulse Support" <${process.env.SMTP_USER}>`,
            to: options.email,
            subject: options.subject,
            html: options.html,
        };

        await transport.sendMail(mailOptions);
    } catch (error) {
        console.error('Email transport error:', error);
        throw error;
    }
};
