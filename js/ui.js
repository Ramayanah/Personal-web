/**
 * UI Interactions Logic
 * Handles step transitions, progress bar, and dynamic field visibility.
 */

const UIController = (function () {
    const DOM = {
        form: document.getElementById('onboardingForm'),
        steps: document.querySelectorAll('.form-step'),
        nextBtn: document.getElementById('nextBtn'),
        prevBtn: document.getElementById('prevBtn'),
        submitBtn: document.getElementById('submitBtn'),
        progressBar: document.getElementById('progressBar'),
        currentStepNum: document.getElementById('currentStepNum'),
        formStatus: document.getElementById('formStatus'),
        successScreen: document.getElementById('successScreen'),
        formContainer: document.querySelector('.form-container > form'),
        headerContainer: document.querySelector('.form-header'),
        
        // Dynamic Fields
        domainRadios: document.querySelectorAll('input[name="hasDomain"]'),
        domainInputGroup: document.getElementById('domainInputGroup')
    };

    let currentStep = 0;
    const totalSteps = DOM.steps.length;

    /**
     * Initialize UI Listeners
     */
    function init() {
        // Navigation Listeners
        DOM.nextBtn.addEventListener('click', handleNext);
        DOM.prevBtn.addEventListener('click', handlePrev);

        // Real-time validation listeners
        const inputs = DOM.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => FormValidation.validateInput(input));
            input.addEventListener('change', () => FormValidation.validateInput(input));
        });

        const checkboxes = DOM.form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const group = e.target.closest('.checkbox-grid');
                if (group) FormValidation.validateGroup(group, 'checkbox');
            });
        });

        const radios = DOM.form.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const group = e.target.closest('.radio-grid');
                if(group) FormValidation.validateGroup(group, 'radio');
            });
        });

        // Dynamic Domain Field toggle
        DOM.domainRadios.forEach(radio => {
            radio.addEventListener('change', handleDomainToggle);
        });
        
        // Initial state
        const checkedDomain = document.querySelector('input[name="hasDomain"]:checked');
        if (checkedDomain) handleDomainToggle({ target: checkedDomain });
        updateUI();
    }

    /**
     * Handle Next Button Click
     */
    function handleNext() {
        const currentStepEl = DOM.steps[currentStep];
        
        // Validate current step before proceeding
        if (FormValidation.validateStep(currentStepEl)) {
            // Save data automatically on next
            if (window.FormLogic) window.FormLogic.saveDraft();
            
            currentStep++;
            updateUI();
        } else {
            // Scroll to first error
            const firstError = currentStepEl.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    /**
     * Handle Previous Button Click
     */
    function handlePrev() {
        if (currentStep > 0) {
            currentStep--;
            updateUI();
        }
    }

    /**
     * Update UI state (Steps, Buttons, Progress)
     */
    function updateUI() {
        // Update Steps Visibility
        DOM.steps.forEach((step, index) => {
            step.classList.remove('active');
            if (index === currentStep) {
                step.classList.add('active');
            }
        });

        // Update Progress Bar
        const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
        DOM.progressBar.style.width = `${progressPercentage}%`;
        DOM.currentStepNum.textContent = currentStep + 1;

        // Update Buttons
        DOM.prevBtn.style.display = currentStep === 0 ? 'none' : 'inline-flex';
        
        if (currentStep === totalSteps - 1) {
            DOM.nextBtn.style.display = 'none';
            DOM.submitBtn.style.display = 'inline-flex';
        } else {
            DOM.nextBtn.style.display = 'inline-flex';
            DOM.submitBtn.style.display = 'none';
        }

        // Scroll to top of form container smoothly
        document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * Handle Domain visibility based on Yes/No radio
     */
    function handleDomainToggle(e) {
        if (e.target.value === 'Yes') {
            DOM.domainInputGroup.style.display = 'flex';
            const input = document.getElementById('domainName');
            input.required = true;
            input.placeholder = "Enter your existing domain (e.g. www.myfirm.com)";
        } else {
            DOM.domainInputGroup.style.display = 'flex';
            const input = document.getElementById('domainName');
            input.required = false;
            input.placeholder = "Enter a preferred domain name idea (Optional)";
            FormValidation.clearError(input);
        }
    }

    /**
     * Show loading state on submit button
     */
    function setLoading(isLoading) {
        if (isLoading) {
            DOM.submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Submitting...';
            DOM.submitBtn.disabled = true;
            DOM.prevBtn.disabled = true;
        } else {
            DOM.submitBtn.innerHTML = 'Submit Requirements';
            DOM.submitBtn.disabled = false;
            DOM.prevBtn.disabled = false;
        }
    }

    function setStatus(message, isError = false) {
        if (!DOM.formStatus) return;
        DOM.formStatus.textContent = message;
        DOM.formStatus.classList.toggle('error', Boolean(isError));
        DOM.formStatus.hidden = !message;
    }

    /**
     * Show Success Screen
     */
    function showSuccess() {
        DOM.formContainer.style.display = 'none';
        DOM.headerContainer.style.display = 'none';
        DOM.successScreen.classList.remove('hidden');
        DOM.successScreen.classList.add('fade-in', 'visible');
        
        // Clear local storage draft
        if (window.FormLogic) window.FormLogic.clearDraft();
    }

    return {
        init,
        setLoading,
        setStatus,
        showSuccess,
        getCurrentStepElement: () => DOM.steps[currentStep]
    };
})();

// Initialize UI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    UIController.init();
});
