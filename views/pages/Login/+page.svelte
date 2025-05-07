<script>
    import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';

    // Props/API for login functionality
    export let authenticateUser; // Function to authenticate users

    let username = "";
    let password = "";
    let errorMessage = null;

    const dispatch = createEventDispatcher();

    async function handleLogin(e) {
        e.preventDefault(); // Prevent form refresh

        try {
            // Perform authentication - Call the backend API
            const user = await authenticateUser(username, password);

            // Dispatch event for parent to handle login state if necessary
            dispatch('login', { user });

            // Handle redirection after login
            const roleRedirects = {
                AccountExec: '/account-exec',
                OtherActor: '/other-actor',
            };

            const redirectPath = roleRedirects[user.role] || '/';
            window.location.href = redirectPath; // Navigate to respective dashboard
        } catch (err) {
            errorMessage = err.message || "Login failed. Please try again.";
        }
    }
</script>

<main class="login-page">
    <h1>Welcome Back</h1>
    <p>Log in to access your account.</p>

    {#if errorMessage}
        <div class="error">{errorMessage}</div>
    {/if}

    <form on:submit={handleLogin}>
        <div class="form-group">
            <label for="username">Username</label>
            <input
                    id="username"
                    type="text"
                    bind:value={username}
                    placeholder="Enter your username"
                    required />
        </div>

        <div class="form-group">
            <label for="password">Password</label>
            <input
                    id="password"
                    type="password"
                    bind:value={password}
                    placeholder="Enter your password"
                    required />
        </div>

        <button class="login-button" type="submit">Login</button>
    </form>
</main>

<style>
    .login-page {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 1rem;
        background: #f4f4f9;
    }

    h1 {
        font-size: 2rem;
        margin-bottom: 1rem;
    }

    p {
        font-size: 1rem;
        margin-bottom: 2rem;
    }

    .error {
        background: #ffefef;
        border: 1px solid #ff0000;
        color: #c00;
        padding: 0.5rem;
        margin-bottom: 1rem;
    }

    form {
        max-width: 400px;
        width: 100%;
        display: flex;
        flex-direction: column;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        margin-bottom: 1rem;
    }

    label {
        margin-bottom: 0.5rem;
    }

    input {
        height: 40px;
        padding: 0.5rem;
        font-size: 1rem;
        border: 1px solid #ddd;
        border-radius: 5px;
    }

    .login-button {
        height: 40px;
        font-size: 1rem;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    .login-button:hover {
        background-color: #0056b3;
    }
</style>