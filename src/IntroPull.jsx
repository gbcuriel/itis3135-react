import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, User, Mail, School, Loader2 } from 'lucide-react';

export default function IntroPull() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Search and Pagination State
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // 1. Fetch the Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://dvonb.xyz/api/2025-fall/itis-3135/students?full=1');

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (Array.isArray(data)) {
                    setStudents(data);
                } else {
                    setStudents(data.data || []);
                    console.log("Raw Data:", data);
                }
            } catch (err) {
                console.error("Fetch Error:", err);
                setError("Failed to load student data. API might be down or blocking requests.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // 2. Filter Data (Search Logic)
    const filteredStudents = students.filter(student => {
        // Robustly handle missing or non-string data
        const name = String(student.name || student.student_name || student.firstName || "Unknown");
        const email = String(student.email || "");
        const intro = String(student.introduction || student.bio || "");

        const searchLower = searchTerm.toLowerCase();
        return name.toLowerCase().includes(searchLower) ||
            email.toLowerCase().includes(searchLower) ||
            intro.toLowerCase().includes(searchLower);
    });

    // 3. Pagination Logic
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // --- Render Helpers ---

    if (loading) {
        return (
            <div className="flex h-96 w-full items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
                    <p className="mt-4 text-lg font-medium text-slate-600">Loading Class Data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-96 w-full items-center justify-center bg-slate-50 p-4">
                <div className="rounded-lg bg-red-50 p-6 text-center shadow-sm max-w-lg">
                    <h3 className="mb-2 text-lg font-bold text-red-800">Error Loading Data</h3>
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 font-sans">
            <div className="mx-auto max-w-7xl">

                {/* Header Section */}
                <div className="mb-10 text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                        Meet the Class
                    </h2>
                    <p className="mt-4 text-lg text-slate-600">
                        ITIS 3135 Student Directory
                    </p>
                </div>

                {/* Controls Section (Search) */}
                <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row rounded-xl bg-white p-4 shadow-sm border border-slate-200">
                    <div className="relative w-full sm:w-96">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 pl-10 text-slate-900 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    <div className="text-sm font-medium text-slate-500">
                        {filteredStudents.length} Students found
                    </div>
                </div>

                {/* Grid Section */}
                {filteredStudents.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {currentStudents.map((student, index) => {
                            // Adjust these keys based on your actual API data
                            // Using String() wrapping to prevent 'Objects are not valid as React child' errors
                            const studentName = String(student.name || student.firstname || "Student");
                            const studentEmail = String(student.email || "No email");
                            const studentIntro = String(student.introduction || student.intro || "No introduction provided.");

                            // Random colored avatar placeholder if no image
                            return (
                                <div
                                    key={student.id || index}
                                    className="flex flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg border border-slate-100"
                                >
                                    <div className="h-2 w-full bg-blue-600"></div>
                                    <div className="flex flex-1 flex-col p-6">
                                        <div className="mb-4 flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                                <User size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900 line-clamp-1">
                                                    {studentName}
                                                </h3>
                                                <div className="flex items-center text-sm text-slate-500">
                                                    <Mail size={14} className="mr-1" />
                                                    <span className="line-clamp-1">{studentEmail}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-4 flex-1">
                                            <p className="text-slate-600 text-sm line-clamp-3 italic">
                                                "{studentIntro}"
                                            </p>
                                        </div>

                                        <div className="mt-auto border-t border-slate-100 pt-4">
                                            <a
                                                href={`mailto:${studentEmail}`}
                                                className="block w-full rounded-lg bg-slate-50 px-4 py-2 text-center text-sm font-medium text-slate-600 hover:bg-slate-100"
                                            >
                                                Email Student
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 text-slate-500">
                        <School className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                        <p>No students found matching your search.</p>
                    </div>
                )}

                {/* Pagination Controls */}
                {filteredStudents.length > itemsPerPage && (
                    <div className="mt-10 flex items-center justify-center gap-4">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="flex items-center rounded-lg bg-white px-4 py-2 text-slate-700 shadow-sm ring-1 ring-slate-200 disabled:opacity-50"
                        >
                            <ChevronLeft size={16} className="mr-2" /> Prev
                        </button>
                        <span className="text-slate-600">Page {currentPage} of {totalPages}</span>
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="flex items-center rounded-lg bg-white px-4 py-2 text-slate-700 shadow-sm ring-1 ring-slate-200 disabled:opacity-50"
                        >
                            Next <ChevronRight size={16} className="ml-2" />
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}