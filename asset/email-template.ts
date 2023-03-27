export const getEmailTemplate = (token: string) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Password Reset Request</title>
          <style>
            /* your CSS styles */
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Dear User,</p>
              <p>You have requested a password reset for your account. To set a new password, please click on the button below:</p>
              <a href="http://localhost:3000/reset-pwd/${token}" class="button">Reset Password</a>
              <p>Thank you,</p>
              <p>Your 3ml Team</p>
            </div>
            <div class="footer">
              <p>If you did not initiate this request, please ignore this email and ensure that your account is secure.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };
  