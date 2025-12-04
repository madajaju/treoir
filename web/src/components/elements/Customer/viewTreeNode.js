export function createTreeNode(element) {
    let retval = `<div style="display: inline-flex; align-items: center; gap: 8px; font-family: Arial, sans-serif; font-size: 14px;">
        <span>${element.name}</span>
    </div>`
    return retval;
}