<script>
    export let user;

    // Example menu structure based on roles
    const menuItems = {
        default: [{ name: 'Home', path: '/' }, { name: 'Profile', path: '/profile' }],
        AccountExec: [{ name: 'Dashboard', path: '/account-exec' }],
        OtherActor: [{ name: 'Analytics', path: '/analytics' }],
    };

    const role = user.role || 'default';
</script>

<aside class="app-sidebar">
    <nav>
        <ul>
            {#each menuItems[role] || menuItems.default as item}
                <li><a href={item.path}>{item.name}</a></li>
            {/each}
        </ul>
    </nav>
</aside>

<style>
    .app-sidebar {
        width: 250px;
        background: #f4f4f4;
        padding: 1rem;
    }
    ul {
        list-style: none;
        padding: 0;
    }
    li {
        margin: 0.5rem 0;
    }
    a {
        color: #007bff;
        text-decoration: none;
    }
</style>