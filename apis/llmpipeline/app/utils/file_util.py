import base64
import requests

class FileUtils:
    @staticmethod
    def get_file_data_from_url(file_url):
        """
        Static method to fetch a file from a URL and return its MIME type and base64 encoded content.
        """
        try:
            response = requests.get(file_url)
            response.raise_for_status()  # Raise an exception for HTTP errors
            
            # Get MIME type from content
            mime_type = response.headers.get('Content-Type')
            
            # Base64 encode the file content
            encoded_content = base64.b64encode(response.content).decode('utf-8')
            
            return mime_type, encoded_content
        except Exception as e:
            # Handle any errors (network issues, invalid URLs, etc.)
            print(f"Error fetching file from URL: {str(e)}")
            return None, None
