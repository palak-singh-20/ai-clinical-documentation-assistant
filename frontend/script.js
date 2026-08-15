/* =========================================================
   API CONFIGURATION
========================================================= */

const API_URL = "http://127.0.0.1:8000/process";


/* =========================================================
   DOM ELEMENTS
========================================================= */

const processBtn = document.getElementById("processBtn");
const consultation = document.getElementById("consultation");

const loading = document.getElementById("loading");
const errorBox = document.getElementById("error");

const results = document.getElementById("results");


/* =========================================================
   PROCESS CONSULTATION
========================================================= */

processBtn.addEventListener("click", async () => {

    const text = consultation.value.trim();


    /* -----------------------------
       Validate input
    ----------------------------- */

    if (!text) {

        showError("Please enter consultation notes.");

        consultation.focus();

        return;
    }


    /* -----------------------------
       Reset UI
    ----------------------------- */

    hideError();

    results.classList.add("hidden");

    loading.classList.remove("hidden");

    processBtn.disabled = true;

    processBtn.textContent = "Processing...";


    try {

        /* -----------------------------
           Send request to FastAPI
        ----------------------------- */

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                consultation: text
            })

        });


        /* -----------------------------
           Handle API errors
        ----------------------------- */

        if (!response.ok) {

            let errorMessage = "Something went wrong.";

            try {

                const errorData = await response.json();

                if (errorData.detail) {

                    errorMessage =
                        typeof errorData.detail === "string"
                            ? errorData.detail
                            : JSON.stringify(errorData.detail);

                }

            } catch {

                errorMessage = await response.text();

            }

            throw new Error(
                `API Error ${response.status}: ${errorMessage}`
            );
        }


        /* -----------------------------
           Convert response to JSON
        ----------------------------- */

        const data = await response.json();


        console.log("API Response:", data);


        /* -----------------------------
           Display results
        ----------------------------- */

        displayResults(data);

    }


    catch (error) {

        console.error("Processing error:", error);

        showError(
            "Failed to process consultation. " +
            "Make sure the FastAPI server is running."
        );

    }


    finally {

        loading.classList.add("hidden");

        processBtn.disabled = false;

        processBtn.textContent = "Process Consultation";

    }

});


/* =========================================================
   DISPLAY RESULTS
========================================================= */

