<script>
    import { onMount } from 'svelte';

    export let user; // User information passed down.

    let readonly = true; // Toggles between view and edit mode.
    let editingUser = { ...user }; // Clone of the user data for editing.
    let successMessage = null; // Success message after saving changes.
    let errorMessage = null; // Error message for failed save operations.

    // Mock Update User Function (Replace with real API call)
    async function updateUserDetails(updatedUser) {
        try {
            // Simulate an API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return { success: true };
        } catch (error) {
            throw new Error("Failed to update user details.");
        }
    }

    async function handleSave() {
        try {
            const response = await updateUserDetails(editingUser);
            if (response.success) {
                successMessage = "Profile updated successfully!";
                errorMessage = null;
                user = { ...editingUser }; // Update the main user object.
                readonly = true; // Exit edit mode.
            }
        } catch (err) {
            successMessage = null;
            errorMessage = err.message;
        }
    }

    function handleCancel() {
        editingUser = { ...user }; // Revert changes.
        readonly = true; // Exit edit mode.
    }
</script>

<main class="profile-page">
    <h1>My Profile</h1>

    <!-- Success/Error Messages -->
    {#if successMessage}
        <div class="success">{successMessage}</div>
    {/if}
    {#if errorMessage}
        <div class="error">{errorMessage}</div>
    {/if}

    <!-- User Profile Form -->
    <form>
        <div class="form-group">
            <label for="name">Name</label>
            <input
                    id="name"
                    type="text"
                    bind:value={editingUser.name}
                    disabled={readonly}
                    required
            />
        </div>

        <div class="form-group">
            <label for="email">Email</label>
            <input
                    id="email"
                    type="email"
                    bind:value={editingUser.email}
                    disabled={readonly}
                    required
            />
        </div>

        <div class="form-group">
            <label for="role">Role</label>
            <input
                    id="role"
                    type="text"
                    bind:value={editingUser.role}
                    disabled
                    readonly
            />
        </div>

        <!-- Editable Fields: Add more form fields here if needed -->

        <div class="form-actions">
            {#if readonly}
                <button type="button" class="edit-button" on:click={() => (readonly = false)}>
                    Edit Profile
                </button>
            {:else}
                <button type="button" class="save-button" on:click={handleSave}>
                    Save Changes
                </button>
                <button type="button" class="cancel-button" on:click={handleCancel}>
                    Cancel
                </button>
            {/if}
        </div>
    </form>
</main>

<style>
    .profile-page {
        max-width: 600px;
        margin: 2rem auto;
        padding: 2rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: #fdfdfd;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    h1 {
        text-align: center;
        margin-bottom: 2rem;
    }

    .form-group {
        margin-bottom: 1.5rem;
    }

    label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: bold;
    }

    input {
        width: 100%;
        padding: 0.75rem;
        font-size: 1rem;
        border: 1px solid #ddd;
        border-radius: 4px;
    }

    input:disabled {
        background: #f5f5f5;
        color: #aaa;
    }

    .form-actions {
        text-align: center;
    }

    .edit-button,
    .save-button,
    .cancel-button {
        margin: 0 0.5rem;
        padding: 0.5rem 1.5rem;
        font-size: 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .edit-button {
        background-color: #007bff;
        color: white;
    }

    .save-button {
        background-color: #28a745;
        color: white;
    }

    .cancel-button {
        background-color: #dc3545;
        color: white;
    }

    .success {
        background: #d4edda;
        color: #155724;
        padding: 0.75rem;
        border: 1px solid #c3e6cb;
        border-radius: 4px;
        margin-bottom: 1.5rem;
    }

    .error {
        background: #f8d7da;
        color: #721c24;
        padding: 0.75rem;
        border: 1px solid #f5c6cb;
        border-radius: 4px;
        margin-bottom: 1.5rem;
    }
</style>