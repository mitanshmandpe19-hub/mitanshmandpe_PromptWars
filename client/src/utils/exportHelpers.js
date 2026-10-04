/**
 * Formats decision summary into formatted plain-text receipt.
 *
 * @param {Object} params
 * @param {string} params.decision
 * @param {string} params.originalText
 * @param {Array<string>} [params.checked]
 * @param {Array<string>} [params.still_unknown]
 * @param {Array<string>} [params.next_checks]
 * @param {string} [params.disclaimer]
 * @returns {string}
 */
export function formatSummaryReceiptText({
  decision,
  originalText,
  checked = [],
  still_unknown = [],
  next_checks = [],
  disclaimer = 'This is a thinking aid, not advice. The decision is yours.',
}) {
  return `BLIND SPOT — THINKING SUMMARY
=========================================
DECISION:
${decision}

ORIGINAL REASONING:
${originalText}

WHAT WAS CHECKED:
${checked.map((c) => `• ${c}`).join('\n')}

WHAT REMAINS UNKNOWN:
${still_unknown.map((u) => `• ${u}`).join('\n')}

ACTIONABLE NEXT CHECKS:
${next_checks.map((n) => `• ${n}`).join('\n')}

-----------------------------------------
${disclaimer}
`;
}

/**
 * Copies formatted text to system clipboard.
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyTextToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Triggers browser download of text file.
 * @param {string} text
 * @param {string} filename
 */
export function downloadTextFile(text, filename) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