function displayResults(data) {

    if (!data) {

        showError("The API returned an empty response.");

        return;
    }


    results.classList.remove("hidden");


    /* =====================================================
       PATIENT HISTORY
    ===================================================== */

    const history = data.patient_history || {};


    setText(
        "patientId",
        history.patient_id || "Not provided"
    );


    setText(
        "chiefComplaint",
        history.chief_complaint || "Not provided"
    );


    renderTags(
        "symptoms",
        history.symptoms
    );


    renderTags(
        "medicalHistory",
        history.medical_history
    );


    renderTags(
        "medications",
        history.medications
    );


    renderTags(
        "allergies",
        history.allergies
    );


    renderTags(
        "familyHistory",
        history.family_history
    );


    renderTags(
        "socialHistory",
        history.social_history
    );


    renderTags(
        "missingInformation",
        history.missing_information
    );


    /* =====================================================
       CLINICAL SUMMARY
    ===================================================== */

    let clinicalSummary = "No summary generated.";


    if (data.clinical_summary) {

        if (
            typeof data.clinical_summary === "object" &&
            data.clinical_summary.clinical_summary
        ) {

            clinicalSummary =
                data.clinical_summary.clinical_summary;

        }

        else if (
            typeof data.clinical_summary === "string"
        ) {

            clinicalSummary =
                data.clinical_summary;

        }

    }


    setText(
        "clinicalSummary",
        clinicalSummary
    );


    /* =====================================================
       DOCUMENTATION QUALITY
    ===================================================== */

    setText(
        "documentationQuality",
        formatResult(
            data.documentation_quality,
            "No quality report generated."
        )
    );


    /* =====================================================
       DOCUMENTATION COMPLETENESS
    ===================================================== */

    setText(
        "documentationCompleteness",
        formatResult(
            data.documentation_completeness,
            "No completeness report generated."
        )
    );


    /* =====================================================
       FINAL DOCUMENTATION
    ===================================================== */

    const finalDocumentation =
        formatResult(
            data.final_documentation,
            "No final documentation generated."
        );


    setText(
        "finalDocumentation",
        finalDocumentation
    );


    /* =====================================================
       SHOW RESULTS
    ===================================================== */

    results.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   SET TEXT SAFELY
========================================================= */

function setText(elementId, value) {

    const element =
        document.getElementById(elementId);


    if (!element) {

        console.warn(
            `Element #${elementId} was not found.`
        );

        return;
    }


    element.textContent =
        value !== undefined &&
        value !== null &&
        value !== ""
            ? value
            : "Not provided";

}


/* =========================================================
   RENDER TAGS
========================================================= */

function renderTags(elementId, values) {

    const container =
        document.getElementById(elementId);


    if (!container) {

        console.warn(
            `Element #${elementId} was not found.`
        );

        return;
    }


    /* Clear previous results */

    container.innerHTML = "";


    /* Normalize data */

    if (!Array.isArray(values)) {

        if (
            values !== undefined &&
            values !== null &&
            values !== ""
        ) {

            values = [values];

        }

        else {

            values = [];

        }

    }


    /* Remove empty values */

    values = values.filter(value => {

        return (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        );

    });


    /* -----------------------------
       Nothing documented
    ----------------------------- */

    if (values.length === 0) {

        const empty =
            document.createElement("span");

        empty.className = "empty";

        empty.textContent =
            "Not documented";

        container.appendChild(empty);

        return;
    }


    /* -----------------------------
       Create tags
    ----------------------------- */

    values.forEach(value => {

        const tag =
            document.createElement("span");


        tag.className = "tag";


        tag.textContent =
            String(value);


        container.appendChild(tag);

    });

}


/* =========================================================
   FORMAT API RESULTS
========================================================= */

function formatResult(value, fallback) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return fallback;

    }


    /* String */

    if (typeof value === "string") {

        return value;

    }


    /* Array */

    if (Array.isArray(value)) {

        return value
            .map(item => {

                if (
                    typeof item === "object" &&
                    item !== null
                ) {

                    return JSON.stringify(item);

                }

                return String(item);

            })
            .join("\n");

    }


    /* Object */

    if (typeof value === "object") {

        /* Common fields */

        if (value.result) {

            return String(value.result);

        }


        if (value.summary) {

            return String(value.summary);

        }


        if (value.documentation_quality) {

            return String(
                value.documentation_quality
            );

        }


        if (value.documentation_completeness) {

            return String(
                value.documentation_completeness
            );

        }


        if (value.final_documentation) {

            return String(
                value.final_documentation
            );

        }


        /* Fallback */

        return Object.entries(value)

            .map(([key, val]) => {

                return `${formatKey(key)}: ${formatValue(val)}`;

            })

            .join("\n");

    }


    return String(value);

}


/* =========================================================
   FORMAT OBJECT KEYS
========================================================= */

function formatKey(key) {

    return String(key)

        .replace(/_/g, " ")

        .replace(/\b\w/g, char =>
            char.toUpperCase()
        );

}


/* =========================================================
   FORMAT OBJECT VALUES
========================================================= */

function formatValue(value) {

    if (Array.isArray(value)) {

        return value.join(", ");

    }


    if (
        typeof value === "object" &&
        value !== null
    ) {

        return JSON.stringify(value);

    }


    return String(value);

}


/* =========================================================
   SHOW ERROR
========================================================= */

function showError(message) {

    if (!errorBox) {

        return;
    }


    errorBox.textContent = message;

    errorBox.classList.remove("hidden");

}


