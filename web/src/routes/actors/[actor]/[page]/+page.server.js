export function load({ params }) {
    console.log('Actor:', params.actor);
    console.log('Page:', params.page);

    // Example: Pass data to the +page.svelte component
    return {
        actor: params.actor,
        page: params.page
    };
}
