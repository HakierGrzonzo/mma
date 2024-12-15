from datetime import datetime
from piccolo.table import Table
from piccolo import columns
from ..storage_service import storage


class ComicSeries(Table):
    id = columns.Text(null=False, required=True, primary_key=True)
    title = columns.Text(null=False, required=True)
    tags = columns.M2M(columns.LazyTableReference("Tag", module_path=__name__))


class Comic(Table):
    id = columns.Text(null=False, required=True, primary_key=True)
    title = columns.Text(null=False, required=True)
    upvotes = columns.Integer(null=False, required=True)
    link = columns.Text(null=False, required=True)
    uploaded_at = columns.Timestamptz(null=False, required=True)
    series = columns.ForeignKey(references=ComicSeries)
    prefix = columns.Text(null=False, required=True)


class Image(Table):
    link = columns.Text(null=False, required=True, primary_key=True)
    ocr = columns.Text(null=True)
    height = columns.Integer(null=True)
    width = columns.Integer(null=True)
    file_path = columns.Text(null=True)
    order = columns.Integer(null=False, required=True)
    comic = columns.ForeignKey(Comic)

    def is_measured(self):
        return self.height is not None and self.width is not None

    def is_ocr(self):
        return self.ocr is not None

    async def is_downloaded(self):
        return self.file_path is not None or (
            await storage.object_exists(self.file_path)
        )


class Tag(Table):
    id = columns.Integer(null=False, required=True, primary_key=True)
    name = columns.Text(null=False, required=True)
    description = columns.Text(null=True)
    comics = columns.M2M(
        columns.LazyTableReference("ComicSeriesTag", module_path=__name__)
    )

    @classmethod
    async def new(cls, name):
        now = datetime.now().timestamp()
        id = int(now)
        tag = cls(name=name, id=id)
        await cls.insert(tag)
        return tag


class ComicSeriesTag(Table):
    tag = columns.ForeignKey(Tag)
    comic_series = columns.ForeignKey(ComicSeries)