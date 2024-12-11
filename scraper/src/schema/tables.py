from piccolo.table import Table
from piccolo import columns

    

class ComicSeries(Table):
    id = columns.Text(nullable=False, required=True, primary_key=True)
    title = columns.Text(nullable=False, required=True)
    tags = columns.M2M(columns.LazyTableReference("Tag", module_path=__name__))

class Comic(Table):
    id = columns.Text(nullable=False, required=True, primary_key=True)
    title = columns.Text(nullable=False, required=True)
    upvotes = columns.Integer(nullable=False, required=True)
    link = columns.Text(nullable=False, required=True)
    uploaded_at = columns.Timestamptz(nullable=False, required=True)
    series = columns.ForeignKey(references=ComicSeries)

class Image(Table):
    link = columns.Text(nullable=False, required=True, primary_key=True)
    ocr = columns.Text(nullable=True)
    height = columns.Integer(nullable=True)
    width = columns.Integer(nullable=True)
    file_path = columns.Text(nullable=True)
    order = columns.Integer(nullable=False, required=True)
    comic = columns.ForeignKey(Comic)

class Tag(Table):
    id = columns.Integer(nullable=False, required=True, primary_key=True)
    name = columns.Text(nullable=False, required=True)
    description = columns.Text(nullable=True)
    comics = columns.M2M(columns.LazyTableReference("ComicSeriesTag", module_path=__name__))

class ComicSeriesTag(Table):
    tag = columns.ForeignKey(Tag)
    comic_series = columns.ForeignKey(ComicSeries)
