import nodemailer from 'nodemailer';

export const sendInterviewReportEmail = async (userEmail, userName, reportData, publicUrl) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: \`InterviewIQ <\${process.env.EMAIL_USER}>\`,
      to: userEmail,
      subject: 'Your InterviewIQ Performance Report',
      html: \`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Hello \${userName},</h2>
          <p>Your latest AI interview report is ready! Here is a quick summary of your performance:</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Role:</strong> \${reportData.role}</p>
            <p><strong>Final Score:</strong> \${reportData.finalScore}/10</p>
            <p><strong>Confidence:</strong> \${reportData.avgConfidence}/10</p>
            <p><strong>Communication:</strong> \${reportData.avgCommunication}/10</p>
            <p><strong>Correctness:</strong> \${reportData.avgCorrectness}/10</p>
          </div>

          <p>You can view your full detailed report and share it with others using the link below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="\${publicUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Full Report</a>
          </div>

          <p>Keep up the great work and continue practicing to build your streak!</p>
          <br/>
          <p>Best regards,<br/>The InterviewIQ Team</p>
        </div>
      \`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Report email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send report email:', error);
    return false;
  }
};
