import TurndownService from 'turndown';
const turndownService = new TurndownService();

export const pipe = funcs =>
  [...funcs].reduce(
    (f, g) =>
      (...args) =>
        g(f(...args))
  );

export const tap = message => value => {
  console.log(message);
  console.log(value);
  return value;
};

/**
 * @description
 * Chrome extensions don't support modules in content scripts.
 */

const removeBySelector = selector => doc => {
  doc.querySelectorAll(selector).forEach(e => e.remove());
};

const replaceBySelector = (selector, before, after) => doc => {
  doc.querySelectorAll(selector).forEach(e => before + e.innerText + after);
};

const contentToObsidian = pipe([
  replaceBySelector('span + script', '$', '$'),
  replaceBySelector('div + script', '$$', '$$'),
  removeBySelector('span'),
  removeBySelector('div'),
  turndownService.turndown,
]);

const contentToObsidian2 = doc => {
  doc
    .querySelectorAll('script[type$=tex]') //
    .forEach(e => (e.innerText = '$' + e.innerText + '$'));
  doc
    .querySelectorAll('script[type$=display]')
    .forEach(e => (e.innerText = '$$' + e.innerText + '$$'));
  doc
    .querySelectorAll('span[class^=MathJax]') //
    .forEach(e => e.remove());
  doc
    .querySelectorAll('div[class^=MathJax]') //
    .forEach(e => e.remove());
  console.log(doc);
  return turndownService.turndown(doc);
};

//import("./components/Demo");
const mainSelector = '#mainbar';
const qHeaderSelector = '#question-header a.question-hyperlink';
const aBodySelector = 'div.s-prose.js-post-body';

const title = document.querySelectorAll(qHeaderSelector)[0].innerText;

const doc = document.querySelector(mainSelector).cloneNode(true);
console.log(doc);
const answerNodes = Array.from(doc.querySelectorAll(aBodySelector));
const answersText = answerNodes
  .map(contentToObsidian2)
  .join('\n')
  .replace(/\\\\/g, '\\')
  .replace(/\\_/g, '_');

console.log(title);
console.log(answersText);
