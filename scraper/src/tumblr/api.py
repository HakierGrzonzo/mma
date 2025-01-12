from logging import getLogger
import httpx
from ..api import USER_AGENT
from os import environ

logger = getLogger(__name__)

http_transport = httpx.AsyncHTTPTransport(retries=5, http2=True, http1=True)
http_client = httpx.AsyncClient(
    headers={"User-Agent": USER_AGENT}, timeout=30, transport=http_transport
)

TUMBLR_API_KEY = environ.get("TUMBLR_API_KEY")
if TUMBLR_API_KEY is None:
    logger.error("TUMBLR_API_KEY is missing!")


class TumblrApi:
    root_url = "https://api.tumblr.com/v2/blog/moringmark"

    async def _query(
        self, operation: str, query_params: dict[str, str | int] = {}
    ) -> dict:
        params = {"api_key": TUMBLR_API_KEY, **query_params}
        param_string = "&".join([f"{key}={value}" for key, value in params.items()])
        result = await http_client.get(f"{self.root_url}/{operation}?{param_string}")
        return result.json()

    async def get_posts(self):
        offset = 0
        while True:
            response = await self._query("posts", {"offset": offset})
            response_posts = response["response"]["posts"]
            if len(response_posts) == 0:
                break
            offset += len(response_posts)
            for post in response_posts:
                yield post
