from piccolo.table import Table
from piccolo import columns


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


class Image(Table):
    link = columns.Text(null=False, required=True, primary_key=True)
    ocr = columns.Text(null=True)
    height = columns.Integer(null=True)
    width = columns.Integer(null=True)
    file_path = columns.Text(null=True)
    order = columns.Integer(null=False, required=True)
    comic = columns.ForeignKey(Comic)


class Tag(Table):
    id = columns.Integer(null=False, required=True, primary_key=True)
    name = columns.Text(null=False, required=True)
    description = columns.Text(null=True)
    comics = columns.M2M(
        columns.LazyTableReference("ComicSeriesTag", module_path=__name__)
    )


class ComicSeriesTag(Table):
    tag = columns.ForeignKey(Tag)
    comic_series = columns.ForeignKey(ComicSeries)
