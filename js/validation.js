/**
 * Form Validation Logic
 * Handles checking inputs, emails, and phone formats.
 */

const FormValidation = (function () {
    // Regular Expressions
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile number format
    const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[^\s]*)?$/i;

    // Error messages
    const errors = {
        required: "This field is required.",
        email: "Please enter a valid email address.",
        phone: "Please enter a valid 10-digit Indian phone number.",
        url: "Please enter a valid link.",
        minCheckboxes: "Please select at least one option.",
        radioCheck: "Please select an option."
    };

    /**
     * Show error message for an input group
     */
    function showError(input, message) {
        const group = input.closest('.input-group') || input.closest('.form-group');
        const errorEl = group.querySelector('.error-message');
        if (errorEl) {
            errorEl.textContent = message;
            group.classList.add('error');
        }
    }

    /**
     * Clear error message for an input group
     */
    function clearError(input) {
        const group = input.closest('.input-group') || input.closest('.form-group');
        const errorEl = group.querySelector('.error-message');
        if (errorEl) {
            errorEl.textContent = '';
            group.classList.remove('error');
        }
    }

    /**
     * Validate a single input element
     */
    function validateInput(input) {
        let isValid = true;

        if (input.disabled || input.closest('[hidden]') || input.offsetParent === null) {
            clearError(input);
            return true;
        }
        
        // Skip validation if not required and empty (except specific formats if partially filled)
        if (!input.required && input.value.trim() === '') {
            clearError(input);
            return isValid;
        }

        // Required check
        if (input.required && input.value.trim() === '') {
            showError(input, errors.required);
            return false;
        }

        // Type specific validation
        if (input.type === 'email' && input.value.trim() !== '') {
            if (!emailRegex.test(input.value.trim())) {
                showError(input, errors.email);
                return false;
            }
        }

        if (input.type === 'tel' && input.value.trim() !== '') {
            // Remove spaces and hyphens for checking
            const cleanPhone = input.value.replace(/[\s-]/g, '');
            if (!phoneRegex.test(cleanPhone)) {
                showError(input, errors.phone);
                return false;
            }
        }

        if (input.type === 'url' && input.value.trim() !== '') {
            if (!urlRegex.test(input.value.trim())) {
                showError(input, errors.url);
                return false;
            }
        }

        // Clear error if valid
        clearError(input);
        return isValid;
    }

    /**
     * Validate a group of checkboxes or radios
     */
    function validateGroup(groupContainer, type) {
        if (type === 'checkbox') {
            const checked = groupContainer.querySelectorAll('input[type="checkbox"]:checked');
            // If required class/data is set (or just check if at least one needed)
            // For Services step, we want at least 1 core service
            if (groupContainer.querySelector('input').name === 'services' && checked.length === 0) {
                const group = groupContainer.closest('.form-group');
                const errorEl = group.querySelector('.error-message');
                errorEl.textContent = errors.minCheckboxes;
                group.classList.add('error');
                return false;
            }
        }
        
        if (type === 'radio') {
            // If the radio group has 'required' on its inputs
            const firstRadio = groupContainer.querySelector('input[type="radio"]');
            if (firstRadio && firstRadio.required) {
                const checked = groupContainer.querySelector('input[type="radio"]:checked');
                if (!checked) {
                    const group = groupContainer.closest('.input-group');
                    const errorEl = group.querySelector('.error-message');
                    errorEl.textContent = errors.radioCheck;
                    group.classList.add('error');
                    return false;
                }
            }
        }

        // Clear errors
        const parent = groupContainer.closest('.form-group') || groupContainer.closest('.input-group');
        if (parent) {
            parent.classList.remove('error');
        }
        return true;
    }

    /**
     * Validate an entire step container
     */
    function validateStep(stepContainer) {
        let isStepValid = true;

        // Text, Email, Tel, Number, Date, Select
        const inputs = stepContainer.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]), select, textarea');
        inputs.forEach(input => {
            if (!validateInput(input)) {
                isStepValid = false;
            }
        });

        // Checkbox groups
        const checkboxGroups = stepContainer.querySelectorAll('.checkbox-grid');
        checkboxGroups.forEach(group => {
            if (!validateGroup(group, 'checkbox')) {
                isStepValid = false;
            }
        });

        // Radio groups
        const radioGroups = stepContainer.querySelectorAll('.radio-grid');
        radioGroups.forEach(group => {
            if (!validateGroup(group, 'radio')) {
                isStepValid = false;
            }
        });

        return isStepValid;
    }

    return {
        validateStep,
        validateInput,
        validateGroup,
        clearError
    };
})();
