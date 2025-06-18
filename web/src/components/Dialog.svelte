<script>
    export let isOpen = false; // Controls the visibility of the dialog.
    export let formComponent; // The dynamic form component to render inside the dialog.
    export let title = "Dialog"; // Title of the dialog.
    export let formProps = {}; // Props to pass to the form component, if any.
    export let onCancel = () => {}; // Cancel handler
    export let onSubmit = () => {}; // Submit handler

    // Track the form data dynamically from formProps
    let formData = {};
    let formSchema = {};
    $: if (formProps.data) {
        formData = { ...formProps.data }; // Ensure formData updates reactively
    }
    $: if (formProps.schema) {
        formSchema = { ...formProps.schema }; // Ensure formData updates reactively
    }

    function handleCancel() {
        closeDialog();
        if (onCancel) {
            onCancel();
        }
    }

    function handleSubmit() {
        closeDialog();
        if (onSubmit) {
            onSubmit(formData); // Pass updated formData back to caller
        }
    }

    // Close dialog by resetting visibility
    function closeDialog() {
        isOpen = false;
    }
</script>

<style>
    .dialog-overlay {
        width: 100%;
        height: 100%;
        background-color: rgba(1, 0, 1, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .dialog-content {
        background: white;
        width: 100%;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .dialog-title {
        font-size: 1.2rem;
        font-weight: bold;
    }

    .dialog-body {
        margin-bottom: 1rem;
    }

    .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
    }

    button {
        padding: 0.5rem 1rem;
        font-size: 1rem;
        border-radius: 4px;
        border: none;
        cursor: pointer;
    }

    .btn-cancel {
        background-color: #f8d7da;
        color: #842029;
    }

    .btn-cancel:hover {
        background-color: #f1b0b7;
    }

    .btn-submit {
        background-color: #d1e7dd;
        color: #0f5132;
    }

    .btn-submit:hover {
        background-color: #badbcc;
    }
</style>

{#if isOpen}
    <div class="dialog-overlay" on:click={handleCancel}>
        <div class="dialog-content" on:click|stopPropagation>
            <!-- Dialog Header -->
            <div class="dialog-header">
                <div class="dialog-title">{title}</div>
                <button on:click={handleCancel} style="background: none; border: none; font-size: 1rem; cursor: pointer;">&times;</button>
            </div>

            <!-- Dialog Body with Passed Form -->
            <div class="dialog-body">
                {#if formComponent}
                    <svelte:component
                        this={formComponent}
                        bind:data={formData}
                        bind:schema={formSchema}
                        {...formProps} />
                {/if}
            </div>

            <!-- Dialog Actions -->
            <div class="dialog-actions">
                <button class="btn-cancel" on:click={handleCancel}>Cancel</button>
                <button class="btn-submit" on:click={handleSubmit}>Submit</button>
            </div>
        </div>
    </div>
{/if}