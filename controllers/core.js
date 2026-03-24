const Event = require('../models/Event');

// @desc    Get home page
exports.index = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tonight = new Date(today);
        tonight.setHours(23, 59, 59, 999);

        // Fetch ONLY PUBLIC upcoming events for home page calendar
        const allPublicEvents = await Event.find({
            date: { $gte: today },
            isPublic: true
        }).sort({ date: 1 });

        // Filter those happening today (must be public)
        const todaysEvents = allPublicEvents.filter(event => event.date >= today && event.date <= tonight);

        res.render('index', {
            title: 'Home',
            events: allPublicEvents,
            todaysEvents
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Get about page
exports.about = (req, res) => {
    res.render('about', { title: 'About Us' });
};

// @desc    Get contact page
exports.contact = (req, res) => {
    res.render('contact', { title: 'Contact Us' });
};

// Shared Clubs Data
const clubsData = [
    {
        slug: 'cybersecurity',
        name: 'Cybersecurity Club',
        description: 'The Cybersecurity Club is dedicated to fostering a community of security enthusiasts. We focus on ethical hacking, network defense, and participating in global CTF competitions. Our mission is to build the next generation of cyber warriors.',
        vision: 'To be a premier hub for cybersecurity excellence in the institution.',
        mission: 'Provide hands-on training, research opportunities, and a platform for security innovation.',
        events: 'Capture The Flag (CTF), Security Workshops',
        coordinator: 'Radhika',
        department: 'CSE-CS',
        president: 'Rohith Chandra (22R11A6923)',
        vicePresident: 'S. RatnaKeshav (22R11A6238)',
        members: 140,
        icon: 'shield-alt',
        color: 'primary',
        brandColor: '#021849'
    },
    {
        slug: 'aiml',
        name: 'AIML Club',
        description: 'Exploring the frontiers of Artificial Intelligence and Machine Learning applications. We bridge the gap between theory and real-world AI deployment.',
        vision: 'To innovate through intelligent systems.',
        mission: 'Foster learning in deep learning, neural networks, and AI ethics.',
        events: 'Kaggle Competitions, Paper Readings',
        coordinator: 'Dr. Shraban Kumar Apet',
        department: 'CSE-AIML',
        members: 180,
        icon: 'brain',
        color: 'danger',
        brandColor: '#021849'
    },
    {
        slug: 'data-science',
        name: 'Data Science Club',
        description: 'Extracting insights from data through advanced analytics and visualization. We turn numbers into narratives.',
        vision: 'Empowering decisions through data.',
        mission: 'Mastering data engineering, visualization, and statistical modeling.',
        events: 'Datathons, Visualization Workshops',
        coordinator: 'Dr. U. Rakesh',
        department: 'CSE-DS',
        members: 110,
        icon: 'chart-bar',
        color: 'success',
        brandColor: '#021849'
    },
    {
        slug: 'deco',
        name: 'Deco Club',
        description: 'Bringing creativity to campus through event decoration and artistic aesthetics. We make institutional life beautiful.',
        vision: 'Creative excellence in every corner.',
        mission: 'Aesthetics, event design, and artistic collaboration.',
        events: 'Fest Decoration, Art Exhibitions',
        coordinator: 'Ms. S. Spandana',
        department: 'H&S',
        members: 95,
        icon: 'paint-brush',
        color: 'warning text-dark',
        brandColor: '#021849'
    },
    {
        slug: 'mediahouse',
        name: 'MediaHouse',
        description: 'The official media wing capturing campus life through journalism and photography. Your story, our lens.',
        vision: 'Authentic storytelling for GCET.',
        mission: 'Journalism, digital media, and institutional photography.',
        events: 'Photography Walks, Campus News',
        coordinator: 'Prof. Chiranjeevi Phaneendra',
        department: 'Generic',
        members: 75,
        icon: 'camera-retro',
        color: 'info',
        brandColor: '#021849'
    },
    {
        slug: 'ana',
        name: 'ANA Club',
        description: 'The Analytics and Networking Association for strategy and logic enthusiasts. Strategist’s playfield.',
        vision: 'Analytical leadership in management.',
        mission: 'Logic, networking strategies, and business analytics.',
        events: 'Strategy Games, Networking Meets',
        coordinator: 'N. Radhika Amareswari',
        department: 'MBA',
        members: 130,
        icon: 'network-wired',
        color: 'dark',
        brandColor: '#021849'
    }
];

// @desc    Get clubs directory page
exports.clubs = async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.render('clubs', { title: 'Clubs', clubs: clubsData, events });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Get individual club details
exports.clubDetails = async (req, res) => {
    try {
        const club = clubsData.find(c => c.slug === req.params.slug);
        if (!club) return res.status(404).send('Club not found');

        const events = await Event.find({ clubName: club.name }).sort({ date: 1 });
        res.render('club-details', { title: club.name, club, events });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

const { uploadFile } = require('../utils/supabaseUpload');
const fs = require('fs');

// @desc    Upload a past event with a report
exports.uploadPastEvent = async (req, res) => {
    try {
        const club = clubsData.find(c => c.slug === req.params.slug);
        if (!club) return res.status(404).send('Club not found');

        let reportUrl = null;
        if (req.file) {
            const data = await uploadFile(req.file.path, req.file.originalname, req.file.mimetype);
            if (data) {
                // Supabase returns path, we construct public URL
                reportUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET}/${data.path}`;
            }
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        }

        const newEvent = new Event({
            title: req.body.title,
            type: req.body.type || 'Other',
            date: req.body.date || Date.now(),
            description: req.body.description,
            clubName: club.name,
            status: 'Completed',
            isPublic: true,
            approvalStatus: 'Approved',
            createdBy: res.locals.user ? res.locals.user._id : null,
            reportUrl: reportUrl
        });

        await newEvent.save();
        res.redirect(`/clubs/${req.params.slug}`);
    } catch (err) {
        console.error("Error creating past event:", err);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).send('Server Error during upload');
    }
};

// Guidance Pages
exports.atsChecker = (req, res) => res.render('guidance/ats-checker', { title: 'ATS Checker' });
exports.interviewPrep = (req, res) => res.render('guidance/interview-prep', { title: 'Interview Preparation' });
exports.skillDev = (req, res) => res.render('guidance/skill-dev', { title: 'Skill Development' });
exports.higherStudies = (req, res) => res.render('guidance/higher-studies', { title: 'Higher Studies' });

const { scoreResume } = require('../utils/atsAlgorithm');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

exports.checkATS = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload a resume file' });
        }

        const keywords = req.body.keywords;
        let resumeText = '';

        // Extract text based on file type
        if (req.file.mimetype === 'application/pdf') {
            const data = await pdfParse(req.file.buffer);
            resumeText = data.text;
        } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') { // docx
            const result = await mammoth.extractRawText({ buffer: req.file.buffer });
            resumeText = result.value;
        } else {
             return res.status(400).json({ error: 'Unsupported file format! Please upload PDF or DOCX.' });
        }

        const result = scoreResume(resumeText, keywords || '');
        res.json(result);
    } catch (error) {
        console.error('ATS Parsing Error Details:', error);
        res.status(500).json({ error: `System Error: ${error.message}` });
    }
};
