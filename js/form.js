/**
 * Form Data Logic
 * Handles data extraction, localStorage auto-save, and API submission.
 */

const FormLogic = (function () {
    const form = document.getElementById('onboardingForm');
    const DRAFT_KEY = 'ca_website_form_draft';

    // Google Apps Script Web App URL
    // REPLACE THIS WITH YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzJDckrpizS0DITg7hskrSUGWEdSEPYvCbsIb8js0g8-Gg9fsxDQxa9K5V1KYkZkeQFLA/exec';

    const FIELD_LABELS = {
        timestamp: 'Submitted At',
        firmName: 'Firm Name',
        ownerName: 'Owner/Partner Name',
        yearEstablished: 'Year Established',
        cityState: 'City & State',
        address: 'Full Office Address',
        phone: 'Phone Number',
        whatsapp: 'WhatsApp Number',
        email: 'Official Email',
        googleMap: 'Google Maps Link',
        officeTimings: 'Office Timings',
        services: 'Core Services',
        otherServices: 'Other Specialised Services',
        topServices: 'Top 3 Most Requested Services',
        profitableService: 'Most Profitable Service',
        highlightService: 'Homepage Highlight Service',
        tagline: 'Firm Tagline / Slogan',
        aboutFirm: 'About Firm',
        experience: 'Total Years of Experience',
        industries: 'Key Industries Served',
        teamMembers: 'Key Team Members',
        testimonials: 'Client Testimonials / Reviews',
        logoLink: 'Logo Link',
        photosLink: 'Office/Team Photos Link',
        targetClient: 'Primary Target Client',
        goal: 'Primary Goal of Website',
        primaryCTA: 'Primary Call-to-Action',
        usp: 'Unique Selling Proposition',
        competitors: 'Competitor Websites',
        caseStudies: 'Case Studies / Achievements',
        certifications: 'Certifications / Empanelment',
        sampleWork: 'Sample Work Link',
        hasDomain: 'Has Domain Name',
        domainName: 'Domain Name / Preferred Domain',
        linkedin: 'LinkedIn Profile URL',
        twitter: 'Twitter / X URL',
        targetCity: 'Target City for SEO',
        pages: 'Required Pages',
        deadline: 'Expected Launch Date',
        priority: 'Project Priority',
        notes: 'Additional Notes',
        sourcePage: 'Source Page',
        userAgent: 'User Agent'
    };

    const REQUIRED_PAGES = ['Home', 'About Us', 'Services', 'Contact'];

    /**
     * Extract all form data into a neat object
     */
    function getFormData() {
        const formData = new FormData(form);
        const dataObj = {};

        for (let [key, value] of formData.entries()) {
            // Handle multiple checkboxes with the same name (e.g., 'services', 'pages')
            if (dataObj[key]) {
                if (!Array.isArray(dataObj[key])) {
                    dataObj[key] = [dataObj[key]];
                }
                dataObj[key].push(value);
            } else {
                dataObj[key] = value;
            }
        }

        // Convert arrays to comma-separated strings for easier handling in Google Sheets
        for (let key in dataObj) {
            if (Array.isArray(dataObj[key])) {
                dataObj[key] = dataObj[key].join(', ');
            }
        }

        const optionalPages = dataObj.pages ? dataObj.pages.split(', ') : [];
        dataObj.pages = [...REQUIRED_PAGES, ...optionalPages]
            .filter((page, index, pages) => pages.indexOf(page) === index)
            .join(', ');

        // Add submission timestamp
        dataObj.timestamp = new Date().toISOString();
        dataObj.sourcePage = window.location.href;
        dataObj.userAgent = navigator.userAgent;

        return dataObj;
    }

    function getSubmissionPayload() {
        const data = getFormData();
        const payload = { ...data };

        Object.keys(FIELD_LABELS).forEach(key => {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                payload[FIELD_LABELS[key]] = data[key];
            }
        });

        return payload;
    }

    /**
     * Save current form data to localStorage
     */
    function saveDraft() {
        const data = getFormData();
        localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    }

    /**
     * Load draft from localStorage and populate form
     */
    function loadDraft() {
        const draftJSON = localStorage.getItem(DRAFT_KEY);
        if (!draftJSON) return;

        try {
            const dataObj = JSON.parse(draftJSON);

            Object.keys(dataObj).forEach(key => {
                const element = form.elements[key];
                if (!element) return;

                // Handle NodeList (radios or checkboxes)
                if (element instanceof NodeList || element.length > 1) {
                    // It could be a select element with multiple options or a group of radios/checkboxes
                    if (element.type === 'select-one' || element.type === 'select-multiple') {
                        element.value = dataObj[key];
                    } else {
                        // Radio or Checkbox list
                        const values = dataObj[key].split(', ');
                        element.forEach(el => {
                            if (values.includes(el.value)) {
                                el.checked = true;
                            }
                        });
                    }
                } else {
                    // Standard input/textarea
                    if (element.type !== 'file') {
                        element.value = dataObj[key];
                    }
                }
            });

            // Trigger domain toggle logic if needed
            const domainYes = document.querySelector('input[name="hasDomain"][value="Yes"]');
            if (domainYes && domainYes.checked) {
                // Trigger change event to update UI
                domainYes.dispatchEvent(new Event('change'));
            }

        } catch (e) {
            console.error("Error loading draft", e);
        }
    }

    /**
     * Clear draft after successful submission
     */
    function clearDraft() {
        localStorage.removeItem(DRAFT_KEY);
    }

    /**
     * Submit data via a hidden form + iframe (bypasses CORS entirely).
     * Traditional HTML form submissions are NOT subject to same-origin policy,
     * making this the most reliable method for Google Apps Script.
     */
    function submitViaIframe(data) {
        return new Promise((resolve, reject) => {
            try {
                // Create a hidden iframe to receive the form response
                const iframeName = 'gas_submit_' + Date.now();
                const iframe = document.createElement('iframe');
                iframe.name = iframeName;
                iframe.style.display = 'none';
                document.body.appendChild(iframe);

                // Create a hidden form targeting the iframe
                const hiddenForm = document.createElement('form');
                hiddenForm.method = 'POST';
                hiddenForm.action = GOOGLE_SCRIPT_URL;
                hiddenForm.target = iframeName;
                hiddenForm.style.display = 'none';

                // Populate form with data fields
                for (let key in data) {
                    if (data.hasOwnProperty(key)) {
                        const input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = key;
                        input.value = data[key];
                        hiddenForm.appendChild(input);
                    }
                }

                document.body.appendChild(hiddenForm);

                // Set up a timeout to resolve (iframe load events are unreliable cross-origin)
                const timeoutId = setTimeout(() => {
                    cleanup();
                    resolve();
                }, 12000);

                // Also listen for iframe load as an early success signal
                let loadCount = 0;
                iframe.addEventListener('load', function onLoad() {
                    loadCount++;
                    // First load is the initial about:blank, second is the actual response
                    if (loadCount < 2) return;
                    clearTimeout(timeoutId);
                    cleanup();
                    resolve();
                });

                function cleanup() {
                    try {
                        if (hiddenForm.parentNode) document.body.removeChild(hiddenForm);
                        if (iframe.parentNode) document.body.removeChild(iframe);
                    } catch (e) { /* ignore cleanup errors */ }
                }

                // Submit the form
                hiddenForm.submit();

            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Handle final form submission
     */
    async function handleSubmit(e) {
        e.preventDefault();

        // Final validation of the current step (Step 7)
        const currentStepEl = UIController.getCurrentStepElement();
        if (!FormValidation.validateStep(currentStepEl)) {
            const firstError = currentStepEl.querySelector('.error');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        const data = getSubmissionPayload();

        // Show loading state
        UIController.setLoading(true);
        UIController.setStatus('Submitting your requirements securely...');

        try {
            // Check if URL is configured (placeholder means not yet set up)
            if (GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE') {
                console.warn("Google Script URL not configured. Simulating success for testing.");
                await new Promise(resolve => setTimeout(resolve, 1500));
                UIController.setLoading(false);
                UIController.showSuccess();
                return;
            }

            // Submit via hidden form + iframe (bypasses CORS entirely)
            await submitViaIframe(data);

            UIController.setLoading(false);
            UIController.setStatus('');
            clearDraft();
            UIController.showSuccess();

        } catch (error) {
            console.error('Submission Error:', error);
            UIController.setLoading(false);
            UIController.setStatus('Submission could not be completed. Please try again or send the details on WhatsApp.', true);
        }
    }

    // Initialize
    function init() {
        loadDraft();
        form.addEventListener('submit', handleSubmit);

        // Auto-save draft every 10 seconds while typing
        setInterval(saveDraft, 10000);
    }

    return {
        init,
        saveDraft,
        clearDraft,
        getFormData
    };
})();

window.FormLogic = FormLogic;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    FormLogic.init();
});
