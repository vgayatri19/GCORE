const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Department = require('./models/Department');
const User = require('./models/User');
const Faculty = require('./models/Faculty');
const PlacementRecord = require('./models/PlacementRecord');
const Achievement = require('./models/Achievement');

dotenv.config();

const cyberSecurityDept = {
    name: 'CSE-CS',
    hodName: 'Dr. G. Somasekhar',
    vision: 'Facilitate quality education, conduct cutting-edge research, inculcating critical thinking, creativity, innovation, and professional ethics to build and sustain a zero tolerance cyber world for societal development.',
    mission: 'Through a well-balanced curriculum, provide quality learning experiences with a strong foundation in cryptology to develop and sustain a zero tolerance cyber-world. Facilitate students with cutting-edge technologies, which include but not limited to AI-driven security measures, block chain, and Digital forensics working on inter disciplinary research projects meeting the demands of a zero tolerance cyber-world. Nurture students with critical thinking, creativity, innovation and problem solving skills, facilitating them to work collaboratively and cooperatively in multi-cultural teams on multi-disciplinary projects for sustainable societal development.',
    description: 'At Geethajali, our CSE- Cyber Security Department is at the forefront of preparing the next generation of professionals equipped with the skills and knowledge to tackle the evolving challenges in cyberspace. The Department of CSE-Cyber Security was established in the year 2020 and currently the department offers an Under Graduate program B.Tech in CSE (Cyber Security) with an intake of 180 students. The Department has 6 well equipped laboratories with the latest technology for hands-on learning in network defense, penetration testing, and digital forensics. All the faculty members are encouraged to participate in Faculty Development Programmes, Conferences, Workshops, Publication of Research Papers and active involvement in R & D activities.',
    totalFaculty: 32,
    totalStudents: 180,
    totalLabs: 6,
    placementRate: 0,
    peos: [
        'PEO1: Provide foundation in Mathematical and Engineering sciences to solve engineering problems enabling them towards gainful employment or to pursue advanced degree with an appreciation for lifelong learning.',
        'PEO2: Nurture graduates with independent thinking and problem solving skills, facilitating them to analyse and design algorithms, develop software/ hardware systems, working on cyber related projects for sustainable societal development.',
        'PEO3: Inculcate creativity, innovation, professional ethics, and inter-personal skills in graduates, working on multi/interdisciplinary projects, in a multicultural environment, building a Zero tolerance cyber world.'
    ],
    pos: [
        'PO 1: Engineering knowledge',
        'PO 2: Problem Analysis',
        'PO 3: Design/Development of Solutions.',
        'PO 4: Conduct Investigations of Complex Problems',
        'PO 5: Engineering Tool Usage',
        'PO 6: The Engineer and The World',
        'PO 7: Ethics',
        'PO 8: Individual and Collaborative Team work',
        'PO 9: Communication',
        'PO 10: Project Management and Finance',
        'PO 11: Life-Long Learning'
    ],
    psos: [
        'PSO 1: Demonstrate competency in analysing the security of cryptographic algorithms.',
        'PSO 2: Apply the principles of Cryptography, develop cyber physical systems.',
        'PSO 3: Demonstrate and evaluate the strategies for protection of cyber physical systems.'
    ],
    wks: [
        'WK1: A systematic, theory-based understanding of the natural sciences applicable to the discipline and awareness of relevant social sciences.',
        'WK2: Conceptually-based mathematics, numerical analysis, data analysis, statistics and formal aspects of computer and information science to support detailed analysis and modelling applicable to the discipline.',
        'WK3: A systematic, theory-based formulation of engineering fundamentals required in the engineering discipline.',
        'WK4: Engineering specialist knowledge that provides theoretical frameworks and bodies of knowledge for the accepted practice areas in the engineering discipline; much is at the forefront of the discipline.',
        'WK5: Knowledge, including efficient resource use, environmental impacts, whole-life cost, re-use of resources, net zero carbon, and similar concepts, that supports engineering design and operations in a practice area.',
        'WK6: Knowledge of engineering practice (technology) in the practice areas in the engineering discipline.',
        'WK7: Knowledge of the role of engineering in society and identified issues in engineering practice in the discipline, such as the professional responsibility of an engineer to public safety and sustainable development.',
        'WK8: Engagement with selected knowledge in the current research literature of the discipline, awareness of the power of critical thinking and creative approaches to evaluate emerging issues.',
        'WK9: Ethics, inclusive behavior and conduct. Knowledge of professional ethics, responsibilities, and norms of engineering practice. Awareness of the need for diversity by reason of ethnicity, gender, age, physical ability etc. with mutual understanding and respect, and of inclusive attitudes.'
    ],
    statsDetailed: {
        intake: 180,
        establishedYear: 2020,
        professors: 4,
        assocProfessors: 4,
        asstProfessors: 16,
        seniorAsstProfessors: 5
    }
};

