const supabase = require('../config/supabase');
const transporter = require('../config/mail');

const createInquiry = async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            company,
            preferredContactMethod,
            projectType,
            requirements,
            features,
            referenceWebsites,
            budget,
            deadline,
            notes
        } = req.body;


        // =============================================
        // VALIDATION
        // =============================================

        if (!name || name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid name.'
            });
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email.'
            });
        }

        if (!phone || phone.trim().length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid phone number.'
            });
        }

        if (!projectType) {
            return res.status(400).json({
                success: false,
                message: 'Please select a project type.'
            });
        }

        if (!requirements || requirements.trim().length < 5) {
            return res.status(400).json({
                success: false,
                message: 'Please describe your project requirements.'
            });
        }

        if (!budget) {
            return res.status(400).json({
                success: false,
                message: 'Please select a budget.'
            });
        }


        // =============================================
        // SAVE INQUIRY TO SUPABASE
        // =============================================

        const { data, error } = await supabase

            .from('inquiries')

            .insert({

                name: name.trim(),

                email: email.trim().toLowerCase(),

                phone: phone.trim(),

                company:
                    company
                        ? company.trim()
                        : null,

                preferred_contact_method:
                    preferredContactMethod || 'Email',

                project_type:
                    projectType,

                requirements:
                    requirements.trim(),

                features:
                    Array.isArray(features)
                        ? features
                        : [],

                reference_websites:
                    Array.isArray(referenceWebsites)
                        ? referenceWebsites
                        : [],

                budget,

                deadline:
                    deadline || null,

                notes:
                    notes
                        ? notes.trim()
                        : null,

                status: 'PENDING'

            })

            .select()

            .single();


        if (error) {

            console.error(
                'Supabase insert error:',
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    'Could not save the project request.'
            });
        }


        // =============================================
        // SEND TEAM NOTIFICATION EMAIL
        // =============================================

        try {

            await transporter.sendMail({

                from:
                    `"OFF-SCRIPT Website" <${process.env.MAIL_USER}>`,

                to:
                    process.env.MAIL_USER,

                replyTo:
                    email.trim().toLowerCase(),

                subject:
                    `New Project Request — ${name.trim()}`,

                html: `

                    <div style="
                        font-family:Arial,sans-serif;
                        max-width:700px;
                        margin:auto;
                        color:#222;
                        line-height:1.6;
                    ">

                        <h2>
                            New OFF-SCRIPT Project Request
                        </h2>

                        <p>
                            A new client has submitted
                            a project request.
                        </p>

                        <hr>

                        <h3>
                            Client Details
                        </h3>

                        <p>
                            <strong>Name:</strong>
                            ${name.trim()}
                        </p>

                        <p>
                            <strong>Email:</strong>
                            ${email.trim()}
                        </p>

                        <p>
                            <strong>Phone:</strong>
                            ${phone.trim()}
                        </p>

                        <p>
                            <strong>Company:</strong>
                            ${company ? company.trim() : 'Not provided'}
                        </p>

                        <p>
                            <strong>Preferred Contact:</strong>
                            ${preferredContactMethod || 'Email'}
                        </p>

                        <h3>
                            Project Details
                        </h3>

                        <p>
                            <strong>Project Type:</strong>
                            ${projectType}
                        </p>

                        <p>
                            <strong>Budget:</strong>
                            ${budget}
                        </p>

                        <p>
                            <strong>Deadline:</strong>
                            ${deadline || 'Flexible'}
                        </p>

                        <p>
                            <strong>Requirements:</strong>
                        </p>

                        <p>
                            ${requirements.trim()}
                        </p>

                        ${
                            notes
                                ? `
                                    <p>
                                        <strong>Additional Notes:</strong>
                                    </p>

                                    <p>
                                        ${notes.trim()}
                                    </p>
                                  `
                                : ''
                        }

                        <hr>

                        <p>
                            <strong>Inquiry ID:</strong>
                            ${data.id}
                        </p>

                        <p>
                            <strong>Status:</strong>
                            PENDING
                        </p>

                        <br>

                        <p>
                            Open the OFF-SCRIPT Admin Dashboard
                            to review this request.
                        </p>

                    </div>

                `

            });

            console.log(
                'Team notification email sent successfully.'
            );

        } catch (mailError) {

            console.error(
                'Team notification email error:',
                mailError
            );

            /*
             * Important:
             * The inquiry has already been saved.
             * We do not delete it just because email failed.
             */
        }


        // =============================================
        // SUCCESS
        // =============================================

        return res.status(201).json({

            success: true,

            message:
                'Project request received successfully.',

            inquiry: {

                id:
                    data.id,

                status:
                    data.status,

                submittedAt:
                    data.submitted_at

            }

        });


    } catch (error) {

        console.error(
            'Create inquiry error:',
            error
        );

        return res.status(500).json({

            success: false,

            message:
                'Something went wrong while submitting your request.'

        });

    }

};


module.exports = {
    createInquiry
};