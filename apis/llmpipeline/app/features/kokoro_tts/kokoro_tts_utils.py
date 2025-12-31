import re
import emoji
import markdown2
import html

def clean_text_for_tts(text):
    # Convert Markdown to HTML
    html_text = markdown2.markdown(text)
    print('After markdown2.markdown:', repr(html_text))
    # Remove HTML tags
    plain_text = re.sub(r'<[^>]+>', '', html_text)
    print('After removing HTML tags:', repr(plain_text))
    # Unescape HTML entities
    plain_text = html.unescape(plain_text)
    print('After unescaping HTML entities:', repr(plain_text))
    # Normalize whitespace (optional)
    plain_text = re.sub(r'\s+', ' ', plain_text)
    print('After normalizing whitespace:', repr(plain_text))
    # Remove asterisks and common decorative symbols
    plain_text = re.sub(r'[\*•★☆◆◇●○■□▲△▼▽▶▷◀◁◆◇]', '', plain_text)
    print('After removing symbols:', repr(plain_text))
    # Remove any remaining non-printable or control characters
    plain_text = re.sub(r'[\x00-\x1F\x7F]', '', plain_text)
    print('After removing control chars:', repr(plain_text))
    # Remove emojis using the emoji library
    plain_text = emoji.replace_emoji(plain_text, replace='')
    print('After removing emojis:', repr(plain_text))
    return plain_text.strip()
