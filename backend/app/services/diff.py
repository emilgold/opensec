import re
from diff_match_patch import diff_match_patch


def compute_diff(text1: str, text2: str) -> str:
    """Compute a visual HTML diff between two texts.

    Returns HTML with <ins> and <del> tags highlighting changes.
    """
    dmp = diff_match_patch()
    diffs = dmp.diff_main(text1, text2)
    dmp.diff_cleanupSemantic(diffs)
    return dmp.diff_prettyHtml(diffs)


def strip_html_tags(html: str) -> str:
    """Strip HTML tags for text-level comparison."""
    clean = re.sub(r'<[^>]+>', ' ', html)
    clean = re.sub(r'\s+', ' ', clean)
    return clean.strip()
