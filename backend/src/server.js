require('dotenv').config();

const express = require('express');
const cors = require('cors');

const supabase = require('./config/supabase');
const inquiryRoutes = require('./routes/inquiryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const projectRoutes = require('./routes/projectRoutes');
const enquiryRoutes = require("./routes/enquiryRoutes");

const app = express();


// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());
app.use(express.json());


// ============================================
// BASIC SERVER TEST
// ============================================

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'OFF-SCRIPT backend is running'
    });
});


// ============================================
// DATABASE TEST
// ============================================

app.get('/api/test-db', async (req, res) => {
    try {
        const { error } = await supabase
            .from('inquiries')
            .select('id')
            .limit(1);

        if (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message: 'Database connection failed'
            });
        }

        res.json({
            success: true,
            message: 'Database connection successful'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Database test failed'
        });
    }
});


// ============================================
// API ROUTES
// ============================================

app.use('/api/inquiries', inquiryRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/projects', projectRoutes);


// ============================================
// 404
// ============================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});


// ============================================
// SERVER
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`OFF-SCRIPT backend running on port ${PORT}`);
});