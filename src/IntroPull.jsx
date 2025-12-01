import React, { useState, useEffect } from 'react';

export default function Classmates() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rawData, setRawData] = useState(null);
    const [showDebug, setShowDebug] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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
            if (val.first || val.last) return [val.first, val.last].filter(Boolean).join(" ");
            if (val.firstName || val.lastName) return [val.firstName, val.lastName].filter(Boolean).join(" ");
            if (val.name) return String(val.name);
            return JSON.stringify(val);
        }
        return String(val);
    };

    const getField = (student, ...keys) => {
        const sources = [student, student.acf, student.data].filter(Boolean);
        for (const source of sources) {
            for (const key of keys) {
                const val = source[key];
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
                const val = source[key];
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

    // Helper to remove surrounding quotes and extra whitespace
    const cleanQuoteString = (str) => {
        if (!str) return "";
        // Regex replaces starting/ending quotes (straight or curly)
        return str.trim().replace(/^["“'‘\s]+|["”'’\s]+$/g, '');
    };

    // --- 3. FILTERING & PAGINATION ---
    const filteredStudents = students.filter(student => {
        if (!student) return false;
        const name = getField(student, "name", "student_name", "firstName", "firstname", "title", "full_name") || "";
        let email = getField(student, "email", "user_email", "student_email", "contact_email");
        if (!email && name) email = generateEmail(name);

        // Check both intro and quote fields for search terms
        // Added 'personalStatement' to intro search list as requested
        const intro = getField(student, "introduction", "intro", "bio", "description", "about_me", "personalStatement");
        const quote = getField(student, "quote", "tagline", "favorite_quote");

        const sName = (name || "").toLowerCase();
        const sEmail = (email || "").toLowerCase();
        const sIntro = (intro || "").toLowerCase();
        const sQuote = (quote || "").toLowerCase();
        const term = searchTerm.toLowerCase();

        return sName.includes(term) || sEmail.includes(term) || sIntro.includes(term) || sQuote.includes(term);
    });

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // --- 4. RENDER ---

    // Styles updated to match user request (Gradient Black->Red, Orange accents)
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
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    .cm-nav a:hover {
        color: #ffffff;
        text-decoration: underline;
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
        font-size: 1.2rem;
        color: #ffb07c;
    }

    .cm-search-container {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        padding: 0.75rem;
        margin: 0 auto 2rem auto;
        display: flex;
        align-items: center;
        gap: 1rem;
        max-width: 600px;
    }
    .cm-search-input {
        background: transparent;
        border: none;
        color: white;
        width: 100%;
        font-size: 1rem;
        outline: none;
        font-family: inherit;
    }
    .cm-search-input::placeholder {
        color: rgba(255, 255, 255, 0.7);
    }
    .cm-search-count {
        color: #ffb07c;
        font-size: 0.9rem;
        white-space: nowrap;
    }

    .cm-list {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
    .cm-card {
        background-color: rgba(0, 0, 0, 0.4); 
        border: 1px solid rgba(255, 176, 124, 0.3);
        border-radius: 12px;
        padding: 1.5rem;
        display: flex;
        gap: 1.5rem;
        align-items: center;
        transition: transform 0.2s, box-shadow 0.2s;
    }
    .cm-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border-color: #ffb07c;
    }
    
    .cm-avatar img, .cm-avatar-placeholder {
        width: 100px;
        height: 100px;
        border-radius: 8px;
        object-fit: cover;
        border: 2px solid #ffb07c;
        background-color: #000;
    }
    .cm-avatar-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffb07c;
        font-size: 2rem;
    }
    
    .cm-content {
        flex: 1;
    }
    .cm-name {
        font-size: 1.3rem;
        font-weight: 700;
        margin: 0 0 0.5rem 0;
        color: #ffffff;
    }
    .cm-intro {
        font-size: 1rem;
        color: #fff;
        margin-bottom: 0.75rem;
        line-height: 1.5;
    }
    .cm-quote {
        font-style: italic;
        color: #ffdcd1;
        font-size: 0.95rem;
        margin-bottom: 1rem;
        border-left: 3px solid #ffb07c;
        padding-left: 0.75rem;
    }
    .cm-author {
        font-style: normal;
        color: #ffb07c;
        font-size: 0.85rem;
        margin-left: 0.5rem;
    }

    .cm-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }
    .cm-pill {
        background-color: #c74646; 
        color: white;
        padding: 0.3rem 0.8rem;
        border-radius: 20px;
        font-size: 0.8rem;
        border: 1px solid rgba(255,255,255,0.2);
    }

    .cm-pagination {
        margin-top: 3rem;
        display: flex;
        justify-content: center;
        gap: 1rem;
        align-items: center;
    }
    .cm-btn {
        background: #c74646;
        border: 1px solid white;
        color: white;
        padding: 0.5rem 1.2rem;
        border-radius: 5px;
        cursor: pointer;
        font-family: inherit;
        font-weight: bold;
        transition: background 0.2s;
    }
    .cm-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: #555;
    }
    .cm-btn:hover:not(:disabled) {
        background: #a33333;
    }

    @media (max-width: 640px) {
        .cm-card {
            flex-direction: column;
            text-align: center;
        }
        .cm-pills {
            justify-content: center;
        }
        .cm-header h2 {
            font-size: 1.8rem;
        }
        .cm-container {
            width: 100%;
            padding: 1rem;
            border-radius: 0;
        }
        .cm-quote {
            border-left: none;
            border-top: 1px solid #ffb07c;
            padding-left: 0;
            padding-top: 0.5rem;
        }
    }
  `;

    if (loading) return (
        <>
            <style>{styles}</style>
            <div className="cm-wrapper">
                <div className="cm-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
                    Loading directory...
                </div>
            </div>
        </>
    );

    if (error) return (
        <>
            <style>{styles}</style>
            <div className="cm-wrapper">
                <div className="cm-container" style={{ textAlign: 'center' }}>
                    <h3>Error</h3>
                    <p>{error}</p>
                    <a href="/" style={{ justifyContent: 'center' }}>Return Home</a>
                </div>
            </div>
        </>
    );

    return (
        <>
            <style>{styles}</style>
            <div className="cm-wrapper">
                <div className="cm-container">

                    <div className="cm-nav">
                        <a href="/">← Back to Home</a>
                    </div>

                    <div className="cm-header">
                        <h2 className="cm-title">Meet the Class</h2>
                        <p className="cm-subtitle">ITIS 3135 Student Directory</p>
                    </div>

                    <div className="cm-search-container">
                        <span style={{ color: '#ffb07c' }}>🔍</span>
                        <input
                            type="text"
                            className="cm-search-input"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                        <div className="cm-search-count">
                            {filteredStudents.length} Students
                        </div>
                    </div>

                    <div className="cm-list">
                        {filteredStudents.length > 0 ? (
                            currentStudents.map((student, index) => {
                                const name = getField(student, "name", "student_name", "firstName", "firstname", "title", "full_name") || "Anonymous";

                                let email = getField(student, "email", "user_email", "student_email", "contact_email");
                                if (!email || email === "No Email") email = generateEmail(name);

                                // Added personalStatement to intro priorities
                                const intro = getField(student, "introduction", "intro", "bio", "description", "about_me", "personalStatement") || "";

                                // Parse Quote Logic
                                let rawQuote = getField(student, "quote", "tagline", "favorite_quote") || "";
                                let quote = "";
                                let quoteAuthor = getField(student, "quote_author", "author") || "";

                                // 1. Try to parse JSON quote first
                                if (rawQuote && typeof rawQuote === 'string' && rawQuote.trim().startsWith('{')) {
                                    try {
                                        const parsed = JSON.parse(rawQuote);
                                        if (parsed && typeof parsed === 'object') {
                                            if (parsed.text) quote = parsed.text;
                                            if (parsed.author) quoteAuthor = parsed.author;
                                        }
                                    } catch (e) {
                                        // Parsing failed, use raw string
                                        quote = rawQuote;
                                    }
                                } else {
                                    quote = rawQuote;
                                }

                                // 2. Clean up any remaining double quotes from the string itself
                                quote = cleanQuoteString(quote);

                                const courses = getArrayField(student, "courses", "classes", "enrolled", "tags", "subjects");
                                const displayTags = courses.length > 0 ? courses : [email, "ITIS 3135"];

                                let image = null;
                                const sources = [student, student.acf, student.data].filter(Boolean);
                                for (const s of sources) {
                                    if (s.image || s.avatar || s.photo) {
                                        const raw = s.image || s.avatar || s.photo;
                                        if (typeof raw === 'string') image = raw;
                                        else if (raw && raw.url) image = raw.url;
                                        if (image) break;
                                    }
                                }

                                return (
                                    <div key={student.id || index} className="cm-card">
                                        <div className="cm-avatar">
                                            {image ? (
                                                <img
                                                    src={image}
                                                    alt={name}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = `https://ui-avatars.com/api/?name=${name}&background=ffb07c&color=000`;
                                                    }}
                                                />
                                            ) : (
                                                <div className="cm-avatar-placeholder">
                                                    <span>👤</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="cm-content">
                                            <h3 className="cm-name">{name}</h3>

                                            {/* Introduction - Now pulls from personalStatement if needed */}
                                            {intro && <div className="cm-intro">{intro}</div>}

                                            {/* Quote - Cleaned up */}
                                            {quote && (
                                                <div className="cm-quote">
                                                    "{quote}"
                                                    {quoteAuthor && <span className="cm-author">— {quoteAuthor}</span>}
                                                </div>
                                            )}

                                            {!intro && !quote && <div className="cm-intro" style={{ opacity: 0.7, fontStyle: 'italic' }}>No details provided.</div>}

                                            <div className="cm-pills">
                                                {displayTags.map((tag, idx) => {
                                                    // Safe render logic for objects
                                                    let label = tag;
                                                    if (typeof tag === 'object' && tag !== null) {
                                                        if (tag.dept && tag.num) label = `${tag.dept} ${tag.num}`;
                                                        else if (tag.name) label = tag.name;
                                                        else if (tag.code) label = tag.code;
                                                        else label = "Class";
                                                    }
                                                    return <span key={idx} className="cm-pill">{label}</span>;
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed #ffb07c', borderRadius: '8px', color: '#ffb07c' }}>
                                No students found.
                            </div>
                        )}
                    </div>

                    {filteredStudents.length > itemsPerPage && (
                        <div className="cm-pagination">
                            <button
                                className="cm-btn"
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            <span style={{ color: '#ffb07c' }}>Page {currentPage} of {totalPages}</span>
                            <button
                                className="cm-btn"
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    )}

                    <div style={{ marginTop: '3rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1rem' }}>
                        <button
                            onClick={() => setShowDebug(!showDebug)}
                            style={{ background: 'none', border: 'none', color: '#ffb07c', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                            {showDebug ? "Hide" : "Show"} Debug Info
                        </button>
                        {showDebug && (
                            <pre style={{ textAlign: 'left', background: '#222', color: '#ffb07c', padding: '1rem', overflow: 'auto', maxHeight: '300px', marginTop: '1rem', fontSize: '0.75rem', borderRadius: '5px' }}>
                                {JSON.stringify(rawData, null, 2)}
                            </pre>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
}