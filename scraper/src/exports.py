from .schema.tables import ComicSeries
from .storage_service import storage
import json


async def export_series_id_json():
    series_ids = await ComicSeries.select(ComicSeries.id)
    series_ids = [row["id"] for row in series_ids]
    json_with_ids = json.dumps(series_ids)
    await storage.put_object("ids.json", json_with_ids)
