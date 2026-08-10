export function createTreeNode(element) {
    let retval = `
    <div style="display: inline-flex; align-items: center; gap: 8px; font-family: Arial, sans-serif; font-size: 14px;">
        <div class="partner-color-circle" data-partner-id="${element.id}" 
            style="width: 16px; height: 16px; border-radius: 50%; background-color: ${element.color || '#bb7700'}; flex-shrink: 0;">
        </div>
        <span>${element.name}</span>
    </div>
    `
    return retval;
}