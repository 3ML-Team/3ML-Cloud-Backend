export const getResetPaswordEmailTemplate = (token: string) => {
    return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Password Reset Request</title>
        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            margin: 0;
            padding: 0;
          }
          .container {
            margin: 20px;
            margin: 0 auto;
            margin: 40px;
            background-color: rgb(243, 246, 252);
            border-radius: 25px;
          }
          .header {
            color: rgb(34, 34, 34);
            text-align: center;
            padding-top: 10px;
          }
          .content {
            background-color: #fff;
            margin: 20px;
            padding: 20px;
            border-radius: 20px;
          }
          .content p {
            font-size: 16px;
            line-height: 24px;
            margin-bottom: 20px;
          }
          .button {
            display: block;
            width: 200px;
            height: 40px;
            background-color: rgb(194, 231, 255);
            color: #000;
            text-align: center;
            line-height: 40px;
            font-size: 16px;
            text-decoration: none;
            margin: 20px auto;
            border-radius: 15px;
            transition: .2s;
          }
          .button:hover {
            background-color: rgb(178, 215, 239);
            box-shadow: 0 2px 10px 0 #0000, 0 2px 10px 2px #0000;
          }
          .footer {
            color: rgb(88, 89, 90);
            padding-bottom: 5px;
            font-size: 12px;
            text-align: center;
          }
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
    </html>`;
  };