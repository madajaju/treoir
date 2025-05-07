<script>
    export let user;
</script>

<header class="app-header">
    <h1>My Application</h1>
    <div class="user-info">
        <span>Hi, {user.name}</span>
        <a href="/logout">Logout</a>
    </div>
</header>

<style>
    .app-header {
        height: 60px;
        background: #333;
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 1.5rem;
    }
</style>