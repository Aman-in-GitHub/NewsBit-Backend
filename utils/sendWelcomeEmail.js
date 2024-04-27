import { supabase } from "../db.js";
import sendEmail from "./sendEmail.js";

export const sendWelcomeEmail = async (email, branch, semester) => {
  try {
    const { error } = await supabase
      .from("emails")
      .update({ isWelcomed: true })
      .eq("email", email);

    if (error) {
      console.log("Error sending welcome email:", error.message);
      return;
    }

    await sendEmail(
      email,
      "Welcome to NewsBit",
      welcomeHtml(email, branch, semester),
    );

    console.log("Welcome email sent successfully");
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};

const welcomeHtml = (mail, branch, semester) => {
  return `
  <!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
  <title> </title>
  <!--[if !mso]><!-- -->
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <!--<![endif]-->
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <!--[if !mso]><!-->

  <!--<![endif]-->
  <!--[if mso]>
      <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG />
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    <![endif]-->
  <!--[if lte mso 11]>
      <style type="text/css">
        .outlook-group-fix {
          width: 100% !important;
        }
      </style>
    <![endif]-->
</head>

<body style="
      background-color: #f9f9f9;
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    ">
  <div style="background-color: #f9f9f9">
    <!--[if mso | IE]>
      <table
         align="center" border="0" cellpadding="0" cellspacing="0" style="width:600px;" width="600"
      >
        <tr>
          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
      <![endif]-->

    <div style="
          background: #f9f9f9;
          background-color: #f9f9f9;
          margin: 0px auto;
          max-width: 600px;
        ">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="
            background: #f9f9f9;
            background-color: #f9f9f9;
            width: 100%;
            border-collapse: collapse;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
          ">
        <tbody>
          <tr>
            <td style="
                  border-bottom: #ffa31a solid 5px;
                  direction: ltr;
                  font-size: 0px;
                  padding: 20px 0;
                  text-align: center;
                  vertical-align: top;
                  border-collapse: collapse;
                  mso-table-lspace: 0pt;
                  mso-table-rspace: 0pt;
                ">
              <!--[if mso | IE]>
                  <table
                    role="presentation"
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                  >
                    <tr></tr>
                  </table>
                <![endif]-->
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!--[if mso | IE]>
          </td>
        </tr>
      </table>
      
      <table
         align="center" border="0" cellpadding="0" cellspacing="0" style="width:600px;" width="600"
      >
        <tr>
          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
      <![endif]-->

    <div style="
          background: #fff;
          background-color: #fff;
          margin: 0px auto;
          max-width: 600px;
        ">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="
            background: #fff;
            background-color: #fff;
            width: 100%;
            border-collapse: collapse;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
          ">
        <tbody>
          <tr>
            <td style="border: none;solid 1px: ;border-top: 0px;direction: ltr;font-size: 0px;padding: 20px 0;text-align: center;vertical-align: top;border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;">
              <!--[if mso | IE]>
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                
        <tr>
      
            <td
               style="vertical-align:bottom;width:600px;"
            >
          <![endif]-->

              <div class="mj-column-per-100 outlook-group-fix" style="
                    font-size: 13px;
                    text-align: left;
                    direction: ltr;
                    display: inline-block;
                    vertical-align: bottom;
                    width: 100%;
                  ">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="
                      vertical-align: bottom;
                      border-collapse: collapse;
                      mso-table-lspace: 0pt;
                      mso-table-rspace: 0pt;
                    " width="100%">
                  <tr>
                    <td align="center" style="
                          font-size: 0px;
                          padding: 10px 25px;
                          word-break: break-word;
                          border-collapse: collapse;
                          mso-table-lspace: 0pt;
                          mso-table-rspace: 0pt;
                        ">
                      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="
                            border-collapse: collapse;
                            border-spacing: 0px;
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                          ">
                        <tbody>
                          <tr>
                            <td style="
                                  width: 64px;
                                  border-collapse: collapse;
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                ">
                              <a href="newsbit.amanchand.com.np" target="_blank">
                                  <img height="auto" src="https://i.postimg.cc/7Z0MBvDd/NewsBit.png" alt="NewsBit Logo" style="
                                    border: 0;
                                    display: block;
                                    outline: none;
                                    text-decoration: none;
                                    width: 100%;
                                    height: auto;
                                    line-height: 100%;
                                    -ms-interpolation-mode: bicubic;
                                  " width="64"  />
                              </a>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td align="center" style="
                          font-size: 0px;
                          padding: 10px 25px;
                          padding-bottom: 40px;
                          word-break: break-word;
                          border-collapse: collapse;
                          mso-table-lspace: 0pt;
                          mso-table-rspace: 0pt;
                        ">
                      <div style="
                            font-family: &quot;Helvetica Neue&quot;, Arial,
                              sans-serif;
                            font-size: 28px;
                            font-weight: bold;
                            line-height: 1;
                            text-align: center;
                            color: #1b1b1b;
                          ">
                        Welcome To NewsBit
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td align="left" style="
                          font-size: 0px;
                          padding: 10px 25px;
                          word-break: break-word;
                          border-collapse: collapse;
                          mso-table-lspace: 0pt;
                          mso-table-rspace: 0pt;
                        ">
                      <div style="
                            font-family: &quot;Helvetica Neue&quot;, Arial,
                              sans-serif;
                            font-size: 20px;
                            line-height: 22px;
                            text-align: center;
                            color: #ffa31a;
                            padding-bottom: 20px;
                            font-weight: bold;
                          ">
                        Thank you for subscribing to our Newsletter
                      </div>
                      <div style="
                            font-family: &quot;Helvetica Neue&quot;, Arial,
                              sans-serif;
                            font-size: 16px;
                            line-height: 22px;
                            text-align: left;
                            color: #1b1b1b;text-align:center;
                          ">
                        We will alert you whenever we get a new notice for ${branch} ${semester} semester. You won't be spammed by unnecessary messages. So whenever you get an email from us you can be assured that it's important to you.
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td align="center" style="
                          font-size: 0px;
                          padding: 10px 25px;
                          padding-top: 30px;
                          padding-bottom: 50px;
                          word-break: break-word;
                          border-collapse: collapse;
                          mso-table-lspace: 0pt;
                          mso-table-rspace: 0pt;
                        ">
                      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="
                            border-collapse: separate;
                            line-height: 100%;
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                          ">
                        <tr>
                          <td align="center" bgcolor="#ffa31a" role="presentation" style="
                                color: #ffffff;
                                cursor: pointer;
                                border-collapse: collapse;
                                mso-table-lspace: 0pt;
                                mso-table-rspace: 0pt;
                              " valign="middle">
                            <a href="newsbit.amanchand.com.np" target="_blank" style="
                                  background: #ffa31a;
                                  color: #ffffff;
                                  font-family: &quot;Helvetica Neue&quot;, Arial,
                                    sans-serif;
                                  font-size: 15px;
                                  font-weight: bold;
                                  line-height: 120%;
                                  margin: 0;
                                  text-decoration: none;
                                  text-transform: none;
                                  padding: 15px 25px;
                                  border: none;
                                  border-radius: 5px;
                                ">
                              Visit NewsBit
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td align="left" style="
                          font-size: 0px;
                          padding: 10px 25px;
                          word-break: break-word;
                          border-collapse: collapse;
                          mso-table-lspace: 0pt;
                          mso-table-rspace: 0pt;
                        ">
                      <div style="
                            font-family: &quot;Helvetica Neue&quot;, Arial,
                              sans-serif;
                            font-size: 14px;
                            line-height: 20px;
                            text-align: left;
                            color: #1b1b1b;
                          ">
                        Best regards,<br /><br />Aman Chand<br />
                        <a href="https://amanchand.com.np" target="_blank" style="color: #ffa31a">amanchand.com.np</a>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

              <!--[if mso | IE]>
            </td>
          
        </tr>
      
                  </table>
                <![endif]-->
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!--[if mso | IE]>
          </td>
        </tr>
      </table>
      
      <table
         align="center" border="0" cellpadding="0" cellspacing="0" style="width:600px;" width="600"
      >
        <tr>
          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
      <![endif]-->

    <div style="margin: 0px auto; max-width: 600px"></div>

    <!--[if mso | IE]>
          </td>
        </tr>
      </table>
      <![endif]-->
  </div>
</body>

</html>
  `;
};
