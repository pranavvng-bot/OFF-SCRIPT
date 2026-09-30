const express = require('express');
const router = express.Router();

const supabase = require('../config/supabase');
const transporter = require('../config/mail');


// =====================================================
// GENERATE UNIQUE PROJECT ID
// =====================================================

async function generateProjectId() {

    const year = new Date().getFullYear();

    let projectId;
    let exists = true;

    while (exists) {

        const randomNumber =
            Math.floor(10000 + Math.random() * 90000);

        projectId =
            `OFF-${year}-${randomNumber}`;


        const { data } =
            await supabase

                .from('projects')

                .select('id')

                .eq('project_id', projectId)

                .maybeSingle();


        exists = !!data;
    }

    return projectId;
}


// =====================================================
// PROCEED WITH PROJECT
// Creates project + sends Project ID email
// =====================================================

router.post(
    '/proceed/:inquiryId',
    async (req, res) => {

        try {

            const { inquiryId } =
                req.params;


            // ---------------------------------------------
            // 1. GET INQUIRY
            // ---------------------------------------------

            const {
                data: inquiry,
                error: inquiryError
            } = await supabase

                .from('inquiries')

                .select('*')

                .eq('id', inquiryId)

                .single();


            if (inquiryError || !inquiry) {

                console.error(
                    'Inquiry error:',
                    inquiryError
                );

                return res.status(404).json({

                    success: false,

                    message:
                        'Inquiry not found.'

                });

            }


            // ---------------------------------------------
            // 2. CHECK STATUS
            // ---------------------------------------------

            if (
                String(inquiry.status).toUpperCase()
                === 'ACCEPTED'
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'This project has already been accepted.'

                });

            }


            if (
                String(inquiry.status).toUpperCase()
                === 'DECLINED'
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'This inquiry has already been declined.'

                });

            }


            // ---------------------------------------------
            // 3. GENERATE PROJECT ID
            // ---------------------------------------------

            const projectId =
                await generateProjectId();


            // ---------------------------------------------
            // 4. CREATE PROJECT
            // ---------------------------------------------

            const {
                data: project,
                error: projectError
            } = await supabase

                .from('projects')

                .insert({

                    project_id:
                        projectId,

                    inquiry_id:
                        inquiry.id,

                    client_name:
                        inquiry.name,

                    client_email:
                        inquiry.email,

                    client_phone:
                        inquiry.phone,

                    company:
                        inquiry.company,

                    project_type:
                        inquiry.project_type,

                    requirements:
                        inquiry.requirements,

                    features:
                        inquiry.features || [],

                    reference_websites:
                        inquiry.reference_websites || [],

                    budget:
                        inquiry.budget,

                    deadline:
                        inquiry.deadline,

                    status:
                        'PLANNING',

                    progress:
                        0,

                    current_stage:
                        'Project Confirmed'

                })

                .select()

                .single();


            if (projectError) {

                console.error(
                    'Project creation error:',
                    projectError
                );

                return res.status(500).json({

                    success: false,

                    message:
                        'Failed to create project.'

                });

            }


            // ---------------------------------------------
            // 5. UPDATE INQUIRY STATUS
            // ---------------------------------------------

            const {
                error: updateError
            } = await supabase

                .from('inquiries')

                .update({

                    status:
                        'ACCEPTED'

                })

                .eq(
                    'id',
                    inquiry.id
                );


            if (updateError) {

                console.error(
                    'Inquiry update error:',
                    updateError
                );

                return res.status(500).json({

                    success: false,

                    message:
                        'Project created but inquiry status could not be updated.'

                });

            }


            // ---------------------------------------------
            // 6. SEND PROJECT ID TO CLIENT
            // ---------------------------------------------

            try {

                await transporter.sendMail({

                    from:
                        `"OFF-SCRIPT" <${process.env.MAIL_USER}>`,

                    to:
                        inquiry.email,

                    subject:
                        `Your OFF-SCRIPT Project Has Been Confirmed — ${projectId}`,

                    html: `

                        <div style="
                            font-family:Arial,sans-serif;
                            max-width:700px;
                            margin:auto;
                            padding:30px;
                            color:#222;
                        ">

                            <h2>
                                Your project has been confirmed.
                            </h2>

                            <p>
                                Hi ${inquiry.name},
                            </p>

                            <p>
                                Thank you for speaking with
                                the OFF-SCRIPT team.
                                We are happy to confirm that
                                we will be proceeding with your
                                project.
                            </p>

                            <div style="
                                margin:25px 0;
                                padding:25px;
                                background:#f5f5f5;
                                border-radius:10px;
                                text-align:center;
                            ">

                                <p style="
                                    margin:0 0 8px;
                                    font-size:13px;
                                    color:#777;
                                ">
                                    YOUR PROJECT ID
                                </p>

                                <h1 style="
                                    margin:0;
                                    letter-spacing:2px;
                                ">
                                    ${projectId}
                                </h1>

                            </div>

                            <p>
                                Please keep this Project ID safe.
                                You will need it along with your
                                registered email address to log in
                                to your client dashboard.
                            </p>

                            <p>
                                <strong>
                                    Project:
                                </strong>
                                ${inquiry.project_type}
                            </p>

                            <p>
                                <strong>
                                    Company:
                                </strong>
                                ${inquiry.company || 'Not provided'}
                            </p>

                            <hr>

                            <p>
                                You can now access your
                                OFF-SCRIPT client dashboard using
                                your email address and Project ID.
                            </p>

                            <p>
                                Regards,<br>
                                <strong>
                                    OFF-SCRIPT Team
                                </strong>
                            </p>

                        </div>

                    `

                });


                console.log(
                    'Project ID email sent to client.'
                );


            } catch (mailError) {

                console.error(
                    'Project ID email failed:',
                    mailError
                );

            }


            // ---------------------------------------------
            // 7. RESPONSE
            // ---------------------------------------------

            return res.json({

                success: true,

                message:
                    'Project accepted and created successfully.',

                project

            });


        } catch (error) {

            console.error(
                'Proceed project error:',
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    'Server error while accepting project.'

            });

        }

    }
);


