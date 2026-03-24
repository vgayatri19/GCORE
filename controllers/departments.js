const Department = require('../models/Department');
const Faculty = require('../models/Faculty');
const Event = require('../models/Event');
const Achievement = require('../models/Achievement');
const AcademicRecord = require('../models/AcademicRecord');
const PlacementRecord = require('../models/PlacementRecord');
const Club = require('../models/Club');
const fs = require('fs');
const csv = require('csv-parser');
const ExcelJS = require('exceljs');
const path = require('path');
const { uploadFile } = require('../utils/supabaseUpload');

// @desc    Get all departments
// @route   GET /departments
// @access  Public
exports.getDepartments = async (req, res, next) => {
    try {
        const departments = await Department.find();
        res.render('departments/index', { departments });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Get single department
// @route   GET /departments/:id
// @access  Public
exports.getDepartment = async (req, res, next) => {
    try {
        const department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).send('Department not found');
        }

        // Fetch related data
        const faculty = await Faculty.find({ department: department.name });
        const events = await Event.find({ department: department.name }).sort({ date: 1 });
        const achievements = await Achievement.find({ department: department.name }).sort({ date: -1 });

        // Calculate stats dynamically if needed, or use stored stats
        // Here we can update the counts on the fly just to be sure
        department.totalFaculty = faculty.length;
        department.totalStudents = 120; // Mock data or should be in DB
        department.totalLabs = 5; // Mock data
        // department.placementRate is stored

        res.render('departments/show', {
            department,
            faculty,
            events,
            achievements
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Create new department
// @route   POST /departments
// @access  Private (Admin)
exports.createDepartment = async (req, res, next) => {
    try {
        await Department.create(req.body);
        res.redirect('/departments');
    } catch (err) {
        console.error(err);
        res.status(400).send(err.message);
    }
};

// @desc    Add faculty to department
// @route   POST /departments/:id/faculty
// @access  Private (Admin/HOD)
exports.addFaculty = async (req, res, next) => {
    try {
        // Ensure department name is correct
        const department = await Department.findById(req.params.id);
        req.body.department = department.name;

        await Faculty.create(req.body);
        res.redirect(`/departments/${req.params.id}`);
    } catch (err) {
        console.error(err);
        res.status(400).send(err.message);
    }
};

// @desc    Add event
// @route   POST /departments/:id/events
// @access  Private (Admin/HOD)
exports.addEvent = async (req, res, next) => {
    try {
        const department = await Department.findById(req.params.id);
        req.body.department = department.name;

        await Event.create(req.body);
        res.redirect(`/departments/${req.params.id}`);
    } catch (err) {
        console.error(err);
        res.status(400).send(err.message);
    }
};
// @desc    Get achievement analysis
// @route   GET /departments/:id/analysis
// @access  Private (Admin/HOD)
exports.getAchievementAnalysis = async (req, res, next) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) return res.status(404).send('Department not found');

        const achievements = await Achievement.find({ department: department.name });
        const academics = await AcademicRecord.find({ department: department.name });
        const placements = await PlacementRecord.find({ department: department.name });
        const events = await Event.find({ department: department.name, approvalStatus: 'Approved' });
        const totalDeptStudents = department.totalStudents || 120;

        // Aggregate stats for charts
        const stats = {
            roles: { Winner: 0, Participant: 0 },
            categories: { Academic: 0, Extracurricular: 0 },
            levels: { Local: 0, State: 0, National: 0, International: 0 },
            batches: {}, 
            years: {},
            types: { COURSE: 0, COMPETITION: 0, HACKATHON: 0, CERTIFICATION: 0, WORKSHOP: 0, RESEARCH: 0 },
            
            // 2. Extracurricular Engagement
            engagement: {
                totalEvents: events.length,
                uniqueParticipants: new Set(),
                participationRate: 0,
                clubMates: 0 // Placeholder or calculated from Users
            },

            // 3. Skill Development
            skills: {
                certs: 0,
                workshops: 0,
                internships: 0,
                correlation: {
                    withCerts: { total: 0, placed: 0 },
                    withoutCerts: { total: 0, placed: 0 }
                }
            },

            // 4. Academic Performance
            academics: {
                passRate: 0,
                avgCgpa: 0,
                backlogCount: 0,
                semesters: {} // sem -> { pass: 0, fail: 0, total: 0, cgpaSum: 0 }
            },

            // 5. Efficiency
            efficiency: {
                avgApprovalDays: 0,
                processedCount: 0
            }
        };

        const studentsWithCerts = new Set();

        achievements.forEach(a => {
            // Group Roles
            if (['WINNER', 'RUNNER_UP'].includes(a.achieverRole)) {
                stats.roles.Winner++;
            } else {
                stats.roles.Participant++;
            }

            // Group Categories
            if (['COURSE', 'RESEARCH', 'CERTIFICATION', 'INTERNSHIP'].includes(a.category)) {
                stats.categories.Academic++;
            } else {
                stats.categories.Extracurricular++;
            }

            // Track Levels
            if (stats.levels[a.level] !== undefined) stats.levels[a.level]++;

            // Track Batches
            const batch = extractBatch(a.rollNumber);
            if (!stats.batches[batch]) {
                stats.batches[batch] = { total: 0, events: new Set(), students: new Set(), certs: 0 };
            }
            stats.batches[batch].total++;
            if (a.title) stats.batches[batch].events.add(a.title.trim().toUpperCase());
            if (a.rollNumber) {
                const roll = a.rollNumber.trim().toUpperCase();
                stats.batches[batch].students.add(roll);
                stats.engagement.uniqueParticipants.add(roll);
            }

            if (['COURSE', 'CERTIFICATION'].includes(a.category)) {
                stats.batches[batch].certs++;
                stats.skills.certs++;
                if (a.rollNumber) studentsWithCerts.add(a.rollNumber.trim().toUpperCase());
            }

            if (a.category === 'WORKSHOP') stats.skills.workshops++;
            if (a.category === 'INTERNSHIP') stats.skills.internships++;

            const typeKey = a.category || 'COMPETITION';
            stats.types[typeKey] = (stats.types[typeKey] || 0) + 1;
        });

        // 4. Academic Processing
        let totalCgpa = 0;
        let passCount = 0;
        academics.forEach(r => {
            totalCgpa += r.cgpa || 0;
            if (r.passStatus === 'Pass') passCount++;
            stats.academics.backlogCount += r.backlogs || 0;

            if (!stats.academics.semesters[r.semester]) {
                stats.academics.semesters[r.semester] = { pass: 0, fail: 0, total: 0, cgpaSum: 0 };
            }
            const sem = stats.academics.semesters[r.semester];
            sem.total++;
            sem.cgpaSum += r.cgpa || 0;
            if (r.passStatus === 'Pass') sem.pass++; else sem.fail++;
        });

        if (academics.length > 0) {
            stats.academics.passRate = ((passCount / academics.length) * 100).toFixed(1);
            stats.academics.avgCgpa = (totalCgpa / academics.length).toFixed(2);
        }

        // 5. Efficiency Calculation
        let totalApprovalTime = 0;
        events.forEach(e => {
            if (e.approvedAt && e.proposedAt) {
                const diffTime = Math.abs(e.approvedAt - e.proposedAt);
                const diffDays = diffTime / (1000 * 60 * 60 * 24);
                totalApprovalTime += diffDays;
                stats.efficiency.processedCount++;
            }
        });
        if (stats.efficiency.processedCount > 0) {
            stats.efficiency.avgApprovalDays = (totalApprovalTime / stats.efficiency.processedCount).toFixed(1);
        }

        // Skill-Placement Correlation
        placements.forEach(p => {
            const roll = p.rollNumber.trim().toUpperCase();
            if (studentsWithCerts.has(roll)) {
                stats.skills.correlation.withCerts.total++;
                stats.skills.correlation.withCerts.placed++;
            } else {
                stats.skills.correlation.withoutCerts.total++;
                stats.skills.correlation.withoutCerts.placed++;
            }
        });

        // Finalize Batches & Engagement
        Object.keys(stats.batches).forEach(b => {
            stats.batches[b].uniqueEvents = stats.batches[b].events.size;
            stats.batches[b].uniqueStudents = stats.batches[b].students.size;
            delete stats.batches[b].events;
            delete stats.batches[b].students;
        });
        stats.engagement.participationRate = ((stats.engagement.uniqueParticipants.size / totalDeptStudents) * 100).toFixed(1);

        res.render('departments/analysis', { 
            department, 
            stats, 
            total: achievements.length,
            studentCount: totalDeptStudents
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
// @desc    Show add achievement form
// @route   GET /departments/:id/achievements/add
// @access  Private (Admin/HOD)
exports.getAddAchievement = async (req, res, next) => {
    try {
        const department = await Department.findById(req.params.id);
        res.render('departments/add-achievement', { department });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Mappings for validation and normalization
const typeMap = {
    "TECHNICAL": "TECHNICAL",
    "NON_TECHNICAL": "NON_TECHNICAL",
    "SPORTS": "SPORTS",
    "CULTURAL": "CULTURAL",
    "TECHNICAL_ACHIEVEMENT": "TECHNICAL",
    "NON_TECHNICAL_ACHIEVEMENT": "NON_TECHNICAL"
};

const roleMap = {
    "PARTICIPANT": "PARTICIPANT",
    "WINNER": "WINNER",
    "RUNNER_UP": "RUNNER_UP",
    "ORGANIZER": "ORGANIZER"
};

const categoryMap = {
    "HACKATHON": "HACKATHON",
    "WORKSHOP": "WORKSHOP",
    "INTERNSHIP": "INTERNSHIP",
    "COMPETITION": "COMPETITION",
    "RESEARCH": "RESEARCH",
    "CERTIFICATION": "CERTIFICATION",
    "COURSE": "COURSE",
    "ACHIEVEMENTS": "COMPETITION"
};

// Helper to extract batch from roll number
const extractBatch = (roll) => {
    if (!roll) return 'Other';
    // Capture first two digits (year)
    const match = roll.toString().trim().match(/^(\d{2})/);
    if (!match) return 'Other';
    
    let year = parseInt(match[1]);
    // Lateral entry check: 15A indicates joining the batch that started a year earlier
    if (roll.toString().toUpperCase().includes('15A')) {
        year -= 1;
    }
    
    const startYear = 2000 + year;
    return `Batch ${startYear}-${startYear + 4}`;
};

const normalizeStr = (str) => {
    if (!str) return "";
    return str.toString().trim().toUpperCase().replace(/[\s-]/g, "_");
};

// @desc    Create achievement
// @route   POST /departments/:id/achievements
// @access  Private (Admin/HOD)
exports.createAchievement = async (req, res, next) => {
    try {
        const department = await Department.findById(req.params.id);
        req.body.department = department.name;

        // Basic validation for manual entry
        if (!req.body.title || !req.body.studentName || !req.body.rollNumber) {
            return res.status(400).send("Please provide title, student name, and roll number");
        }

        await Achievement.create(req.body);
        res.redirect(`/departments/${req.params.id}#achievements`);
    } catch (err) {
        console.error(err);
        res.status(400).send(err.message);
    }
};

// @desc    Upload data from file (CSV or Excel)
// @route   POST /departments/:id/upload
// @access  Private (Admin/HOD)
exports.uploadData = async (req, res, next) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) return res.status(404).send('Department not found');

        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }

        const filePath = req.file.path;
        const fileExt = path.extname(req.file.originalname).toLowerCase();
        let results = [];

        // Helper to map row data to schema with normalization and mapping
        const mapToAchievement = (row, index) => {
            // Helper to find value from row using multiple possible key patterns (case-insensitive, trimmed)
            const getVal = (row, patterns) => {
                const keys = Object.keys(row);
                for (const pattern of patterns) {
                    const normalizedPattern = pattern.toLowerCase().trim();
                    const matchingKey = keys.find(k => k.toLowerCase().trim() === normalizedPattern);
                    if (matchingKey && row[matchingKey] !== undefined && row[matchingKey] !== null) {
                        return row[matchingKey].toString().trim();
                    }
                }
                return null;
            };

            const title = getVal(row, ['Name of the Event', 'title', 'ACHIEVEMENT', 'Event']) || '';
            const studentName = getVal(row, ['Name of the Student', 'studentName', 'Student', 'Name']) || '';
            const rollNumber = getVal(row, ['Roll No', 'rollNumber', 'rollno', 'Roll Number']) || '';

            if (!title || !studentName || !rollNumber) {
                console.warn(`Row ${index + 2} skipped: Missing mandatory fields (Title: ${title}, Name: ${studentName}, Roll: ${rollNumber})`);
                return null;
            }

            const rawType = normalizeStr(getVal(row, ['type', 'Type']) || '');
            const rawRole = normalizeStr(getVal(row, ['achieverRole', 'Role', 'Participant', 'Result', 'Name of the award if any']) || '');
            const rawCategory = normalizeStr(getVal(row, ['category', 'Category']) || '');

            const mappedType = typeMap[rawType] || "TECHNICAL";
            const mappedRole = roleMap[rawRole] || "PARTICIPANT";
            let mappedCategory = categoryMap[rawCategory] || "COMPETITION";

            const collegeName = getVal(row, ['Name of College', 'collegeName', 'College']) || 'Geethanjali College of Engineering & Technology';

            // Special handling for NPTEL - identify as Course
            if (title.toUpperCase().includes('NPTEL') || collegeName.toUpperCase().includes('NPTEL')) {
                mappedCategory = 'COURSE';
            }

            return {
                title: title,
                type: mappedType,
                studentName: studentName,
                rollNumber: rollNumber,
                level: getVal(row, ['State /National/ International level', 'level', 'Level']) || 'N/A',
                date: getVal(row, ['Date of Event', 'date', 'Date']) || 'N/A',
                award: getVal(row, ['Name of the award if any', 'award', 'Award']) || 'Participation',
                collegeName: collegeName,
                phoneNumber: getVal(row, ['Ph.no', 'phoneNumber', 'Phone']) || '',
                totalStudents: parseInt(getVal(row, ['Total of no Students', 'totalStudents', 'Count'])) || 1,
                achieverRole: mappedRole,
                category: mappedCategory,
                year: getVal(row, ['year', 'Year']) || 'N/A',
                description: getVal(row, ['description', 'Highlights']) || '',
                department: department.name
            };
        };

        const processAndCleanup = async (dataRows) => {
            try {
                const achievements = dataRows.map((row, idx) => mapToAchievement(row, idx)).filter(a => a !== null);

                if (achievements.length === 0) {
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                    return res.status(400).send('No valid achievement data found. Ensure "Roll No", "Name of the Student", and "Name of the Event" headers are present and filled.');
                }

                await Achievement.insertMany(achievements);

                try {
                    await uploadFile(filePath, req.file.originalname, req.file.mimetype);
                } catch (uploadError) {
                    console.error("Failed to upload achievement data to Supabase:", uploadError);
                }

                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                res.redirect(`/departments/${req.params.id}#achievements`);
            } catch (err) {
                console.error('Processing Error Detailed:', err);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                let errorMsg = 'Error processing data file';
                if (err.name === 'ValidationError') {
                    errorMsg = `Validation Error: ${Object.values(err.errors).map(val => val.message).join(', ')}`;
                } else if (err.code === 11000) {
                    errorMsg = 'Duplicate entry detected';
                }
                res.status(400).send(errorMsg);
            }
        };

        if (fileExt === '.csv') {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', async () => {
                    await processAndCleanup(results);
                });
        } else if (fileExt === '.xlsx') {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(filePath);
            
            const jsonData = [];
            
            workbook.eachSheet((worksheet) => {
                const headers = [];
                worksheet.getRow(1).eachCell((cell, colNumber) => {
                    // Normalize header cell value
                    let val = cell.value;
                    if (val && typeof val === 'object' && val.richText) val = val.richText.map(t => t.text).join('');
                    if (val && typeof val === 'object' && val.result) val = val.result;
                    headers[colNumber] = val ? val.toString().trim() : null;
                });

                worksheet.eachRow((row, rowNumber) => {
                    if (rowNumber === 1) return; // Skip headers
                    const rowData = {};
                    let hasData = false;
                    row.eachCell((cell, colNumber) => {
                        const header = headers[colNumber];
                        if (header) {
                            let val = cell.value;
                            // Handle ExcelJS value types (RichText, Formulas, etc)
                            if (val && typeof val === 'object' && val.richText) val = val.richText.map(t => t.text).join('');
                            if (val && typeof val === 'object' && val.result !== undefined) val = val.result;
                            
                            rowData[header] = val !== null && val !== undefined ? val.toString().trim() : '';
                            hasData = true;
                        }
                    });
                    if (hasData) jsonData.push(rowData);
                });
            });

            results = jsonData;
            await processAndCleanup(results);
        } else {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return res.status(400).send('Unsupported file format');
        }

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @desc    Upload Academic records
// @route   POST /departments/:id/upload-academics
// @access  Private (Admin/HOD)
exports.uploadAcademicData = async (req, res, next) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) return res.status(404).send('Department not found');

        if (!req.file) return res.status(400).send('No file uploaded');

        const filePath = req.file.path;
        const fileExt = path.extname(req.file.originalname).toLowerCase();
        let results = [];

        const mapToAcademic = (row) => {
            const getVal = (row, patterns) => {
                const keys = Object.keys(row);
                for (const pattern of patterns) {
                    const matchingKey = keys.find(k => k.toLowerCase().trim() === pattern.toLowerCase().trim());
                    if (matchingKey && row[matchingKey] !== undefined && row[matchingKey] !== null) {
                        return row[matchingKey].toString().trim();
                    }
                }
                return null;
            };

            const roll = getVal(row, ['Roll No', 'rollNumber', 'Roll']);
            const name = getVal(row, ['Name', 'studentName', 'Student Name']);
            const cgpaVal = getVal(row, ['CGPA', 'GPA']);
            const cgpa = cgpaVal ? parseFloat(cgpaVal) : NaN;
            const sem = getVal(row, ['Semester', 'Sem']);

            if (!roll || !name || isNaN(cgpa)) {
                return null;
            }

            return {
                rollNumber: roll,
                studentName: name,
                cgpa: cgpa,
                semester: sem || 'N/A',
                department: department.name,
                backlogs: parseInt(getVal(row, ['Backlogs', 'Arrears'])) || 0,
                passStatus: (getVal(row, ['Status', 'Result', 'Pass/Fail']) || 'Pass').toLowerCase().includes('fail') ? 'Fail' : 'Pass'
            };
        };

        const processRows = async (rows) => {
            try {
                const records = rows.map(mapToAcademic).filter(r => r !== null);
                if (records.length === 0) {
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                    return res.status(400).send('No valid academic data found.');
                }
                await AcademicRecord.insertMany(records);
                try {
                    await uploadFile(filePath, req.file.originalname, req.file.mimetype);
                } catch (uploadError) {
                    console.error("Failed to upload academic data to Supabase:", uploadError);
                }
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                res.redirect(`/departments/${req.params.id}#analysis`);
            } catch (err) {
                console.error(err);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                res.status(400).send('Error inserting records');
            }
        };

        if (fileExt === '.csv') {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (d) => results.push(d))
                .on('end', async () => {
                    await processRows(results);
                });
        } else if (fileExt === '.xlsx') {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(filePath);
            workbook.eachSheet(sheet => {
                const headers = [];
                sheet.getRow(1).eachCell((cell, i) => {
                    let val = cell.value;
                    if (val && typeof val === 'object' && val.richText) val = val.richText.map(t => t.text).join('');
                    headers[i] = val ? val.toString().trim() : null;
                });
                sheet.eachRow((row, i) => {
                    if (i === 1) return;
                    const data = {};
                    row.eachCell((cell, j) => {
                        const header = headers[j];
                        if (header) {
                            let val = cell.value;
                            if (val && typeof val === 'object' && val.richText) val = val.richText.map(t => t.text).join('');
                            data[header] = val !== null && val !== undefined ? val.toString().trim() : '';
                        }
                    });
                    results.push(data);
                });
            });
            await processRows(results);
        } else {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return res.status(400).send('Unsupported format');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Upload failed');
    }
};
