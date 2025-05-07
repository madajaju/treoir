<script>
    export let user = null; // Optional: User object to manage authentication-related views
    export let links = [
        { name: "Home", path: "/" },
        { name: "Profile", path: "/profile" },
        { name: "Login", path: "/login" }
    ];
</script>

<header class="header">
    <div class="branding">
        <a href="/">
            <h1>My App</h1>
        </a>
    </div>

    <nav class="navigation">
        <ul>
            {#each links as link}
                <li>
                    <a href={link.path}>{link.name}</a>
                </li>
            {/each}
        </ul>
    </nav>

    <div class="user-info">
        {#if user}
            <p>Welcome, {user.name}</p>
            <a href="/logout">Logout</a>
        {:else}
            <a class="login-btn" href="/login">Login</a>
        {/if}
    </div>
</header>

<style>
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
        background-color: #333;
        color: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .branding h1 {
        margin: 0;
        font-size: 1.5rem;
        color: #f8a34f;
    }

    .branding a {
        text-decoration: none;
        color: inherit;
    }

    .navigation ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        gap: 1.5rem;
    }

    .navigation a {
        text-decoration: none;
        font-size: 1rem;
        color: white;
    }

    .navigation a:hover {
        color: #f8a34f;
    }

    .user-info {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .login-btn {
        background-color: #f8a34f;
        color: #333;
        padding: 0.5rem 1rem;
        text-decoration: none;
        border-radius: 5px;
        font-weight: bold;
    }

    .login-btn:hover {
        background-color: #e38e3b;
    }

    p {
        margin: 0;
        font-size: 1rem;
    }

    a {
        color: white;
        text-decoration: none;
    }
</style>