<script>
    // Optional: For dynamic years in the copyright
    const currentYear = new Date().getFullYear();

    // Optional: Social links (or other footer links)
    export let socialLinks = [
        { name: "Facebook", url: "https://facebook.com", icon: "🌐" },
        { name: "Twitter", url: "https://twitter.com", icon: "🐦" },
        { name: "LinkedIn", url: "https://linkedin.com", icon: "💼" },
    ];

    // Additional links (optional)
    export let footerLinks = [
        { name: "Privacy Policy", url: "/privacy-policy" },
        { name: "Terms of Service", url: "/terms-of-service" },
    ];
</script>

<footer class="footer">
    <div class="branding">
        <h2>My Company</h2>
        <p>Creating great experiences since 2023.</p>
    </div>

    <div class="links">
        <ul>
            {#each footerLinks as link}
                <li>
                    <a href={link.url}>{link.name}</a>
                </li>
            {/each}
        </ul>
    </div>

    <div class="social">
        <ul>
            {#each socialLinks as social}
                <li>
                    <a href={social.url} target="_blank" rel="noopener noreferrer">
                        <span>{social.icon}</span> {social.name}
                    </a>
                </li>
            {/each}
        </ul>
    </div>

    <div class="copyright">
        <p>&copy; {currentYear} My Company. All rights reserved.</p>
    </div>
</footer>

<style>
    /* Footer Styling */
    footer.footer {
        padding: 2rem 1rem;
        background-color: #333;
        color: white;
        text-align: center;
    }

    .branding h2 {
        margin: 0;
        font-size: 1.5rem;
        color: #f8a34f;
    }

    .branding p {
        margin: 0.5rem 0;
        font-size: 0.9rem;
        color: #bbb;
    }

    .links ul,
    .social ul {
        list-style: none;
        margin: 1rem 0;
        padding: 0;
    }

    .links ul li,
    .social ul li {
        margin: 0.5rem 0;
    }

    a {
        color: #f8a34f;
        text-decoration: none;
    }

    a:hover {
        text-decoration: underline;
    }

    .social ul li a span {
        margin-right: 0.5rem;
    }

    .copyright p {
        margin-top: 1rem;
        font-size: 0.8rem;
        color: #aaa;
    }
</style>