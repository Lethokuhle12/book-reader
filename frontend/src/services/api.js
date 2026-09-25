const API_URL = "http://localhost:8080/api";

export const extractPdfText = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_URL}/pdf/extract`, {
        method: "POST",
        body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || data.error || "Failed to process PDF"
        );
    }

    return data;
};

export const getBackendVoices = async () => {
    try {
        const response = await fetch(`${API_URL}/audio/voices`);
        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        console.warn("Backend voices endpoint not available:", e);
    }
    return [];
};

export const explainText = async ({ text, context, bookTitle }) => {
    const response = await fetch(`${API_URL}/explain`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, context, bookTitle }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || data.error || "Failed to get AI explanation"
        );
    }

    return data;
};
