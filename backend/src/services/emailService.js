const nodemailer = require("nodemailer");

/*
=========================================================
OFF-SCRIPT EMAIL SERVICE
=========================================================

This file handles all emails sent by the backend.

Emails we will use:
1. New project inquiry → OFF-SCRIPT team
2. Project accepted → Client
3. Project declined → Client
=========================================================
*/


// =====================================================
// CREATE EMAIL TRANSPORTER
// =====================================================

const transporter = nodemailer.createTransport({

    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }

});


// =====================================================
// VERIFY EMAIL CONNECTION
// =====================================================

async function verifyEmailConnection() {

    try {

        await transporter.verify();

        console.log("✓ Email service connected successfully.");

    } catch (error) {

        console.error(
            "✗ Email service connection failed:",
            error.message
        );

    }

}


// =====================================================
// SEND EMAIL
// =====================================================

async function sendEmail({
    to,
    subject,
    html
}) {

    if (!to) {

        throw new Error(
            "Email recipient is required."
        );

    }


    const mailOptions = {

        from: `"OFF-SCRIPT" <${process.env.EMAIL_USER}>`,

        to,

        subject,

        html

    };


    const info =
        await transporter.sendMail(
            mailOptions
        );


    console.log(
        "✓ Email sent:",
        info.messageId
    );


    return info;

}


// =====================================================
// NEW INQUIRY → TEAM
// =====================================================

async function sendNewInquiryEmail(
    inquiry
) {

    const teamEmail =
        process.env.TEAM_EMAIL;


    if (!teamEmail) {

        throw new Error(
            "TEAM_EMAIL is not configured."
        );

    }


    return sendEmail({

        to: teamEmail,

        subject:
            `New Project Request — ${inquiry.name}`,

        html: `

            <div
                style="
                    font-family:Arial,sans-serif;
                    max-width:700px;
                    margin:auto;
                    padding:30px;
                    color:#111;
                "
            >

                <h2>
                    New Project Request
                </h2>

                <p>
                    A new project request has been
                    submitted through the OFF-SCRIPT website.
                </p>


                <hr>


                <h3>
                    Client Details
                </h3>

                <p>
                    <strong>Name:</strong>
                    ${escapeHTML(inquiry.name)}
                </p>

                <p>
                    <strong>Email:</strong>
                    ${escapeHTML(inquiry.email)}
                </p>

                <p>
                    <strong>Phone:</strong>
                    ${escapeHTML(inquiry.phone)}
                </p>

                <p>
                    <strong>Company:</strong>
                    ${escapeHTML(
                        inquiry.company || "Not provided"
                    )}
                </p>


                <h3>
                    Project Details
                </h3>

                <p>
                    <strong>Project Type:</strong>
                    ${escapeHTML(
                        inquiry.project_type || ""
                    )}
                </p>

                <p>
                    <strong>Budget:</strong>
                    ${escapeHTML(
                        inquiry.budget || ""
                    )}
                </p>

                <p>
                    <strong>Deadline:</strong>
                    ${escapeHTML(
                        inquiry.deadline || "Flexible"
                    )}
                </p>

                <p>
                    <strong>Requirements:</strong>
                </p>

                <p>
                    ${escapeHTML(
                        inquiry.requirements || ""
                    )}
                </p>


                <hr>


                <p
                    style="
                        color:#777;
                        font-size:13px;
                    "
                >
                    Please review this request in the
                    OFF-SCRIPT admin dashboard.
                </p>

            </div>

        `

    });

}


// =====================================================
// PROJECT ACCEPTED → CLIENT
// =====================================================

async function sendProjectAcceptedEmail(
    project
) {

    return sendEmail({

        to: project.client_email,

        subject:
            `Your OFF-SCRIPT Project Has Been Confirmed — ${project.project_id}`,

        html: `

            <div
                style="
                    font-family:Arial,sans-serif;
                    max-width:650px;
                    margin:auto;
                    padding:30px;
                    color:#111;
                "
            >

                <h2>
                    Your project has been confirmed.
                </h2>

                <p>
                    Hello
                    <strong>
                        ${escapeHTML(
                            project.client_name || "Client"
                        )}
                    </strong>,
                </p>

                <p>
                    Thank you for discussing your project
                    with the OFF-SCRIPT team.
                </p>

                <p>
                    We are happy to confirm that we will
                    be proceeding with your project.
                </p>


                <div
                    style="
                        margin:25px 0;
                        padding:22px;
                        border:1px solid #ddd;
                        border-radius:12px;
                        text-align:center;
                    "
                >

                    <p
                        style="
                            margin:0 0 8px;
                            font-size:12px;
                            color:#777;
                            text-transform:uppercase;
                            letter-spacing:1px;
                        "
                    >
                        Your Project ID
                    </p>

                    <div
                        style="
                            font-size:24px;
                            font-weight:bold;
                            letter-spacing:2px;
                        "
                    >
                        ${escapeHTML(
                            project.project_id
                        )}
                    </div>

                </div>


                <p>
                    Keep this Project ID safe.
                    You will need it along with your
                    registered email address to access
                    your client dashboard.
                </p>


                <p>
                    You can access your client dashboard
                    through the OFF-SCRIPT client login page.
                </p>


                <hr>


                <p
                    style="
                        color:#777;
                        font-size:13px;
                    "
                >
                    This is an automated message from
                    OFF-SCRIPT.
                </p>

            </div>

        `

    });

}


// =====================================================
// PROJECT DECLINED → CLIENT
// =====================================================

async function sendProjectDeclinedEmail(
    inquiry
) {

    return sendEmail({

        to: inquiry.email,

        subject:
            "Update Regarding Your OFF-SCRIPT Project Request",

        html: `

            <div
                style="
                    font-family:Arial,sans-serif;
                    max-width:650px;
                    margin:auto;
                    padding:30px;
                    color:#111;
                "
            >

                <h2>
                    Update regarding your project request
                </h2>

                <p>
                    Hello
                    <strong>
                        ${escapeHTML(
                            inquiry.name || "Client"
                        )}
                    </strong>,
                </p>

                <p>
                    Thank you for taking the time to
                    discuss your project with the
                    OFF-SCRIPT team.
                </p>

                <p>
                    After reviewing the project requirements,
                    we are unable to proceed with the project
                    at this time.
                </p>

                <p>
                    We sincerely apologize for any
                    inconvenience this may cause and
                    appreciate your understanding.
                </p>

                <p>
                    We wish you the best with your project.
                </p>


                <hr>


                <p
                    style="
                        color:#777;
                        font-size:13px;
                    "
                >
                    This is an automated message from
                    OFF-SCRIPT.
                </p>

            </div>

        `

    });

}


// =====================================================
// HTML ESCAPE
// =====================================================

function escapeHTML(value) {

    return String(value ?? "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


// =====================================================
// EXPORTS
// =====================================================

module.exports = {

    transporter,

    verifyEmailConnection,

    sendEmail,

    sendNewInquiryEmail,

    sendProjectAcceptedEmail,

    sendProjectDeclinedEmail

};