/* =========================================================
   HIDE ERROR
========================================================= */

function hideError() {

    if (!errorBox) {

        return;
    }


    errorBox.classList.add("hidden");

    errorBox.textContent = "";

}


/* =========================================================
   COPY FINAL DOCUMENTATION
   Works if a button with id="copyBtn" exists
========================================================= */

const copyBtn =
    document.getElementById("copyBtn");


if (copyBtn) {

    copyBtn.addEventListener("click", async () => {

        const finalDocumentation =
            document.getElementById(
                "finalDocumentation"
            );


        if (!finalDocumentation) {

            return;
        }


        const text =
            finalDocumentation.textContent.trim();


        if (!text) {

            showError(
                "There is no final documentation to copy."
            );

            return;
        }


        try {

            await navigator.clipboard.writeText(text);


            const originalText =
                copyBtn.textContent;


            copyBtn.textContent =
                "Copied!";


            setTimeout(() => {

                copyBtn.textContent =
                    originalText;

            }, 2000);

        }


        catch (error) {

            console.error(
                "Copy failed:",
                error
            );

            showError(
                "Unable to copy documentation."
            );

        }

    });

}


/* =========================================================
   DOWNLOAD FINAL DOCUMENTATION
   Works if a button with id="downloadBtn" exists
========================================================= */

const downloadBtn =
    document.getElementById("downloadBtn");


if (downloadBtn) {

    downloadBtn.addEventListener("click", () => {

        const finalDocumentation =
            document.getElementById(
                "finalDocumentation"
            );


        if (!finalDocumentation) {

            return;
        }


        const text =
            finalDocumentation.textContent.trim();


        if (!text) {

            showError(
                "There is no documentation to download."
            );

            return;
        }


        const blob =
            new Blob(
                [text],
                {
                    type: "text/plain;charset=utf-8"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href = url;

        link.download =
            "clinical_documentation.txt";


        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);


        URL.revokeObjectURL(url);

    });

}


/* =========================================================
   NEW CONSULTATION
   Works if a button with id="newConsultationBtn" exists
========================================================= */

const newConsultationBtn =
    document.getElementById(
        "newConsultationBtn"
    );


if (newConsultationBtn) {

    newConsultationBtn.addEventListener(
        "click",
        () => {

            consultation.value = "";

            results.classList.add("hidden");

            hideError();

            consultation.focus();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );

}


/* =========================================================
   ENTER KEY SUPPORT
========================================================= */

consultation.addEventListener(
    "keydown",
    event => {

        /*
         * Ctrl + Enter
         * processes consultation
         */

        if (
            event.ctrlKey &&
            event.key === "Enter"
        ) {

            event.preventDefault();

            processBtn.click();

        }

    }
);


/* =========================================================
   API CONNECTION CHECK
========================================================= */

async function checkAPIStatus() {

    const statusElement =
        document.querySelector(".status");


    if (!statusElement) {

        return;
    }


    try {

        const response =
            await fetch(
                "http://127.0.0.1:8000/docs",
                {
                    method: "GET"
                }
            );


        if (response.ok) {

            statusElement.innerHTML = `
                <span class="status-dot"></span>
                API Online
            `;

        }

        else {

            setOfflineStatus();

        }

    }


    catch (error) {

        console.warn(
            "API status check failed."
        );

        setOfflineStatus();

    }

}


/* =========================================================
   OFFLINE STATUS
========================================================= */

function setOfflineStatus() {

    const statusElement =
        document.querySelector(".status");


    if (!statusElement) {

        return;
    }


    statusElement.innerHTML = `
        <span
            class="status-dot"
            style="
                background:#ef4444;
                box-shadow:
                0 0 0 4px rgba(239,68,68,0.12);
            "
        ></span>
        API Offline
    `;

}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "AI Clinical Documentation Assistant loaded."
        );

        checkAPIStatus();

    }
);