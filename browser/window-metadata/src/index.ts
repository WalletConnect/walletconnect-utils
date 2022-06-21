import {
  getDocumentOrThrow,
  getLocationOrThrow,
} from "@walletconnect/window-getters";

export interface IWebsiteMetadata {
  description: string;
  url: string;
  icons: string[];
  name: string;
}

export function getWindowMetadata(): IWebsiteMetadata | null {
  let doc: Document;
  let loc: Location;

  try {
    doc = getDocumentOrThrow();
    loc = getLocationOrThrow();
  } catch (e) {
    return null;
  }

  function getIcons(): string[] {
    const links: HTMLCollectionOf<HTMLLinkElement> = doc.getElementsByTagName(
      "link"
    );
    const icons: string[] = [];

    for (let i = 0; i < links.length; i++) {
      const link: HTMLLinkElement = links[i];

      const rel: string | null = link.getAttribute("rel");
      if (rel) {
        if (rel.toLowerCase().indexOf("icon") > -1) {
          const href: string | null = link.getAttribute("href");

          if (href) {
            if (
              href.toLowerCase().indexOf("https:") === -1 &&
              href.toLowerCase().indexOf("http:") === -1 &&
              href.indexOf("//") !== 0
            ) {
              let absoluteHref: string = loc.protocol + "//" + loc.host;

              if (href.indexOf("/") === 0) {
                absoluteHref += href;
              } else {
                const path: string[] = loc.pathname.split("/");
                path.pop();
                const finalPath: string = path.join("/");
                absoluteHref += finalPath + "/" + href;
              }

              icons.push(absoluteHref);
            } else if (href.indexOf("//") === 0) {
              const absoluteUrl: string = loc.protocol + href;

              icons.push(absoluteUrl);
            } else {
              icons.push(href);
            }
          }
        }
      }
    }

    return icons;
  }

  function getWindowMetadataOfAny(...args: string[]): string {
    const metaTags: HTMLCollectionOf<HTMLMetaElement> = doc.getElementsByTagName(
      "meta"
    );

    for (let i = 0; i < metaTags.length; i++) {
      const tag: HTMLMetaElement = metaTags[i];
      const attributes: Array<string | null> = ["itemprop", "property", "name"]
        .map((target: string) => tag.getAttribute(target))
        .filter((attr: string | null) => {
          if (attr) {
            return args.includes(attr);
          }
          return false;
        });

      if (attributes.length && attributes) {
        const content: string | null = tag.getAttribute("content");
        if (content) {
          return content;
        }
      }
    }

    return "";
  }

  function getName(): string {
    let name: string = getWindowMetadataOfAny(
      "name",
      "og:site_name",
      "og:title",
      "twitter:title"
    );

    if (!name) {
      name = doc.title;
    }

    return name;
  }

  function getDescription(): string {
    const description: string = getWindowMetadataOfAny(
      "description",
      "og:description",
      "twitter:description",
      "keywords"
    );

    return description;
  }

  const name: string = getName();
  const description: string = getDescription();
  const url: string = loc.origin;
  const icons: string[] = getIcons();

  const meta: IWebsiteMetadata = {
    description,
    url,
    icons,
    name,
  };

  return meta;
}
