"use strict";
// Need to add the plus / minus
function swCheckboxTree(options) {
    const recursiveBuild = (options, parent) => {
        const tree = {
            options: options,
            element: document.createElement('div')
        };
        tree.element.classList.add('sw-checkbox-tree');
        for (const option of options) {
            const label = document.createElement('label');
            const span = document.createElement('span');
            option.element = document.createElement('input');
            option.element.type = 'checkbox';
            option.element.id = option.id ?? '';
            option.element.value = option.value ?? '';
            option.element.checked = !!option.checked;
            option.element.disabled = !!option.disabled;
            option.element.required = !!option.required;
            span.append(typeof option.label === 'function' ? option.label() : option.label);
            label.append(option.element, span);
            const wrapper = document.createElement('div');
            if (option.children?.length) {
                //const wrapper = document.createElement('div');
                const button = buildButton();
                button.addEventListener('click', () => {
                    childTree.element.style.display = childTree.element.style.display === 'none' ? '' : 'none';
                    button.style.rotate = childTree.element.style.display === 'none' ? '' : '90deg';
                });
                wrapper.append(button, label);
                tree.element.append(wrapper);
                const childTree = recursiveBuild(option.children, tree.element);
                option.element.addEventListener('change', () => {
                    for (const childOption of childTree.options) {
                        if (childOption.element && !childOption.element.disabled) {
                            childOption.element.indeterminate = false;
                            childOption.element.checked = !!option.element?.checked;
                            childOption.element.dispatchEvent(new Event('change'));
                        }
                    }
                });
                childTree.element.addEventListener('change', () => handleChildTreeChange(childTree, option));
                handleChildTreeChange(childTree, option);
                childTree.element.style.display = 'none';
            }
            else {
                wrapper.append(label);
                tree.element.append(wrapper);
                //tree.element.append(label);
            }
        }
        if (parent)
            parent.append(tree.element);
        return tree;
    };
    const buildButton = () => {
        const button = document.createElement('button');
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        svg.setAttribute('fill', 'black');
        path.setAttribute('d', 'M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z');
        svg.append(path);
        button.append(svg);
        return button;
    };
    const handleChildTreeChange = (childTree, parentOption) => {
        if (!parentOption.element)
            return;
        parentOption.element.checked = childTree.options.filter(o => !o.element?.disabled).every(o => !!o.element?.checked);
        parentOption.element.indeterminate = childTree.options.filter(o => !o.element?.disabled).some(o => !!o.element?.checked)
            && childTree.options.filter(o => !o.element?.disabled).some(o => !o.element?.checked);
    };
    // This returns a flattened array of only the bottom-level checkboxes from the tree - No checkboxes with children
    const recursiveFlatten = (options) => {
        const flatResult = [];
        for (const option of options) {
            flatResult.push(option);
            if (option.children?.length)
                flatResult.push(...recursiveFlatten(option.children));
        }
        return flatResult;
    };
    // Make a param?
    const _options = [];
    return {
        ...recursiveBuild(_options),
        // setOptions(options: Array<TOption>) {
        //     this.options = options;
        // },
        get options() {
            return _options;
        },
        set options(options) {
            const tree = recursiveBuild(options, this.element);
            //_options = tree.options; Got rid of this line because it mutates unnecessarily
            _options.length = 0;
            _options.push(...tree.options);
            this.element.replaceWith(tree.element); // We are losing reference to the DOM element here so there is probably a nicer way to do this
            this.element = tree.element;
        },
        get selectedValues() {
            return recursiveFlatten(_options).filter(o => !o.children?.length && !!o.element?.checked).map(o => o.element?.value ?? '');
        },
        get selectedIds() {
            console.log(recursiveFlatten(_options));
            return recursiveFlatten(_options).filter(o => !!o.element?.checked).map(o => o.element?.id ?? '');
        },
        clearAll() {
        },
        selectAll() {
        }
        // get selectedValuesInTreeFormat... etc
    };
}
