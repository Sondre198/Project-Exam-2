/**
 * Creates a new HTML element from the template with the given id.  
 * The template must contain at least one HTML element.
 * @param {string} templateId 
 * @returns {HTMLElement}
 */
function createFromTemplate(templateId) {
    /** @type {HTMLTemplateElement} */
    const template = document.getElementById(templateId);
    const clone = template.content.cloneNode(true);

    for (const node of clone.childNodes) {
        if (node instanceof HTMLElement) return node;
    }

    throw new Error("Template must contain at least one HTML element");
}

export function buildFromTemplate(templateId, builderCallback) {
    const element = createFromTemplate(templateId);
    const builder = {
        element,
        with(selector, elementCallback) {
            const target = selector ? element.querySelector(selector) : element;
            if (target) elementCallback(target);
            return builder;
        },
        withText(selector, text) {
            return this.with(selector, (element) => (element.innerText = text));
        },
        withAttribute(selector, attribute, value) {
            return this.with(selector, (element) =>
                element.setAttribute(attribute, value)
            );
        },
        withHandler(selector, event, handler) {
            return this.with(selector, (element) =>
                element.addEventListener(event, handler)
            );
        },
    };

    builderCallback?.(builder);
    return element;
}
