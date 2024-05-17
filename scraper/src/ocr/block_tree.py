from typing import Dict, List, Self


def indent(string: str):
    return "\t" + string.replace("\n", "\n\t")


class Node:
    def __init__(self, raw_block: Dict, id_to_block) -> None:
        self.id = raw_block["Id"]
        self.type = raw_block["BlockType"]
        self.text = raw_block.get("Text")
        self.children: List[Node] = []

        for relationship in raw_block.get("Relationships", []):
            if relationship["Type"] != "CHILD":
                continue
            for id in relationship["Ids"]:
                self.children.append(Node(id_to_block[id], id_to_block))

    def get_text(self) -> str:
        if self.type == "LINE":
            return (self.text or "").lower()
        elif self.type == "LAYOUT_FIGURE":
            return " ".join(child.get_text() for child in self.children)
        elif self.type == "PAGE":
            return "\n".join(
                child.get_text()
                for child in self.children
                if child.type == "LAYOUT_FIGURE"
            )
        else:
            return ""

    def __str__(self) -> str:
        if len(self.children) == 0:
            return f"<{self.type} text={self.text}/>"
        indented_children = indent("\n".join([str(v) for v in self.children]))
        return f"<{self.type} text={self.text}>\n{indented_children}\n</{self.type}>"
