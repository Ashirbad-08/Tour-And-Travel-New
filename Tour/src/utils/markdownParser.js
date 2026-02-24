import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { marked } from 'marked';

const window = new JSDOM('').window;
const dompurify = createDOMPurify(window);

// Helper to generate excerpt from markdown
export const generateExcerpt = (markdown, length = 160) => {
  if (!markdown) return '';
  const plainText = markdown
    .replace(/[#*`_~]/g, '') // Remove basic markdown symbols
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .trim();

  return plainText.length > length
    ? plainText.substring(0, length) + '...'
    : plainText;
};

const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'p', 'a', 'ul', 'ol', 'li',
  'b', 'i', 'strong', 'em', 'strike', 'del',
  'code', 'hr', 'br', 'div', 'table', 'thead',
  'tbody', 'tr', 'th', 'td', 'pre', 'img',
  'span', 'sup', 'sub', 'mark', 'ins'
];

const ALLOWED_ATTR = [
  'href', 'target', 'rel', 'title', 'class',
  'id', 'name', 'src', 'alt', 'width', 'height',
  'data-*' // Allow data attributes
];

const parseMarkdown = (markdown) => {
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }

  try {
    // Convert markdown to HTML
    const rawHtml = marked.parse(markdown);

    // Sanitize HTML to prevent XSS
    const cleanHtml = dompurify.sanitize(rawHtml, {
      ALLOWED_TAGS: ALLOWED_TAGS,
      ALLOWED_ATTR: ALLOWED_ATTR,
      ALLOW_DATA_ATTR: true,
      FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
    });

    return cleanHtml;
  } catch (error) {
    console.error('Error parsing markdown:', error);
    return '';
  }
};
export default parseMarkdown;
