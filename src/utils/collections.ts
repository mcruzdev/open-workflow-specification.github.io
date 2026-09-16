import { getCollection } from "astro:content";

export const getSortedBlogPosts = async () =>
  (await getCollection('blog'))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    ;

// Docs are grouped by language (the first segment of the entry id, e.g. `java/...`)
// and ordered within each language by their `order` frontmatter, then title.
export const getSortedDocs = async () =>
  (await getCollection('docs'))
    .sort((a, b) =>
      a.data.order - b.data.order || a.data.title.localeCompare(b.data.title)
    );

export const getDocLanguage = (id: string) => id.split('/')[0];