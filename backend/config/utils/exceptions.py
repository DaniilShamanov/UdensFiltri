from rest_framework.views import exception_handler
from rest_framework.response import Response

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        # DRF errors are in the form: {"field_name": ["error message", ...]}
        data = response.data
        messages = []
        code = None

        # Extract first error message and, if possible, a code.
        if isinstance(data, dict):
            for field, errors in data.items():
                if isinstance(errors, list) and errors:
                    # Use the first error
                    first_error = errors[0]
                    # Try to extract error code (e.g., 'invalid', 'required')
                    if isinstance(first_error, dict):
                        # Sometimes DRF returns {code: ..., message: ...}
                        code = first_error.get('code')
                        message = first_error.get('message', str(first_error))
                    else:
                        message = str(first_error)
                    messages.append(message)
                    # Stop after first meaningful error
                    if code is None and hasattr(exc, 'code'):
                        code = exc.code
                    break
                elif isinstance(errors, str):
                    messages.append(errors)
                    break

        # Fallback to a generic message
        if not messages:
            messages = [str(exc)]

        message = ' '.join(messages)
        # If we didn't get a code from the error, use a default
        if code is None:
            code = 'validation_error'

        # Return the new response format
        return Response({"message": message, "code": code}, status=response.status_code)

    return response