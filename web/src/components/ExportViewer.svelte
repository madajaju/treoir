<script>
    import {exportItem, exportState, exportText} from "../stores/exportStore.js"
    import Menu from "./Menu.svelte";

    import {marked} from 'marked';
    import MDEditor from "./MDEditor.svelte";
    export let onClose;
    export let onStop;
    export let onAnalyze;
    export let onSave;

    let renderedHTML = ''; // Variable to hold rendered HTML
    $: renderedHTML = marked($exportText);
    let state = "analyzing";
    $: state = $exportState;


    let author = {
        name: "Dr. Darren Pulsipher",
        title: "Chief Solution Architect of Public Sector"
    };
    async function printToPDF() {
        if(state === "analyzing") {
            alert("You can't print the content while the analysis is running.");
            return;
        }
        try {
            const response = await fetch('/exportpdf.html')
            if (!response.ok) {
                console.error('Error fetching exportpdf.html');
                return;
            }
            const html = await response.text();
            const filledContent = html
                .replace(/__BODY__/g, renderedHTML)
                .replace(/__DATE__/g, new Date().toLocaleDateString())
                .replace(/__CUSTOMERNAME__/g, $exportItem.name)
                .replace(/__AUTHOR__/g, author.name)
                .replace(/__AUTHORTITLE__/g, author.title);

            const printWindow = window.open("", "_blank");
            if (printWindow) {
                printWindow.document.open();
                printWindow.document.write(filledContent);
                printWindow.document.close();
                setTimeout(() => {
                    printWindow.focus();
                    printWindow.print();
                    printWindow.close();
                }, 2000)
            }
        } catch (e) {
            console.error('Error printing to PDF', e);
        }
    }
    function editContent() {
        if(state === "analyzing") {
            alert("You can't edit the content while the analysis is running.");
            return;
        }
        state = "Editing";
    }
    function closeEditor() {
        state = "Complete";
    }
    function saveDoc(content) {
        state = "Complete";
        // onSave($exportText);
        exportText.set(content);
        exportState.set("Edited");
        onSave();
    }
    function handleUpdate(event) {
        console.log('handleUpdate');
        console.log(event);

    }
    let menuItems = [
        { label: "Analyze", action: onAnalyze },
        { label: "Stop",  action: onStop},
        { label: "Edit", action: editContent },
        { label: "Print", action: printToPDF },
        { label: "Close", action: onClose }
    ];
</script>

<Menu {menuItems} />

{#if state === 'Editing'}
    <MDEditor bind:md={$exportText}
              on:update={handleUpdate}
              closeEditor={closeEditor}
              saveDoc={saveDoc}
    />
{:else}
    <div class="markdown-viewer">
        {@html renderedHTML}
    </div>
{/if}

<style>
    /* General styling for Markdown */

    .menu-bar {
        display: flex;
        gap: 10px;
        margin-bottom: 10px;
    }

    .menu-button {
        padding: 5px 15px;
        border: 1px solid #ccc;
        border-radius: 4px;
        background: #f8f8f8;
        cursor: pointer;
    }

    .menu-button:hover {
        background: #e8e8e8;
    }
    .markdown-viewer {
        font-family: Georgia, sans-serif;
        line-height: 1.6;
        margin: 1em; /* General margin */
        max-width: 800px; /* Limit width for readability */
    }

    /* General font family for headings */
    :global(.markdown-viewer h1, h2, h3, h4, h5, h6) {
        font-family: 'Georgia', 'Times New Roman', serif;
        line-height: 1.4;
        margin-bottom: 0.8em;
        color: #2c3e50;
        page-break-after: avoid;
    }

    /* H1: Main Title / Largest Header */
    :global(.markdown-viewer h1) {
        font-size: 1.5em;
        font-weight: bold;
        margin-top: 1.2em;
        text-align: left;
        color: #1E4056;
    }

    /* H2: Main Sections */
    :global(.markdown-viewer h2) {
        font-size: 1.2em;
        font-weight: bold;
        margin-top: 1em;
        padding-bottom: 0.2em;
    }

    /* H3: Subsections */
    :global(.markdown-viewer h3) {
        font-size: 1.2em;
        font-weight: 600;
        margin-top: 0.8em;
        color: #34495e;
    }

    /* H4: Sub-subsections */
    :global(.markdown-viewer h4) {
        font-size: 1.2em;
        font-weight: 500;
        margin-top: 0.6em;
        color: #5d6d7e;
    }

    /* H5: Minor Sections or Notes */
    :global(.markdown-viewer h5) {
        font-size: 1.2em;
        font-weight: 400;
        margin-top: 0.4em;
        color: #7f8c8d;
    }

    /* Avoid splitting paragraphs across pages */
    :global(.markdown-viewer p) {
        page-break-inside: avoid;
        margin: 1em 0;
    }

    /* Set rules for blockquote */
    :global(.markdown-viewer blockquote) {
        font-style: italic;
        border-left: 4px solid #dddddd;
        color: #555555;
        padding-left: 1em;
        margin: 1em 0;
        page-break-inside: avoid;
    }

    /* Code blocks and inline code */
    :global(.markdown-viewer code) {
        font-family: 'Courier New', monospace;
        background-color: #f4f4f4;
        padding: 0.2em 0.4em;
        border-radius: 3px;
    }

    :global(.markdown-viewer pre) {
        background-color: #f4f4f4;
        padding: 1em;
        overflow: auto;
        border-radius: 5px;
        page-break-inside: avoid;
    }

    /* List styling */
    :global(.markdown-viewer ul, ol) {
        padding-left: 2em;
        margin: 1em 0;
    }

    /* Table formatting for print-friendly layout */
    :global(.markdown-viewer table) {
        width: 100%;
        border-collapse: collapse;
        margin: 1em 0;
    }

    :global(.markdown-viewer table th, .markdown-viewer table td) {
        border: 1px solid #ddd;
        padding: 8px;
    }

    :global(.markdown-viewer table th) {
        background-color: #f4f4f4;
        font-weight: bold;
    }

    /* Print-specific styles using @media print */
    @media print {
        body {
            margin: 0;
            padding: 0;
            background: white;
        }

        .markdown-viewer {
            font-size: 12pt;
            color: black;
        }

        /* Add page breaks for better PDF layout */
        :global(.markdown-viewer h1, .markdown-viewer h2) {
            page-break-before: always;
        }

        /* Prevent unwanted page breaks inside elements */
        :global(.markdown-viewer table,
                .markdown-viewer blockquote,
                .markdown-viewer pre,
                .markdown-viewer code) {
            page-break-inside: avoid;
        }

        /* Hide unnecessary elements */
        nav, footer, .no-print {
            display: none;
        }
    }
</style>
