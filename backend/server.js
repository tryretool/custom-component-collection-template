require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: '*', // Allow all origins to rule out CORS issues
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// AWS S3 Client
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Helper: Generate Presigned URL
const generatePresignedUrl = async (originalUrl) => {
    if (!originalUrl) return null;
    try {
        console.log(`Generating presigned URL abc for: ${originalUrl}`);
        let bucket, key;

        // Handle full S3 URLs or just Keys
        if (originalUrl.startsWith('http')) {
            const url = new URL(originalUrl);
            const hostParts = url.hostname.split('.');
            if (hostParts[0] === 's3') {
                // Path style: s3.region.amazonaws.com/bucket/key
                const parts = url.pathname.split('/');
                bucket = parts[1];
                key = parts.slice(2).join('/');
            } else {
                // Virtual host style: bucket.s3.region.amazonaws.com/key
                bucket = hostParts[0];
                key = url.pathname.substring(1);
            }
        } else if (originalUrl.startsWith('s3://')) {
            const parts = originalUrl.replace('s3://', '').split('/');
            bucket = parts[0];
            key = parts.slice(1).join('/');
        } else {
            // Assume it is just the key and bucket is in env
            bucket = process.env.S3_BUCKET_NAME;
            key = originalUrl;
        }

        console.log(`Extracted - Bucket: ${bucket}, Key: ${key}`);

        if (bucket && key) {
            const command = new GetObjectCommand({
                Bucket: bucket,
                Key: key
            });
            const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 86400 }); // 24 hours
            console.log('Successfully generated signed URL');
            return signedUrl;
        }
        return originalUrl;
    } catch (err) {
        console.error('Error generating presigned URL:', err);
        return originalUrl;
    }
};

// Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const tableName = process.env.TABLE_NAME;

let supabase = null;

if (!supabaseUrl || !supabaseKey || !tableName) {
    console.error('WARNING: SUPABASE_URL, SUPABASE_ANON_KEY, and TABLE_NAME must be set in .env file. Running in non-functional mode.');
} else {
    try {
        supabase = createClient(supabaseUrl, supabaseKey);
    } catch (err) {
        console.error('Failed to initialize Supabase client:', err.message);
    }
}

// Mapper Function: Database Row -> Frontend Interface
// Mapper Function: Database Row -> Frontend Interface
const mapDatabaseRowToFrontend = async (row) => {
    // The main data is now in the 'analysis' JSON column
    const analysis = row.analysis || {};

    // Parse JSON fields if they are strings
    const safeJson = (val) => (typeof val === 'string' ? JSON.parse(val) : val);

    // Generate Presigned URL for Audio
    const signedAudioUrl = row.audio_url ? await generatePresignedUrl(row.audio_url) : null;

    return {
        id: row.id,
        // Metadata (Fetch from DB or null)
        staff_id: row.staff_id || 'N/A',
        staff_name: row.staff_name || 'Unknown Agent',
        overall_status: row.overall_status || 'Completed',
        call_date: new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        call_duration: row.call_duration || '00:00', // Ensure this column needs to exist in your table or be calculated

        // Critical Data
        audio_url: signedAudioUrl || '',
        transcript: row.transcription || '',

        // Evaluation Data (Extracted from analysis JSON)
        Red_Flags: safeJson(analysis.Red_Flags) || [],

        SOP_Adherence: {
            tag: analysis.SOP_Adherence?.tag || 'N/A',
            note: analysis.SOP_Adherence?.note || ''
        },

        SOP_Steps: safeJson(analysis.SOP_Steps) || [],

        Soft_Skills: {
            communication_clarity_structure: {
                tag: analysis.Soft_Skills?.communication_clarity_structure?.tag || 'N/A',
                note: analysis.Soft_Skills?.communication_clarity_structure?.note || ''
            },
            empathy_kindness_respect_tone: {
                tag: analysis.Soft_Skills?.empathy_kindness_respect_tone?.tag || 'N/A',
                note: analysis.Soft_Skills?.empathy_kindness_respect_tone?.note || ''
            },
            confidence: {
                tag: analysis.Soft_Skills?.confidence?.tag || 'N/A',
                note: analysis.Soft_Skills?.confidence?.note || ''
            },
            active_listening: {
                tag: analysis.Soft_Skills?.active_listening?.tag || 'N/A',
                note: analysis.Soft_Skills?.active_listening?.note || ''
            }
        },

        Pressure_Objection_Handling: {
            pressure_objection_level: analysis.Pressure_Objection_Handling?.pressure_objection_level || 'N/A',
            tag: analysis.Pressure_Objection_Handling?.tag || 'N/A',
            note: analysis.Pressure_Objection_Handling?.note || '',
            evidence: analysis.Pressure_Objection_Handling?.evidence || ''
        },

        Learning_Behavior_Engagement: {
            tag: analysis.Learning_Behavior_Engagement?.tag || 'N/A',
            note: analysis.Learning_Behavior_Engagement?.note || ''
        },

        Alternates_Solutions_Escalations_Discounts: safeJson(analysis.Alternates_Solutions_Escalations_Discounts) || [],

        // Handle potentially string or array fields
        Strengths_Pointers: Array.isArray(analysis.Strengths_Pointers) ? analysis.Strengths_Pointers : [],
        Weakness_Pointers: Array.isArray(analysis.Weakness_Pointers) ? analysis.Weakness_Pointers : []
    };
};

// API: Get All Evaluations (List View)
app.get('/api/evaluations', async (req, res) => {
    try {
        if (!supabase) {
            return res.status(500).json({ error: 'Database not configured. Check server logs.' });
        }

        const { data, error } = await supabase
            .from('transcription_analysis')
            .select('id, created_at, analysis, scenario_prompts!inner(type)') // Filter by joined table
            .eq('scenario_prompts.type', 'Roleplay')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map for list view - keep it lightweight
        const listViewData = data.map(row => {
            const analysis = row.analysis || {};
            return {
                id: row.id,
                created_at: row.created_at,
                sop_tag: analysis.SOP_Adherence?.tag || 'N/A',
                pressure_tag: analysis.Pressure_Objection_Handling?.tag || 'N/A',
                display_date: new Date(row.created_at).toLocaleDateString()
            };
        });

        res.json(listViewData);
    } catch (err) {
        console.error('Error fetching list:', err);
        res.status(500).json({ error: err.message });
    }
});

// API: Get Single Evaluation by ID
app.get('/api/evaluations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!supabase) {
            return res.status(500).json({ error: 'Database not configured. Check server logs.' });
        }

        const { data, error } = await supabase
            .from('transcription_analysis')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Evaluation not found' });

        const formattedData = await mapDatabaseRowToFrontend(data);
        res.json(formattedData);
    } catch (err) {
        console.error('Error fetching details:', err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
});
