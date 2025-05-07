<script>
    // Assume `session` or `user` is passed down from a global context or layout.
    export let user;

    // Role-based navigation logic
    const roleRedirects = {
        AccountExec: '/account-exec',
        OtherActor: '/other-actor',
        Admin: '/admin-dashboard',
    };

    let quickLink;

    // Set default quick navigation for authenticated users
    if (user?.role) {
        quickLink = roleRedirects[user.role];
    } else {
        quickLink = '/login'; // Redirect for unauthenticated users
    }

    // Simulate example system-wide data for demonstration purposes
    const systemData = {
        totalUsers: 1200,
        activeAccounts: 345,
        recentUpdates: [
            { title: "New Feature: Role-Based Dashboards", date: "2023-10-01" },
            { title: "System Maintenance Scheduled", date: "2023-09-15" },
        ],
    };
</script>

{#if user}
    <section class="home-container">
        <h1>Welcome, {user.name}!</h1>
        <p>Your role: <strong>{user.role}</strong></p>

        <div class="quick-navigation">
            <a href={quickLink} class="dashboard-link">
                Go to your Dashboard
            </a>
        </div>

        <!-- Optionally display system-wide summaries -->
        <section class="system-overview">
            <h2>System Overview</h2>
            <ul>
                <li>Total Users: {systemData.totalUsers}</li>
                <li>Active Accounts: {systemData.activeAccounts}</li>
            </ul>
        </section>

        <!-- Optionally display global announcements -->
        <section class="recent-updates">
            <h2>Recent Updates</h2>
            <ul>
                {#each systemData.recentUpdates as update}
                    <li>
                        <strong>{update.title}</strong> - {update.date}
                    </li>
                {/each}
            </ul>
        </section>
    </section>
{:else}
    <!-- Unauthenticated Users -->
    <section class="login-redirect">
        <h1>Welcome to the App</h1>
        <p>You are not logged in. Please <a href="/login">Log In</a> to access your dashboard.</p>
    </section>
{/if}

<style>
    .home-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 2rem;
    }

    .quick-navigation .dashboard-link {
        padding: 1rem 2rem;
        margin: 1rem;
        background-color: #007bff;
        color: white;
        text-decoration: none;
        border-radius: 5px;
        font-size: 1.25rem;
    }

    .quick-navigation .dashboard-link:hover {
        background-color: #0056b3;
    }

    .system-overview {
        margin: 2rem 0;
    }

    .recent-updates {
        margin: 2rem 0;
    }

    .login-redirect {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        margin-top: 2rem;
    }

    .login-redirect p > a {
        color: #007bff;
        text-decoration: underline;
    }
</style>