export const routes = [
    {
        path: '/',
        component: 'views/pages/Home/+page.svelte',
        name: 'Home',
    },
    {
        path: '/login',
        component: 'views/pages/Login/+page.svelte',
        name: 'Login',
    },
    {
        path: '/profile',
        component: 'views/pages/Profile/+page.svelte',
        name: 'Profile',
    },
    {
        path: '/account-exec',
        component: 'actors/AccountExec/views/pages/+page.svelte',
        name: 'Account Exec Dashboard',
    },
];