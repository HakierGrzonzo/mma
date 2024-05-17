def split_into_sentences(text: str):
    accumulator = ""
    separators = ".!?"
    for letter in text:
        accumulator += letter
        if letter in separators:
            yield accumulator.strip()
            accumulator = ""
    if len(accumulator) > 0:
        yield accumulator


def make_first_letter_uppercase(text: str):
    return text[0].upper() + text[1:]


rules = {
    "i": "I",
    "luz": "Luz",
    "amity": "Amity",
    "matt": "Matt",
    "skara": "Sakra",
    "sakra": "Sakra",
    "ayzee": "Ayzee",
    "belos": "Belos",
    "willow": "Willow",
}


def fixup_individual_words(sentence: str):
    words = sentence.split(" ")
    words = [rules.get(word, word) for word in words]
    return " ".join(words)


def correct_casing(original: str) -> str:
    sentences = split_into_sentences(original)
    sentences = [make_first_letter_uppercase(s) for s in sentences]
    sentences = [fixup_individual_words(s) for s in sentences]

    return " ".join(sentences)