// =====================================================
// DECLINE PROJECT
// Updates inquiry + sends apology email
// =====================================================

router.post(
    '/decline/:inquiryId',
    async (req, res) => {

        try {

            const { inquiryId } =
                req.params;


            // ---------------------------------------------
            // 1. GET INQUIRY
            // ---------------------------------------------

            const {
                data: inquiry,
                error: inquiryError
            } = await supabase

                .from('inquiries')

                .select('*')

                .eq('id', inquiryId)

                .single();


            if (inquiryError || !inquiry) {

                return res.status(404).json({

                    success: false,

                    message:
                        'Inquiry not found.'

                });

            }


            // ---------------------------------------------
            // 2. CHECK STATUS
            // ---------------------------------------------

            if (
                String(inquiry.status).toUpperCase()
                === 'ACCEPTED'
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'This project has already been accepted.'

                });

            }


            if (
                String(inquiry.status).toUpperCase()
                === 'DECLINED'
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'This inquiry has already been declined.'

                });

            }


            // ---------------------------------------------
            // 3. UPDATE STATUS
            // ---------------------------------------------

            const {
                error: updateError
            } = await supabase

                .from('inquiries')

                .update({

                    status:
                        'DECLINED'

                })

                .eq(
                    'id',
                    inquiry.id
                );


            if (updateError) {

                console.error(
                    'Decline update error:',
                    updateError
                );

                return res.status(500).json({

                    success: false,

                    message:
                        'Could not decline this inquiry.'

                });

            }


            // ---------------------------------------------
            // 4. SEND APOLOGY EMAIL
            // ---------------------------------------------

            try {

                await transporter.sendMail({

                    from:
                        `"OFF-SCRIPT" <${process.env.MAIL_USER}>`,

                    to:
                        inquiry.email,

                    subject:
                        'Update Regarding Your OFF-SCRIPT Project Request',

                    html: `

                        <div style="
                            font-family:Arial,sans-serif;
                            max-width:700px;
                            margin:auto;
                            padding:30px;
                            color:#222;
                        ">

                            <h2>
                                Update Regarding Your Project Request
                            </h2>

                            <p>
                                Hi ${inquiry.name},
                            </p>

                            <p>
                                Thank you for taking the time
                                to speak with the OFF-SCRIPT team
                                and for considering us for your
                                project.
                            </p>

                            <p>
                                After reviewing the project
                                requirements, unfortunately we
                                will not be able to proceed with
                                the project at this time.
                            </p>

                            <p>
                                We sincerely apologize for any
                                inconvenience this may cause.
                            </p>

                            <p>
                                We appreciate your interest in
                                OFF-SCRIPT and wish you the very
                                best with your project.
                            </p>

                            <hr>

                            <p>
                                Regards,<br>
                                <strong>
                                    OFF-SCRIPT Team
                                </strong>
                            </p>

                        </div>

                    `

                });


                console.log(
                    'Decline email sent to client.'
                );


            } catch (mailError) {

                console.error(
                    'Decline email failed:',
                    mailError
                );

            }


            // ---------------------------------------------
            // 5. RESPONSE
            // ---------------------------------------------

            return res.json({

                success: true,

                message:
                    'Inquiry declined successfully.'

            });


        } catch (error) {

            console.error(
                'Decline project error:',
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    'Server error while declining inquiry.'

            });

        }

    }
);


