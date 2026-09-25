/**
 * Generates a stable identifier for a book using filename, text length, and text content sample.
 */
export const calculateBookId = (filename, text) => {
    if (!text && !filename) return "default_book";
    const cleanName = (filename || "document").toLowerCase().trim();
    const textLen = (text || "").length;

    // Hash first 500 characters + last 500 characters
    const sample = (text || "").slice(0, 500) + (text || "").slice(-500);
    let hash = 0;
    for (let i = 0; i < sample.length; i++) {
        const char = sample.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }

    return `book_${cleanName.replace(/[^a-z0-9]/g, "_")}_${textLen}_${Math.abs(hash)}`;
};

const STORAGE_PREFIX = "bookreader_progress_";

export const saveBookProgress = (bookId, progressData) => {
    if (!bookId) return;
    try {
        const payload = {
            ...progressData,
            updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(`${STORAGE_PREFIX}${bookId}`, JSON.stringify(payload));
        localStorage.setItem("bookreader_last_book_id", bookId);
    } catch (e) {
        console.warn("Could not save reading progress:", e);
    }
};

export const getBookProgress = (bookId) => {
    if (!bookId) return null;
    try {
        const raw = localStorage.getItem(`${STORAGE_PREFIX}${bookId}`);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        console.warn("Could not load reading progress:", e);
        return null;
    }
};

export const clearBookProgress = (bookId) => {
    if (!bookId) return;
    try {
        localStorage.removeItem(`${STORAGE_PREFIX}${bookId}`);
    } catch (e) {
        console.warn("Could not clear reading progress:", e);
    }
};
