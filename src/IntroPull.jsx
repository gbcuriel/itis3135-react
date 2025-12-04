import React, { useState, useEffect } from 'react';

export default function IntroPull() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rawData, setRawData] = useState(null);
    const [showDebug, setShowDebug] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    // --- 1. DATA FETCHING ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://dvonb.xyz/api/2025-fall/itis-3135/students?full=1');

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setRawData(data);

                let studentArray = [];
                if (Array.isArray(data)) {
                    studentArray = data;
                } else if (data && typeof data === 'object') {
                    if (Array.isArray(data.data)) {
                        studentArray = data.data;
                    } else if (Array.isArray(data.students)) {
                        studentArray = data.students;
                    } else {
                        studentArray = Object.values(data);
                    }
                }

                setStudents(studentArray);

            } catch (err) {
                console.error("Fetch Error:", err);
                setError("Failed to load data. " + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- 2. HELPERS ---
    const extractTextFromValue = (val) => {
        if (!val) return "";
        if (typeof val === 'string') return val;
        if (typeof val === 'number') return String(val);

        if (typeof val === 'object') {
            if (val.rendered) return String(val.rendered);
            if (val.value) return String(val.value);

            // Handle Name objects
            if (val.first || val.last) return [val.first, val.last].filter(Boolean).join(" ");
            if (val.firstName || val.lastName) return [val.firstName, val.lastName].filter(Boolean).join(" ");
            if (val.name) return String(val.name);

            // Handle Computer objects (device, os)
            if (val.device || val.os) return [val.device, val.os].filter(Boolean).join(", ");

            return JSON.stringify(val);
        }
        return String(val);
    };

    const getField = (student, ...keys) => {
        // We search in the root student object, the 'acf' object (WordPress Advanced Custom Fields), and 'data'
        const sources = [student, student.acf, student.data].filter(Boolean);

        for (const source of sources) {
            for (const key of keys) {
                // Check exact match
                let val = source[key];

                // If not found, try lowercase variation if the key passed was Title Case
                if ((val === undefined || val === null) && typeof key === 'string') {
                    val = source[key.toLowerCase()] || source[key.replace(/\s+/g, '_').toLowerCase()];
                }

                if (val !== undefined && val !== null && val !== "") {
                    return extractTextFromValue(val);
                }
            }
        }
        return null;
    };

    const getArrayField = (student, ...keys) => {
        const sources = [student, student.acf, student.data].filter(Boolean);
        for (const source of sources) {
            for (const key of keys) {
                let val = source[key];
                // If not found, try lowercase variation
                if ((val === undefined || val === null) && typeof key === 'string') {
                    val = source[key.toLowerCase()] || source[key.replace(/\s+/g, '_').toLowerCase()];
                }

                if (Array.isArray(val)) return val;
                if (typeof val === 'string' && val.includes(',')) return val.split(',').map(s => s.trim());
            }
        }
        return [];
    };

    const generateEmail = (nameStr) => {
        if (!nameStr || nameStr === "Anonymous") return "No Email";
        const parts = nameStr.trim().split(/\s+/);
        if (parts.length < 1) return "No Email";
        const firstInitial = parts[0].charAt(0).toLowerCase();
        const lastName = parts[parts.length - 1].replace(/[^a-zA-Z]/g, "").toLowerCase();
        return `${firstInitial}${lastName}@charlotte.edu`;
    };

    const cleanQuoteString = (str) => {
        if (!str) return "";
        return str.trim().replace(/^["“'‘\s]+|["”'’\s]+$/g, '');
    };

    const resolveImage = (student) => {
        let foundImage = null;
        if (student.media && student.media.src) {
            foundImage = student.media.src;
        }
        if (!foundImage) {
            const sources = [student, student.acf, student.data].filter(Boolean);
            const imageKeys = ['image', 'avatar', 'photo', 'picture', 'featured_image', 'featured_media_src_url'];
            for (const source of sources) {
                for (const key of imageKeys) {
                    const val = source[key];
                    if (val) {
                        if (typeof val === 'string') foundImage = val;
                        else if (val.url) foundImage = val.url;
                        else if (val.guid) foundImage = val.guid;
                        if (foundImage) break;
                    }
                }
                if (foundImage) break;
            }
        }
        if (foundImage) {
            if (foundImage.startsWith('/')) {
                return `https://dvonb.xyz${foundImage}`;
            }
            return foundImage;
        }
        return null;
    };

    // --- 3. FILTERING & PAGINATION ---
    const filteredStudents = students.filter(student => {
        if (!student) return false;
        const name = getField(student, "name", "student_name", "firstName", "full_name") || "";
        const intro = getField(student, "introduction", "intro", "bio", "personalStatement") || "";

        // Update filtering to search inside the new background object if possible
        // Ideally we search the extracted string, but for simplicity here we rely on the main getField fallback
        // or just the intro/name/email for search to keep it fast.

        const term = searchTerm.toLowerCase();
        return (name && name.toLowerCase().includes(term)) ||
            (intro && intro.toLowerCase().includes(term));
    });

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // --- 4. RENDER ---
    const styles = `
    .cm-wrapper {
        font-family: 'Segoe UI', Arial, sans-serif;
        padding: 2rem 1rem;
        min-height: 100vh;
    }
    .cm-container {
        max-width: 1400px;
        width: 90%;
        margin: 0 auto;
        background: linear-gradient(135deg, #000000 0%, #ff5e62 100%);
        border-radius: 20px;
        box-shadow: 0 8px 32px rgba(255, 94, 98, 0.18);
        padding: 2rem;
        color: #fff;
    }
    .cm-nav a {
        color: #ffb07c;
        text-decoration: none;
        font-weight: bold;
    }
    .cm-header {
        text-align: center;
        margin-bottom: 3rem;
    }
    .cm-title {
        font-size: 2.5rem;
        margin: 0;
        font-weight: bold;
    }
    .cm-subtitle {
        margin-top: 0.5rem;
        color: #ffb07c;
    }
    
    /* Controls */
    .cm-controls {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        margin-bottom: 3rem;
    }
    .cm-search-input {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        padding: 0.75rem;
        color: white;
        width: 100%;
        max-width: 400px;
        font-size: 1rem;
    }
    .cm-select {
        background-color: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(255, 176, 124, 0.3);
        color: white;
        padding: 0.3rem 0.5rem;
        border-radius: 5px;
        cursor: pointer;
    }
    .cm-select option {
        background-color: #000;
    }

    /* List Layout */
    .cm-list {
        display: flex;
        flex-direction: column;
        gap: 4rem;
    }

    /* Card Design */
    .cm-card {
        background-color: rgba(0, 0, 0, 0.4); 
        border: 1px solid rgba(255, 176, 124, 0.3);
        border-radius: 12px;
        padding: 3rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
    .cm-avatar img {
        width: 500px;
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        border: 4px solid #ffb07c;
        box-shadow: 0 4px 15px rgba(0,0,0,0.5);
        margin-bottom: 1rem;
    }
    .cm-avatar-placeholder {
        font-size: 4rem;
        margin-bottom: 1rem;
    }
    .cm-caption {
        font-style: italic;
        color: #ffb07c;
        margin-bottom: 1.5rem;
    }
    
    /* Updated Name Header Styles */
    .cm-name-header {
        font-size: 2rem;
        font-weight: 700;
        margin: 0 0 1.5rem 0;
        color: #ffffff;
        text-align: center;
        border-bottom: 2px solid #ffb07c;
        padding-bottom: 0.5rem;
        width: 100%;
        max-width: 800px;
    }
    .cm-mascot-divider {
        color: #ffb07c;
        margin: 0 0.5rem;
    }
    .cm-mascot {
        color: #ffdcd1;
        font-style: italic;
    }

    /* Content Sections */
    .cm-content {
        width: 100%;
        max-width: 900px;
        text-align: left;
    }
    .cm-main-intro {
        font-size: 1.1rem;
        line-height: 1.6;
        margin-bottom: 2rem;
        text-align: center; /* Intro text centered like image */
    }
    
    .cm-details-section {
        margin-top: 1.5rem;
        font-size: 1rem;
        line-height: 1.5;
    }
    .cm-label {
        color: #ffffff;
        font-weight: 800;
        margin-right: 0.5rem;
    }
    .cm-value {
        color: #ffdcd1;
    }

    .cm-courses-list {
        margin-top: 0.5rem;
        padding-left: 0;
        list-style: none;
    }
    .cm-course-item {
        margin-bottom: 0.3rem;
        color: #ffdcd1;
    }

    .cm-quote {
        margin-top: 3rem;
        padding-top: 2rem;
        border-top: 1px solid rgba(255, 176, 124, 0.2);
        font-style: italic;
        text-align: center;
        color: #ffb07c;
        font-size: 1.1rem;
    }

    /* Pagination */
    .cm-pagination {
        margin-top: 3rem;
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        flex-wrap: wrap;
    }
    .cm-btn {
        background: #c74646;
        border: 1px solid white;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 5px;
        cursor: pointer;
    }
    .cm-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    `;

    if (loading) return <div className="cm-wrapper" style={{ color: 'white', textAlign: 'center' }}>Loading...</div>;
    if (error) return <div className="cm-wrapper" style={{ color: 'red', textAlign: 'center' }}>{error}</div>;

    return (
        <>
            <style>{styles}</style>
            <div className="cm-wrapper">
                <div className="cm-container">
                    <div className="cm-nav"><a href="/">← Back to Home</a></div>

                    <div className="cm-header">
                        <h2 className="cm-title">Meet the Class</h2>
                        <p className="cm-subtitle">ITIS 3135 Student Directory</p>
                    </div>

                    <div className="cm-controls">
                        <input
                            type="text"
                            className="cm-search-input"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                        <div>
                            <span style={{ color: '#ffb07c' }}>Show </span>
                            <select className="cm-select" value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                                <option value={1}>1</option>
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={50}>50</option>
                            </select>
                            <span style={{ color: '#ffb07c' }}> per page</span>
                        </div>
                        <div style={{ color: '#ffb07c' }}>{filteredStudents.length} Students found</div>
                    </div>

                    {/* Top Pagination */}
                    {filteredStudents.length > itemsPerPage && (
                        <div className="cm-pagination" style={{ marginBottom: '2rem' }}>
                            <button className="cm-btn" onClick={() => paginate(1)} disabled={currentPage === 1}>First</button>
                            <button className="cm-btn" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>Prev</button>
                            <span style={{ padding: '0.5rem', color: '#ffb07c' }}>{currentPage} / {totalPages}</span>
                            <button className="cm-btn" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
                            <button className="cm-btn" onClick={() => paginate(totalPages)} disabled={currentPage === totalPages}>Last</button>
                        </div>
                    )}

                    <div className="cm-list">
                        {currentStudents.map((student, index) => {
                            const name = getField(student, "name", "full_name", "firstName") || "Student";
                            const intro = getField(student, "introduction", "intro", "bio", "personalStatement") || "";
                            const caption = getField(student, "caption", "image_caption", "location");
                            const image = resolveImage(student);

                            // --- IMPROVED BACKGROUND EXTRACTION ---
                            let backgroundObj = null;
                            const possibleSources = [student, student.acf, student.data].filter(Boolean);

                            for (const src of possibleSources) {
                                // Check for "backgrounds" (plural) or "background" (singular)
                                let bg = src.backgrounds || src.Backgrounds || src.background || src.Background;

                                if (bg) {
                                    // Parse if string
                                    if (typeof bg === 'string' && bg.trim().startsWith('{')) {
                                        try {
                                            bg = JSON.parse(bg);
                                        } catch (e) {
                                            // ignore parse error
                                        }
                                    }
                                    // If we found an object, use it
                                    if (typeof bg === 'object') {
                                        backgroundObj = bg;
                                        break;
                                    }
                                }
                            }

                            // 1. Personal Background
                            let personalBackground = backgroundObj?.personal || backgroundObj?.Personal;
                            // Fallback to top-level fields
                            if (!personalBackground) {
                                personalBackground = getField(student,
                                    "personal", "Personal",
                                    "personal_background", "Personal Background",
                                    "personal_bio", "Personal Bio"
                                );
                            }

                            // 2. Professional Background
                            let professionalBackground = backgroundObj?.professional || backgroundObj?.Professional;
                            if (!professionalBackground) {
                                professionalBackground = getField(student,
                                    "professional", "Professional",
                                    "professional_background", "Professional Background",
                                    "work_experience", "Work Experience",
                                    "job", "Job"
                                );
                            }

                            // 3. Academic Background
                            let academicBackground = backgroundObj?.academic || backgroundObj?.Academic;
                            if (!academicBackground) {
                                academicBackground = getField(student,
                                    "academic", "Academic",
                                    "academic_background", "Academic Background",
                                    "academic_history", "Academic History",
                                    "education", "Education",
                                    "major", "Major"
                                );
                            }

                            // Computer
                            const computer = getField(student,
                                "primary_computer", "Primary Computer",
                                "computer_platform", "Computer Platform",
                                "computer_os", "Computer OS",
                                "computer", "Computer",
                                "platform", "Platform"
                            );

                            // Funny Item
                            const funFact = getField(student,
                                "funny_item", "Funny Item",
                                "interesting_item", "Interesting Item",
                                "item_to_remember_me_by", "Item to Remember Me By",
                                "fun_fact", "funFact"
                            );

                            // Mascot and Divider
                            const mascot = getField(student, "mascot", "Mascot", "mascot_name", "animal");
                            const divider = getField(student, "separator", "Separator", "separation_string", "divider") || "||";

                            // Courses Processing
                            const coursesRaw = getArrayField(student,
                                "courses", "Courses",
                                "courses_taking", "Courses Taking",
                                "courses_i'm_taking, _&_why", "Courses I'm Taking, & Why", // Handle the complex key
                                "classes", "Classes"
                            );

                            let coursesList = [];
                            if (coursesRaw && coursesRaw.length > 0) {
                                coursesList = coursesRaw.map((c, i) => {
                                    if (typeof c === 'string') {
                                        // Attempt to identify course code at start (e.g., ITIS 3135 or ITIS-3135)
                                        const match = c.match(/^([A-Z]{3,4}[\s-]?\d{3,4}[A-Z]?)(.*)$/);
                                        if (match) {
                                            return <span key={i}><strong>{match[1]}</strong>{match[2]}</span>;
                                        }
                                        return <span key={i}>{c}</span>;
                                    }

                                    // Handle object structure
                                    const code = c.code || c.course_code;
                                    const title = c.title || c.course_title;
                                    const reason = c.reason || c.why;

                                    if (code || title || reason) {
                                        return (
                                            <span key={i}>
                                                {code && <strong>{code}</strong>}
                                                {code && title && " - "}
                                                {title}
                                                {(code || title) && reason && ": "}
                                                {reason}
                                            </span>
                                        );
                                    }

                                    // Fallback
                                    return <span key={i}>{JSON.stringify(c).replace(/["{}]/g, '')}</span>;
                                });
                            }

                            // Quote Processing
                            let quote = getField(student, "quote", "Favorite Quote", "favorite_quote");
                            let quoteAuthor = getField(student, "quote_author", "Quote Author", "author");
                            // Simple JSON parse check for quote object
                            if (quote && quote.trim().startsWith('{')) {
                                try {
                                    const parsed = JSON.parse(quote);
                                    if (parsed.text) quote = parsed.text;
                                    if (parsed.author) quoteAuthor = parsed.author;
                                } catch (e) { }
                            }
                            quote = cleanQuoteString(quote);

                            return (
                                <div key={index} className="cm-card">

                                    {/* Name Header with Mascot */}
                                    <h3 className="cm-name-header">
                                        {name}
                                        {mascot && (
                                            <>
                                                <span className="cm-mascot-divider">{divider}</span>
                                                <span className="cm-mascot">{mascot}</span>
                                            </>
                                        )}
                                    </h3>

                                    <div className="cm-avatar">
                                        {image ? <img src={image} alt={name} /> : <div className="cm-avatar-placeholder">👤</div>}
                                    </div>

                                    {caption && <div className="cm-caption">{caption}</div>}

                                    <div className="cm-content">
                                        {/* Main Intro */}
                                        {intro && <div className="cm-main-intro" dangerouslySetInnerHTML={{ __html: intro }} />}

                                        {/* Detailed Sections (Platform, Backgrounds, Academic) */}
                                        {personalBackground && (
                                            <div className="cm-details-section">
                                                <span className="cm-label">Personal Background:</span>
                                                <span className="cm-value">{personalBackground}</span>
                                            </div>
                                        )}

                                        {professionalBackground && (
                                            <div className="cm-details-section">
                                                <span className="cm-label">Professional Background:</span>
                                                <span className="cm-value">{professionalBackground}</span>
                                            </div>
                                        )}

                                        {academicBackground && (
                                            <div className="cm-details-section">
                                                <span className="cm-label">Academic Background:</span>
                                                <span className="cm-value">{academicBackground}</span>
                                            </div>
                                        )}

                                        {computer && (
                                            <div className="cm-details-section">
                                                <span className="cm-label">Primary Computer:</span>
                                                <span className="cm-value">{computer}</span>
                                            </div>
                                        )}

                                        {/* Courses List */}
                                        {coursesList.length > 0 && (
                                            <div className="cm-details-section">
                                                <span className="cm-label">Courses I'm Taking, & Why:</span>
                                                <ul className="cm-courses-list">
                                                    {coursesList.map((c, i) => (
                                                        <li key={i} className="cm-course-item">{c}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {funFact && (
                                            <div className="cm-details-section">
                                                <span className="cm-label">Funny/Interesting Item to Remember Me by:</span>
                                                <span className="cm-value">{funFact}</span>
                                            </div>
                                        )}

                                        {quote && (
                                            <div className="cm-quote">
                                                "{quote}" {quoteAuthor && <span>~ {quoteAuthor}</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Bottom Pagination */}
                    {filteredStudents.length > itemsPerPage && (
                        <div className="cm-pagination">
                            <button className="cm-btn" onClick={() => paginate(1)} disabled={currentPage === 1}>First</button>
                            <button className="cm-btn" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>Prev</button>
                            <span style={{ padding: '0.5rem', color: '#ffb07c' }}>{currentPage} / {totalPages}</span>
                            <button className="cm-btn" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
                            <button className="cm-btn" onClick={() => paginate(totalPages)} disabled={currentPage === totalPages}>Last</button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}