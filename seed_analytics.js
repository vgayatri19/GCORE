const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Department = require('./models/Department');
const Event = require('./models/Event');
const Achievement = require('./models/Achievement');
const AcademicRecord = require('./models/AcademicRecord');
const PlacementRecord = require('./models/PlacementRecord');
const User = require('./models/User');

dotenv.config();

const seedAnalytics = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB for Analytics seeding...');

        // 1. Setup Department
        const deptName = 'CSE-CS';
        let dept = await Department.findOne({ name: deptName });
        if (!dept) {
            dept = await Department.create({
                name: deptName,
                hodName: 'Dr. G. Somasekhar',
                vision: 'Quality education in Cyber Security.',
                mission: 'Develop zero-tolerance cyber world professionals.',
                totalStudents: 180
            });
        }

        // 2. Clear previous specific analytics data to avoid bloat (optional)
        await AcademicRecord.deleteMany({ department: deptName });
        await Achievement.deleteMany({ department: deptName });
        await PlacementRecord.deleteMany({ department: deptName });
        await Event.deleteMany({ department: deptName });

        console.log('Cleared existing dept data');

        // 3. Seed Students & Academics
        const students = [
            { roll: '22R11A6201', name: 'Student Alpha' },
            { roll: '22R11A6202', name: 'Student Beta' },
            { roll: '22R11A6203', name: 'Student Gamma' },
            { roll: '22R11A6204', name: 'Student Delta' },
            { roll: '22R11A6205', name: 'Student Epsilon' }
        ];

        const semesters = ['Sem 3', 'Sem 4', 'Sem 5'];
        const academicData = [];
        
        students.forEach(s => {
            semesters.forEach((sem, idx) => {
                academicData.push({
                    rollNumber: s.roll,
                    studentName: s.name,
                    department: deptName,
                    semester: sem,
                    cgpa: (7 + Math.random() * 2.5).toFixed(2),
                    backlogs: idx === 0 ? Math.floor(Math.random() * 2) : 0,
                    passStatus: 'Pass'
                });
            });
        });
        await AcademicRecord.insertMany(academicData);
        console.log('✅ Academic Records Seeded');

        // 4. Seed Achievements (Skill Development)
        const achievementsData = [
            { title: 'NPTEL Python', rollNumber: '22R11A6201', studentName: 'Student Alpha', category: 'COURSE', type: 'TECHNICAL', department: deptName, achieverRole: 'PARTICIPANT' },
            { title: 'CCNA Cert', rollNumber: '22R11A6202', studentName: 'Student Beta', category: 'CERTIFICATION', type: 'TECHNICAL', department: deptName, achieverRole: 'PARTICIPANT' },
            { title: 'Web App Workshop', rollNumber: '22R11A6203', studentName: 'Student Gamma', category: 'WORKSHOP', type: 'TECHNICAL', department: deptName, achieverRole: 'PARTICIPANT' },
            { title: 'Hackathon Winner', rollNumber: '22R11A6201', studentName: 'Student Alpha', category: 'HACKATHON', type: 'TECHNICAL', department: deptName, achieverRole: 'WINNER' },
            { title: 'Inter-College Sports', rollNumber: '22R11A6205', studentName: 'Student Epsilon', category: 'COMPETITION', type: 'SPORTS', department: deptName, achieverRole: 'WINNER', level: 'State' }
        ];
        await Achievement.insertMany(achievementsData);
        console.log('✅ Achievements Seeded');

        // 5. Seed Placements (Correlation check)
        const placementData = [
            { rollNumber: '22R11A6201', studentName: 'Student Alpha', department: deptName, company: 'Google', package: 24, type: 'On-Campus' },
            { rollNumber: '22R11A6202', studentName: 'Student Beta', department: deptName, company: 'Amazon', package: 18, type: 'On-Campus' },
            { rollNumber: '22R11A6204', studentName: 'Student Delta', department: deptName, company: 'TCS', package: 7, type: 'On-Campus' }
        ];
        await PlacementRecord.insertMany(placementData);
        console.log('✅ Placement Records Seeded');

        // 6. Seed Events (Efficiency Tracking)
        const faculty = await User.findOne({ role: 'Faculty', department: deptName });
        const adminId = faculty ? faculty._id : new mongoose.Types.ObjectId();

        const eventData = [
            { 
                title: 'Data Security Seminar', type: 'Seminar', department: deptName, 
                clubName: 'Cyber Club', createdBy: adminId, approvalStatus: 'Approved',
                proposedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
                approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 2 days difference
                date: new Date()
            },
            { 
                title: 'AI ethics Workshop', type: 'Workshop', department: deptName, 
                clubName: 'AI Club', createdBy: adminId, approvalStatus: 'Approved',
                proposedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
                approvedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 1 day difference
                date: new Date()
            }
        ];
        await Event.insertMany(eventData);
        console.log('✅ Events Seeded');

        console.log('🏁 Seeding finished successfully!');
        process.exit();
    } catch (err) {
        console.error('❌ Seeding Error:', err);
        process.exit(1);
    }
};

seedAnalytics();
