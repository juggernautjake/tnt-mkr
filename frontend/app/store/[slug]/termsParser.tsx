import React from 'react';

export function parseTermsAndConditionsToComponents(text: string): JSX.Element[] {
  if (!text || typeof text !== 'string') {
    console.error("[ERROR] Invalid input: text is empty or not a string");
    return [<p key="error">Invalid terms text</p>];
  }

  const sectionRegex = /\[SECTION TITLE\](.*?)\[SECTION BODY\](.*?)(?=\[SECTION TITLE\]|$)/gs;
  const sections: JSX.Element[] = [];
  let matchCount = 0;

  let match;
  while ((match = sectionRegex.exec(text)) !== null) {
    matchCount++;
    const title = match[1]?.trim().replace(/:$/, '') || 'Untitled Section';
    const body = match[2]?.trim() || '';

    const bodyLines = body.split('\n').filter(line => line.trim() !== '');
    const listElements = parseBodyToComponents(bodyLines);

    sections.push(
      <div className="terms-section" key={matchCount}>
        <h3>{title}</h3>
        {listElements.length > 0 ? listElements : <p>No content available</p>}
      </div>
    );
  }

  if (matchCount === 0) {
    return [<p key="no-sections">No sections available to display</p>];
  }

  return sections;
}

function parseBodyToComponents(lines: string[]): JSX.Element[] {
  if (!lines || lines.length === 0) {
    return [];
  }

  const elements: JSX.Element[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (line.startsWith('--')) {
      const listStartIndex = i;
      const isNumbered = /^\d+\./.test(line.slice(2).trim());
      const listItems: JSX.Element[] = [];

      while (i < lines.length && lines[i].trim().startsWith('--')) {
        let itemText = lines[i].trim().slice(2).trim(); // Remove '--'
        if (isNumbered) {
          itemText = itemText.replace(/^\d+\.\s*/, ''); // Remove manual number and period
        }
        listItems.push(<li key={i}>{itemText || 'Empty item'}</li>);
        i++;
      }

      const listElement = isNumbered ? (
        <ol key={listStartIndex}>
          {listItems}
        </ol>
      ) : (
        <ul className="diamond-list" key={listStartIndex}>
          {listItems}
        </ul>
      );
      elements.push(listElement);
    } else {
      elements.push(<p key={i}>{line || 'Empty line'}</p>);
      i++;
    }
  }

  return elements;
}

// Original string-based parser (for reference, if needed)
export function parseTermsAndConditions(text: string): string {
  if (!text || typeof text !== 'string') {
    console.error("[ERROR] Invalid input: text is empty or not a string");
    return '';
  }

  const sectionRegex = /\[SECTION TITLE\](.*?)\[SECTION BODY\](.*?)(?=\[SECTION TITLE\]|$)/gs;
  let html = '';
  let matchCount = 0;

  let match;
  while ((match = sectionRegex.exec(text)) !== null) {
    matchCount++;
    const title = match[1]?.trim().replace(/:$/, '') || 'Untitled Section';
    const body = match[2]?.trim() || '';
    const bodyLines = body.split('\n').filter(line => line.trim() !== '');
    const listHtml = parseBody(bodyLines);
    html += `
      <div class="terms-section">
        <h3>${title}</h3>
        ${listHtml || '<p>No content available</p>'}
      </div>
    `;
  }

  if (matchCount === 0) {
    html = '<p>No sections available to display</p>';
  }

  return html.trim();
}

function parseBody(lines: string[]): string {
  if (!lines || lines.length === 0) {
    return '';
  }

  let html = '';
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (line.startsWith('--')) {
      const isNumbered = /^\d+\./.test(line.slice(2).trim());
      const listType = isNumbered ? 'ol' : 'ul';
      const listClass = isNumbered ? '' : 'diamond-list';
      html += `<${listType} class="${listClass}">`;

      while (i < lines.length && lines[i].trim().startsWith('--')) {
        let itemText = lines[i].trim().slice(2).trim();
        if (isNumbered) {
          itemText = itemText.replace(/^\d+\.\s*/, '');
        }
        const subLines: string[] = [];
        i++;

        while (i < lines.length && lines[i].trim().startsWith('---')) {
          subLines.push(lines[i].trim().slice(3).trim());
          i++;
        }

        const subListHtml = parseSubList(subLines);
        html += `<li>${itemText || 'Empty item'}${subListHtml}</li>`;
      }
      html += `</${listType}>`;
    } else {
      html += `<p>${line || 'Empty line'}</p>`;
      i++;
    }
  }

  return html;
}

function parseSubList(lines: string[]): string {
  if (!lines.length) {
    return '';
  }

  const isNumbered = /^\d+\./.test(lines[0]);
  const listType = isNumbered ? 'ol' : 'ul';
  const listClass = isNumbered ? '' : 'diamond-list';
  let html = `<${listType} class="${listClass}">`;

  for (const line of lines) {
    let cleanItemText = line;
    if (isNumbered) {
      cleanItemText = line.replace(/^\d+\.\s*/, '');
    }
    html += `<li>${cleanItemText || 'Empty subitem'}</li>`;
  }

  html += `</${listType}>`;
  return html;
}