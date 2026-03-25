import logging
import time
import uuid


request_logger = logging.getLogger("udensfiltri.request")


class RequestLoggingMiddleware:
    """
    Adds a request id and logs request lifecycle in a Grafana/Loki-friendly way.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.request_id = request_id
        start_time = time.perf_counter()

        request_logger.info(
            "request_started",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.path,
                "query_string": request.META.get("QUERY_STRING", ""),
                "remote_addr": request.META.get("REMOTE_ADDR", ""),
                "user_id": getattr(getattr(request, "user", None), "id", None),
            },
        )

        try:
            response = self.get_response(request)
        except Exception:
            request_logger.exception(
                "request_exception",
                extra={
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.path,
                    "user_id": getattr(getattr(request, "user", None), "id", None),
                },
            )
            raise
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        response["X-Request-ID"] = request_id

        level = logging.INFO if response.status_code < 400 else logging.WARNING
        request_logger.log(
            level,
            "request_finished",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.path,
                "status_code": response.status_code,
                "duration_ms": duration_ms,
                "user_id": getattr(getattr(request, "user", None), "id", None),
            },
        )
        return response
