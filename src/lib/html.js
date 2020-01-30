/**
 * Creates a placeholder option for a select box
 * @param {String} text The text to fill the placeholder
 * @return {Node} The created placeholder
 */
function createPlaceholder(text) {
  const option = document.createElement('option');
  option.value = 'choice';
  option.innerHTML = text;
  option.disabled = true;
  option.selected = true;

  return option;
}

/**
 * Creates an array of options with the given children
 * @param {Array<String>} children The list of options
 * @return {Array<Node>} An array filled with the generated options
 */
function createOptions(children) {
  const options = [];

  for (let child = 0; child < children.length; ++child) {
    const option = document.createElement('option');
    const text = children[child];
    option.value = text;
    option.innerHTML = text;
    options.push(option);
  }

  return options;
}

/**
 * Creates a select element with the given placeholder and children
 * @param {String} placeholder The placeholder text
 * @param {Array<String>} children The list of options
 * @return {Node} The generated select element
 */
function createSelect(placeholder, children) {
  const select = document.createElement('select');
  select.appendChild(createPlaceholder(placeholder));

  const options = createOptions(children);
  for (let i = 0; i < options.length; ++i) {
    select.appendChild(options[i]);
  }

  return select;
}

/**
 * Creates a select element with the given placeholder and grouped children
 * @param {String} placeholder The placeholder text
 * @param {Object} children An object with a group as every node
 * @return {Node} The generated select element
 */
function createGroupedSelect(placeholder, children) {
  const select = document.createElement('select');
  select.appendChild(createPlaceholder(placeholder));

  for (const group in children) {
    if (children.hasOwnProperty(group)) {
      const options = createOptions(children[group]);
      const optionGroup = document.createElement('optgroup');
      optionGroup.label = group;

      for (let i = 0; i < options.length; ++i) {
        optionGroup.appendChild(options[i]);
      }

      select.appendChild(optionGroup);
    }
  }

  return select;
}

/**
 * Creates a div element with each child as a radio input
 * @param {String} name The name of the category
 * @param {Array<String>} children A list of children
 * @param {Function} handle The click handler for each button
 * @return {Node} The div filled with radio buttons
 */
function createRadio(name, children, handle) {
  const parent = document.createElement('div');

  for (let child = 0; child < children.length; ++child) {
    const input = document.createElement('input');
    const text = children[child];

    input.type = 'radio';
    input.name = name;
    input.value = text;
    input.id = `${name}-${text}`;
    input.onclick = handle;

    if (child == 0) {
      input.checked = true;
    }

    parent.appendChild(input);

    const label = document.createElement('label');
    label.for = text;
    label.innerHTML = text;
    parent.appendChild(label);
  }

  return parent;
}

module.exports = {
  createPlaceholder: createPlaceholder,
  createOptions: createOptions,
  createSelect: createSelect,
  createGroupedSelect: createGroupedSelect,
  createRadio: createRadio,
}
