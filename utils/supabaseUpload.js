const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Initialize Supabase client if URL and KEY are provided
let supabaseUrl = process.env.SUPABASE_URL;
let supabaseKey = process.env.SUPABASE_KEY;
let supabase = null;

if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
} else {
    console.warn("Supabase Storage Integration: SUPABASE_URL or SUPABASE_KEY not found in .env. Cloud uploads will be skipped.");
}

const bucketName = process.env.SUPABASE_BUCKET || 'reports';

const uploadFile = async (filePath, originalName, mimeType) => {
    if (!supabase) {
        console.warn("Skipping Supabase upload for", originalName, "because Supabase client is not configured.");
        return null;
    }

    try {
        const fileContent = fs.readFileSync(filePath);
        const fileName = `${Date.now()}_${originalName.replace(/\s+/g, '_')}`;

        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(fileName, fileContent, {
                contentType: mimeType,
                upsert: false
            });

        if (error) {
            console.error("Supabase API Error:", error.message);
            throw error;
        }

        console.log("Successfully uploaded file to Supabase. Path:", data.path);
        return data;
    } catch (error) {
        console.error("Error uploading to Supabase:", error);
        throw error;
    }
};

module.exports = {
    uploadFile
};
