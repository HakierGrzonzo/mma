import asyncio
from datetime import timedelta
from sys import argv


from src import tagger, tumblr
from src.api import get_one_comic
from src.reduce import reduce_submissions_to_series
from src.schema.tables import ComicSeries
from . import main
from .trigger_frontend_regen import trigger_frontend_regen


async def run():
    if "tag" in argv:
        await tagger.add_tags_to_series()
        return
    if "tumblr" in argv:
        luzifer_au = ComicSeries.objects().where(ComicSeries.id == "Luzifer AU").first()
        assert luzifer_au is not None
        await tumblr.try_correlate_alternative_timelines(await luzifer_au)
        return
    if "reddit" in argv:
        submission = get_one_comic(argv[-1])
        await reduce_submissions_to_series([submission])
        await main()
        return
    if "review_tags" in argv:
        await tagger.review_tags()
        return
    if "deploy" in argv:
        trigger_frontend_regen()
        return
    ten_minutes = timedelta(minutes=10)
    async with asyncio.timeout(ten_minutes.total_seconds()):
        await main()


asyncio.run(run())