const staffList = [
    { name: 'Dr. G. Somasekhar', designation: 'Professor & HoD', qualification: 'BCA, M Sc, M.Tech. (IT), Ph.D', registrationId: '73150402-134234', experience: '20 years', specialization: 'Computer Science', email: 'somasekhar@gcore.edu', department: 'CSE-CS', staffType: 'Teaching' },
    { name: 'Dr. G. Lokeshwari', designation: 'Professor', qualification: 'B.E (CS), M.Tech. (CS), MBA, Ph.D', registrationId: '72150331-132356', experience: '15 years', specialization: 'Computer Science', email: 'lokeshwari@gcore.edu', department: 'CSE-CS', staffType: 'Teaching' },
    { name: 'Dr. G. Kalyani', designation: 'Professor', qualification: 'B.Tech., M.Tech., Ph.D', registrationId: '33150406-151737', experience: '12 years', specialization: 'Cyber Security', email: 'kalyani@gcore.edu', department: 'CSE-CS', staffType: 'Teaching' },
    { name: 'Dr. M. Vijaya Kamal', designation: 'Professor', qualification: 'B.Tech., M.Tech., Ph.D', registrationId: '09571601-06112053', experience: '18 years', specialization: 'Networks', email: 'vijay@gcore.edu', department: 'CSE-CS', staffType: 'Teaching' },
    { name: 'Dr. K. Krishna Jyothi', designation: 'Associate Professor', qualification: 'B.Tech., M.Tech., Ph.D', registrationId: '46150406-155903', experience: '10 years', specialization: 'Algorithm Design', email: 'krishna@gcore.edu', department: 'CSE-CS', staffType: 'Teaching' },
    { name: 'Dr. Shraban Kumar Apet', designation: 'Associate Professor', qualification: 'B.Tech., M.Tech. (CSE), Ph.D', registrationId: '64150407-120308', experience: '8 years', specialization: 'Machine Learning', email: 'shraban@gcore.edu', department: 'CSE-CS', staffType: 'Teaching' },
    { name: 'Dr. U. Rakesh', designation: 'Associate Professor', qualification: 'B.Tech., M.Tech. (SE), Ph.D', registrationId: '5769-220705-132224', experience: '7 years', specialization: 'Software Engineering', email: 'rakesh@gcore.edu', department: 'CSE-CS', staffType: 'Teaching' },
    { name: 'Chiranjeevi Phaneendra', designation: 'Associate Professor', qualification: 'B.Tech. (CSIT), M.Tech.', registrationId: '5496-160205-143954', experience: '14 years', specialization: 'IT Security', email: 'chiranjeevi@gcore.edu', department: 'CSE-CS', staffType: 'Teaching' },
    { name: 'S. Spandana', designation: 'Sr. Assistant Professor', qualification: 'B.Tech., M.Tech. (SE)', registrationId: '7749-231018-145915', experience: '5 years', specialization: 'Software Engineering', email: 'spandana@gcore.edu', department: 'CSE-CS', staffType: 'Teaching' },
    { name: 'S. Vikram Sindhu', designation: 'Sr. Assistant Professor', qualification: 'BE, M.Tech. (CNE)', registrationId: '4371-181122-110615', experience: '6 years', specialization: 'Computer Networks', email: 'vikram@gcore.edu', department: 'CSE-CS', staffType: 'Teaching' },
    { name: 'N. Radhika Amareswari', designation: 'Sr. Assistant Professor', qualification: 'B.E. (IT), M.Tech. (IP)', registrationId: '71150406-142643', experience: '9 years', specialization: 'Information Processing', email: 'radhika.a@gcore.edu', department: 'CSE-CS', staffType: 'Teaching' },
    { name: 'K. Subhashini', designation: 'Sr. Assistant Professor', qualification: 'B.Sc, M.Tech. (CSE), MCA', registrationId: '2917-170203-104150', experience: '11 years', specialization: 'Computer Science', email: 'subhashini@gcore.edu', department: 'CSE-CS', staffType: 'Teaching' },
    { name: 'K. Bala Tripura Sundari', designation: 'Sr. Assistant Professor', qualification: 'B.Sc, MCA, M.Tech.', registrationId: '9210-160213-101450', experience: '10 years', specialization: 'Application Development', email: 'bala@gcore.edu', department: 'CSE-CS', staffType: 'Teaching' },
    { name: 'Shakira', designation: 'Assistant Professor', qualification: 'B.Tech., M.Tech. (CSE)', registrationId: '0611-210707-132733', experience: '4 years', specialization: 'Cloud Computing', email: 'shakira@gcore.edu', department: 'CSE-CS', staffType: 'Teaching' },
    { name: 'G. Hima Bindu', designation: 'Assistant Professor', qualification: 'B.Tech. (IT), M.Tech. (CSE)', registrationId: '1848-150421-091945', experience: '3 years', specialization: 'Data Science', email: 'hima@gcore.edu', department: 'CSE-CS', staffType: 'Teaching' },
    { name: 'V. Soujenya', designation: 'Assistant Professor', qualification: 'B.Tech., M.Tech. (CSE)', registrationId: '7409-150425-181940', experience: '3 years', specialization: 'Computer Science', email: 'soujenya@gcore.edu', department: 'CSE-CS', staffType: 'Teaching' },
    { name: 'N. Yuvraj Dhanaji', designation: 'Assistant Professor', qualification: 'B.Tech., M.Tech.', registrationId: '1983-240105-150402', experience: '2 years', specialization: 'Cyber Security', email: 'yuvraj@gcore.edu', department: 'CSE-CS', staffType: 'Teaching' },
    { name: 'M. Prajwala Priyanka', designation: 'Assistant Professor', qualification: 'B.Tech., M.Tech. (CSE)', registrationId: '6180-240105-113642', experience: '4 years', specialization: 'Algorithms', email: 'prajwala@gcore.edu', department: 'CSE-CS', staffType: 'Teaching' },
    { name: 'P. Swapna Shankar', designation: 'Assistant Professor', qualification: 'B.Tech., M.Tech. (SE)', registrationId: '0958-151228-150627', experience: '6 years', specialization: 'Software Eng', email: 'swapna@gcore.edu', department: 'CSE-CS', staffType: 'Teaching' },
    { name: 'V. Kavitha', designation: 'Assistant Professor', qualification: 'B.Tech., M.Tech. (CSE)', registrationId: '5148-240629-095204', experience: '5 years', specialization: 'CS', email: 'kavitha@gcore.edu', department: 'CSE-CS', staffType: 'Teaching' },
    { name: 'M. Swathi', designation: 'Assistant Professor', qualification: 'B.Tech., M.Tech.', registrationId: '7293-240207-112640', experience: '2 years', specialization: 'IT', email: 'swathi@gcore.edu', department: 'CSE-CS', staffType: 'Teaching' },
    { name: 'M. Yellamma', designation: 'Assistant Professor', qualification: 'B.Tech. (CS&SE), M.Tech. (CSE)', registrationId: '64150406-145102', experience: '12 years', specialization: 'Architecture', email: 'yellamma@gcore.edu', department: 'CSE-CS', staffType: 'Teaching' },
    { name: 'V. Dhanasree', designation: 'Assistant Professor', qualification: 'B.Tech. (CSE), M.Tech. (SE)', registrationId: '1340-250213-104735', experience: '3 years', specialization: 'Security', email: 'dhanasree@gcore.edu', department: 'CSE-CS', staffType: 'Teaching' },
    { name: 'Jessu. Padma', designation: 'Assistant Professor', qualification: 'B.Tech. (CSE), M.Tech. (SE)', registrationId: '5305-240120-104114', experience: '4 years', specialization: 'Software', email: 'padma@gcore.edu', department: 'CSE-CS', staffType: 'Teaching' },
    { name: 'S. Manasa', designation: 'Assistant Professor', qualification: 'B.Tech. (IT), M.Tech. (CSE)', registrationId: 'MN-01', experience: '2 years', specialization: 'IT', email: 'manasa@gcore.edu', department: 'CSE-CS', staffType: 'Teaching' },
    { name: 'P. Harsha', designation: 'Assistant Professor', qualification: 'B.Tech., M.Tech. (SE)', registrationId: '8777-180801-115840', experience: '6 years', specialization: 'Eng', email: 'harsha@gcore.edu', department: 'CSE-CS', staffType: 'Teaching' },
    { name: 'P. Raveena', designation: 'Assistant Professor', qualification: 'B.Tech. , M.Tech. (CSE)', registrationId: '8088-250802-124933', experience: '3 years', specialization: 'CSE', email: 'raveena@gcore.edu', department: 'CSE-CS', staffType: 'Teaching' },
    { name: 'V. Harathi', designation: 'Assistant Professor', qualification: 'B.Tech. , M.Tech. (CSE)', registrationId: '1968-211005-113807', experience: '4 years', specialization: 'Networks', email: 'harathi@gcore.edu', department: 'CSE-CS', staffType: 'Teaching' },
    { name: 'N. Radhika', designation: 'Assistant Professor', qualification: 'B.Tech. , M.Tech. (CSE)', registrationId: '7505-190719-134752', experience: '5 years', specialization: 'Databases', email: 'radhika@gcore.edu', department: 'CSE-CS', staffType: 'Teaching' },
    { name: 'L. Tabitha', designation: 'Programmer', qualification: 'B.Sc, MSc,', registrationId: 'T-001', experience: '8 years', specialization: 'Lab Admin', email: 'tabitha@gcore.edu', department: 'CSE-CS', staffType: 'Non-Teaching' },
    { name: 'S. Harinath Reddy', designation: 'Programmer', qualification: 'B.Tech', registrationId: 'H-002', experience: '5 years', specialization: 'Programming', email: 'harinath@gcore.edu', department: 'CSE-CS', staffType: 'Non-Teaching' },
    { name: 'S. Bharadwaza', designation: 'Programmer', qualification: 'B.Tech', registrationId: 'B-003', experience: '4 years', specialization: 'Technical Support', email: 'bharad@gcore.edu', department: 'CSE-CS', staffType: 'Non-Teaching' }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB for detailed seeding...');

        // Drop conflicting indexes
        try {
            await mongoose.connection.db.collection('departments').dropIndexes();
            console.log('Successfully dropped old indexes');
        } catch (e) {
            console.log('No indexes to drop');
        }

        // 1. Seed Departments
        await Department.deleteMany({});
        await Department.create(cyberSecurityDept);
        console.log('✅ CSE-CS Department Seeded');

        const otherDepts = ['CSE', 'CSE-AIML', 'CSE-DS', 'EEE', 'ECE', 'Civil', 'Mech', 'MBA'];
        for (const name of otherDepts) {
            await Department.create({
                name,
                hodName: 'TBD',
                vision: 'Vision for ' + name,
                mission: 'Mission for ' + name
            });
        }
        console.log('✅ All Departments Seeded');

        // 2. Seed Faculty
        await Faculty.deleteMany({});
        await Faculty.insertMany(staffList);
        console.log(`✅ ${staffList.length} staff members seeded for CSE-CS`);

        // 3. Seed Users (Admin, Placement Officer, Club President, Coordinator)
        await User.deleteMany({});
        const admin = await User.create({
            name: 'System Admin',
            email: 'admin@gcet.edu.in',
            password: 'AdminPassword123!',
            role: 'Admin',
            department: 'Management'
        });

        const po = await User.create({
            name: 'Placement Officer',
            email: 'po@gcet.edu.in',
            password: 'POPassword123!',
            role: 'Placement Officer',
            department: 'Placement Cell'
        });

        const president = await User.create({
            name: 'Rohith Chandra',
            email: 'rohith@gcet.edu.in',
            password: 'ClubPassword123!',
            role: 'Student',
            department: 'CSE-CS',
            clubRole: 'President',
            managedClub: 'Cybersecurity Club'
        });

        const coordinator = await User.create({
            name: 'Radhika',
            email: 'radhika@gcet.edu.in',
            password: 'FacultyPassword123!',
            role: 'Faculty',
            department: 'CSE-CS'
        });

        console.log('✅ Users Seeded (Admin, PO, Club President, Coordinator)');

        const Event = require('./models/Event');
        await Event.deleteMany({});
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const sampleEvents = [
            {
                title: 'Cyber Security Awareness Workshop',
                type: 'Workshop',
                date: today,
                department: 'CSE-CS',
                description: 'A deep dive into zero-trust architecture.',
                location: 'Seminar Hall 1',
                coordinator: 'Radhika',
                createdBy: president._id,
                clubName: 'Cybersecurity Club',
                approvalStatus: 'Approved',
                approvalStage: 'Finalized',
                isPublic: true,
                status: 'Upcoming'
            },
            {
                title: 'Annual Hackathon 2024',
                type: 'Hackathon',
                date: tomorrow,
                department: 'CSE',
                description: '24-hour coding marathon.',
                location: 'Main Lab Complex',
                coordinator: 'HOD CSE',
                createdBy: admin._id,
                clubName: 'System',
                approvalStatus: 'Approved',
                approvalStage: 'Finalized',
                isPublic: true,
                status: 'Upcoming'
            }
        ];
        await Event.insertMany(sampleEvents);
        console.log(`✅ ${sampleEvents.length} sample events seeded`);

        // 4. Seed Placement Records
        await PlacementRecord.deleteMany({});
        const sampleRecords = [
            { studentName: 'Rahul Kumar', rollNumber: '21K91A0501', department: 'CSE', company: 'Microsoft', package: 12.5, type: 'On-Campus' },
            { studentName: 'Sneha Reddy', rollNumber: '22R11A6205', department: 'CSE-CS', company: 'CrowdStrike', package: 15.0, type: 'On-Campus' },
            { studentName: 'Anand Rao', rollNumber: '22R11A6260', department: 'CSE-CS', company: 'Palo Alto Networks', package: 14.5, type: 'Off-Campus' },
            { studentName: 'Priya Sharma', rollNumber: '21K91A0410', department: 'ECE', company: 'Qualcomm', package: 10.0, type: 'On-Campus' }
        ];
        await PlacementRecord.insertMany(sampleRecords);
        console.log(`✅ ${sampleRecords.length} placement records seeded`);

        // 4. Seed Admin User
        const adminUser = {
            name: 'Placement Officer',
            email: 'po_admin@gcet.edu.in',
            password: 'POAdminPassword123!',
            role: 'Placement Officer',
            department: 'Placements'
        };
        await User.deleteMany({ email: adminUser.email });
        await User.create(adminUser);
        console.log('✅ Placement Officer User Seeded');

        // 5. Seed Achievements
        await Achievement.deleteMany({});
        const sampleAchievements = [
            { 
                title: 'Cyber Congress 2025', 
                type: 'TECHNICAL', 
                studentName: 'S. W. Blessy Olive', 
                rollNumber: '25R15A6211', 
                level: 'National', 
                date: '30, 31 October & 1 November', 
                award: 'Participation', 
                collegeName: 'Geethanjali College of Engineering & Technology',
                phoneNumber: '9848022338',
                totalStudents: 3,
                achieverRole: 'PARTICIPANT', 
                category: 'COMPETITION', 
                department: 'CSE-CS', 
                year: '1st Year', 
                description: 'Participated in Cyber Congress 2025 event.' 
            },
            { 
                title: 'NPTEL Certification', 
                type: 'TECHNICAL', 
                studentName: 'E Sashi Dhavan', 
                rollNumber: '24R11A6212', 
                level: 'National', 
                date: 'July-Dec 2038', 
                award: 'NPTEL', 
                collegeName: 'NPTEL / Swayam',
                phoneNumber: '',
                totalStudents: 1,
                achieverRole: 'PARTICIPANT', 
                category: 'CERTIFICATION', 
                department: 'CSE-CS', 
                year: '2nd Year', 
                description: 'Successfully completed NPTEL course.' 
            },
            { 
                title: 'Smart India Hackathon', 
                type: 'TECHNICAL', 
                studentName: 'Sri Charan', 
                rollNumber: '24r11a6227', 
                level: 'National', 
                date: '30, 31 October & 1 November', 
                award: 'Winner', 
                collegeName: 'Geethanjali College of Engineering & Technology',
                phoneNumber: '9988776655',
                totalStudents: 4,
                achieverRole: 'WINNER', 
                category: 'HACKATHON', 
                department: 'CSE-CS', 
                year: '2nd Year', 
                description: 'Winner of SIH internal round.' 
            }
        ];
        await Achievement.insertMany(sampleAchievements);
        console.log(`✅ ${sampleAchievements.length} achievements seeded`);

        console.log('🏁 Seeding finished successfully!');
        process.exit();
    } catch (err) {
        console.error('❌ Seeding Error:', err);
        process.exit(1);
    }
};

seedDB();
