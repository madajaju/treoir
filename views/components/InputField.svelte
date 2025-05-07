<script>
    export let label = "";       // Input label
    export let type = "text";    // Input type (text, email, password, etc.)
    export let required = false; // Whether the field is required
    export let placeholder = ""; // Placeholder text
    export let value = "";       // Two-way binding for value
    export let errorMessage = ""; // Error message to show validation errors

    // Accessibility helpers
    const inputId = `input-${Math.random().toString(16).slice(2)}`;
</script>

<div class="input-field">
    {#if label}
        <label for={inputId} class="label">
            {label} {#if required}<span class="required">*</span>{/if}
        </label>
    {/if}

    <input
            id={inputId}
            class="input"
            type={type}
            bind:value
            placeholder={placeholder}
            required={required}
    />

    {#if errorMessage}
        <span class="error-message">{errorMessage}</span>
    {/if}
</div>

<style>
    .input-field {
        margin-bottom: 1rem;
    }

    .label {
        display: block;
        font-weight: bold;
        margin-bottom: 0.5rem;
        color: #333;
    }

    .required {
        color: red;
        margin-left: 0.2rem;
    }

    .input {
        width: 100%;
        padding: 0.5rem;
        font-size: 1rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        outline: none;
        transition: border-color 0.2s ease;
    }

    .input:focus {
        border-color: #007bff;
    }

    .error-message {
        color: red;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        display: block;
    }
</style>