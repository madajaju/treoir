export function createTreeNode(element) {
    const phaseColor = {
        "Current": "#000088",
        "Future": "#008800"
    };
    let retval = `<div style="display: inline-flex; align-items: center; gap: 8px; font-family: Arial, sans-serif; font-size: 14px;">
        <div style="width: 16px; height: 16px; border-radius: 50%; background-color: ${element.color || phaseColor[element.name] || '#0000ff'}; flex-shrink: 0;"></div>
        <span>${element.name}</span>
    </div>`
    return retval;
}