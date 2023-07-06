# H5P Editor Keyword Extractor
The purpose of this widget is to create the list of keywords. This widget allows
users to generate keywords from the text block and allow to add custom keywords
as well.

## Getting started

Grab all the modules:

```bash
npm install
```

Build project:

```bash
npm run build
```

Development mode and watch

```bash
npm run watch
```

## Example of usage
You can add the keyword extractor widget to a `Group` field in semantics.json like
so:
```
  "name": "keywordExtractorGroup",
  "label": "Keyword extractor",
  "type": "group",
  "widget": "KeywordExtractor",
  "keywordExtractor": {
    "buttons": {
      "contentText": "extractKeywords",
      "customKeywords": "parseKeywordsComma"
    },
    "keywords": "keywords"
  },
```
Here,
- the widget is added by `"widget": "KeywordExtractor"` (you need to add the
widget as a library dependency as well, of course),
- one button to perform slightly intelligent keyword extraction from a text in a
`Text` field (optionally using a `Textarea` widget) is set to be the field with
the name `contentText`,
- one button to perform simple keyword extraction from a comma separated list of
keywords in a `Text` field is set to be the field with the name
`customKeywords`,
- the `Text` field that is supposed store the keywords is set to be field with
the name `keywords`.

A complete `Group` field could look like this in `semantics.json`:
```
{
  "name": "keywordExtractorGroup",
  "label": "Keyword extractor",
  "type": "group",
  "importance": "low",
  "expanded": true,
  "widget": "KeywordExtractor",
  "keywordExtractor": {
    "buttons": {
      "contentText": "extractKeywords",
      "customKeywords": "parseKeywordsComma"
    },
    "keywords": "keywords"
  },
  "fields": [
    {
      "name": "contentText",
      "label": "Content",
      "description": "Reference text block for users.",
      "type": "text",
      "importance": "medium",
      "optional": true,
      "widget": "textarea"
    },
    {
      "name": "customKeywords",
      "description": "Add custom keywords of your choice, separated by comma.",
      "type": "text",
      "label": "Add keywords",
      "importance": "low",
      "optional": true
    },
    {
      "name": "keywords",
      "description": "Below listed keywords will available for users.",
      "label": "Keywords",
      "type": "text",
      "importance": "medium",
      "optional": true,
      "maxLength": 5000
    }
  ]
}
```
