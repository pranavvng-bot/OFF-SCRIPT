const supabase = require('../config/supabase');


// =====================================================
// CREATE CLIENT ENQUIRY
// =====================================================

const createEnquiry = async (req, res) => {

    try {

        const {
            projectId,
            clientEmail,
            message
        } = req.body;


        if (!projectId || !clientEmail || !message) {

            return res.status(400).json({
                success: false,
                message: 'Project ID, email and message are required.'
            });
        }


        const email =
            clientEmail.trim().toLowerCase();


        // Verify project belongs to client
        const { data: project, error: projectError } =
            await supabase
                .from('projects')
                .select('id, project_id, client_email')
                .eq('project_id', projectId)
                .eq('client_email', email)
                .single();


        if (projectError || !project) {

            return res.status(403).json({
                success: false,
                message: 'Project not found for this client.'
            });
        }


        // Save enquiry
        const { data, error } =
            await supabase
                .from('enquiries')
                .insert({
                    project_id: project.id,
                    client_email: email,
                    message: message.trim(),
                    status: 'PENDING'
                })
                .select()
                .single();


        if (error) {

            console.error(
                'Create enquiry error:',
                error
            );

            return res.status(500).json({
                success: false,
                message: 'Could not submit enquiry.'
            });
        }


        return res.status(201).json({

            success: true,

            message: 'Enquiry submitted successfully.',

            enquiry: data
        });


    } catch (error) {

        console.error(
            'Create enquiry error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Something went wrong.'
        });
    }
};



// =====================================================
// GET CLIENT ENQUIRIES
// =====================================================

const getClientEnquiries = async (req, res) => {

    try {

        const {
            projectId,
            email
        } = req.params;


        const clientEmail =
            decodeURIComponent(email)
                .trim()
                .toLowerCase();


        // Verify project belongs to client
        const {
            data: project,
            error: projectError
        } = await supabase
            .from('projects')
            .select('id')
            .eq('project_id', projectId)
            .eq('client_email', clientEmail)
            .single();


        if (projectError || !project) {

            return res.status(403).json({
                success: false,
                message: 'Project not found.'
            });
        }


        // Get enquiries
        const {
            data,
            error
        } = await supabase
            .from('enquiries')
            .select('*')
            .eq('project_id', project.id)
            .order('created_at', {
                ascending: false
            });


        if (error) {

            console.error(
                'Get enquiries error:',
                error
            );

            return res.status(500).json({
                success: false,
                message: 'Could not load enquiries.'
            });
        }


        return res.json({

            success: true,

            enquiries: data || []
        });


    } catch (error) {

        console.error(
            'Get enquiries error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Something went wrong.'
        });
    }
};



// =====================================================
// GET ALL ENQUIRIES - ADMIN
// =====================================================

const getAllEnquiries = async (req, res) => {

    try {

        const {
            data,
            error
        } = await supabase
            .from('enquiries')
            .select(`
                *,
                projects (
                    project_id,
                    client_name,
                    client_email,
                    company
                )
            `)
            .order('created_at', {
                ascending: false
            });


        if (error) {

            console.error(
                'Get all enquiries error:',
                error
            );

            return res.status(500).json({
                success: false,
                message: 'Could not load enquiries.'
            });
        }


        return res.json({

            success: true,

            enquiries: data || []
        });


    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: 'Something went wrong.'
        });
    }
};



// =====================================================
// REPLY TO ENQUIRY - ADMIN
// =====================================================

const replyToEnquiry = async (req, res) => {

    try {

        const {
            enquiryId,
            reply
        } = req.body;


        if (!enquiryId || !reply) {

            return res.status(400).json({
                success: false,
                message: 'Enquiry ID and reply are required.'
            });
        }


        const {
            data,
            error
        } = await supabase
            .from('enquiries')
            .update({
                reply: reply.trim(),
                status: 'REPLIED',
                updated_at: new Date().toISOString()
            })
            .eq('id', enquiryId)
            .select()
            .single();


        if (error) {

            console.error(
                'Reply enquiry error:',
                error
            );

            return res.status(500).json({
                success: false,
                message: 'Could not send reply.'
            });
        }


        return res.json({

            success: true,

            message: 'Reply sent successfully.',

            enquiry: data
        });


    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: 'Something went wrong.'
        });
    }
};



// =====================================================
// EXPORTS
// =====================================================

module.exports = {

    createEnquiry,

    getClientEnquiries,

    getAllEnquiries,

    replyToEnquiry

};