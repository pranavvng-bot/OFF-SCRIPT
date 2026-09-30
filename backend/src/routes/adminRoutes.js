const express = require('express');
const router = express.Router();

const supabase = require('../config/supabase');

// ============================================
// GET ALL CLIENT INQUIRIES
// ============================================

router.get('/inquiries', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('inquiries')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);

            return res.status(500).json({
                success: false,
                message: 'Failed to fetch client inquiries'
            });
        }

        res.json({
            success: true,
            inquiries: data || []
        });

    } catch (error) {
        console.error('Admin inquiries error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error while fetching inquiries'
        });
    }
});

module.exports = router;