// =====================================================
// GET CLIENT PROJECTS
// =====================================================

router.get(
    '/client/:email',
    async (req, res) => {

        try {

            const { email } =
                req.params;


            const {
                data: projects,
                error
            } = await supabase

                .from('projects')

                .select('*')

                .eq(
                    'client_email',
                    email
                )

                .order(
                    'created_at',
                    {
                        ascending: false
                    }
                );


            if (error) {

                console.error(
                    'Client project error:',
                    error
                );

                return res.status(500).json({

                    success: false,

                    message:
                        'Failed to load client project.'

                });

            }


            return res.json({

                success: true,

                projects:
                    projects || []

            });


        } catch (error) {

            console.error(
                'Client project server error:',
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    'Server error while loading project.'

            });

        }

    }
);


// =====================================================
// CLIENT LOGIN
// Email + Project ID
// =====================================================

router.post(
    '/login',
    async (req, res) => {

        try {

            const {
                email,
                projectId
            } = req.body;


            if (!email || !projectId) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Email and Project ID are required.'

                });

            }


            const {
                data: project,
                error
            } = await supabase

                .from('projects')

                .select('*')

                .eq(
                    'client_email',
                    email.trim().toLowerCase()
                )

                .eq(
                    'project_id',
                    projectId.trim()
                )

                .single();


            if (error || !project) {

                return res.status(401).json({

                    success: false,

                    message:
                        'Invalid email or Project ID.'

                });

            }


            return res.json({

                success: true,

                project

            });


        } catch (error) {

            console.error(
                'Client login error:',
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    'Login failed.'

            });

        }

    }
);


// =====================================================
// ADMIN - GET ALL CLIENT REQUESTS
// =====================================================

router.get(
    '/admin/inquiries',
    async (req, res) => {

        try {

            const {
                data: inquiries,
                error
            } = await supabase

                .from('inquiries')

                .select('*')

                .order(
                    'submitted_at',
                    {
                        ascending: false
                    }
                );


            if (error) {

                console.error(
                    'Admin inquiries error:',
                    error
                );

                return res.status(500).json({

                    success: false,

                    message:
                        'Failed to load client requests.'

                });

            }


            return res.json({

                success: true,

                inquiries:
                    inquiries || []

            });


        } catch (error) {

            console.error(
                'Admin inquiries server error:',
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    'Server error while loading client requests.'

            });

        }

    }
);


module.exports = router;