import language_tool_python

lang_tool = language_tool_python.LanguageTool("en-US")


def correct_line(original_line: str) -> str:
    matches = lang_tool.check(original_line)
    return language_tool_python.utils.correct(original_line, matches)
