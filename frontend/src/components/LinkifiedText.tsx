import type { ReactNode } from "react";

type LinkifiedTextProps = {
  text: string;
  className?: string;
  linkClassName?: string;
};

const URL_REGEX = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;

function toHref(url: string) {
  return url.startsWith("www.") ? `https://${url}` : url;
}

function trimTrailingPunctuation(url: string) {
  const trailingMatch = url.match(/[.,;:!?)]+$/);
  if (!trailingMatch) return { href: url, display: url, trailing: "" };
  const trailing = trailingMatch[0];
  const core = url.slice(0, -trailing.length);
  return { href: core, display: core, trailing };
}

export default function LinkifiedText({ text, className = "", linkClassName = "" }: LinkifiedTextProps) {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(URL_REGEX)) {
    const rawUrl = match[0];
    const index = match.index ?? 0;

    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }

    const { href, display, trailing } = trimTrailingPunctuation(rawUrl);

    parts.push(
      <a
        key={`${index}-${href}`}
        href={toHref(href)}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClassName}
      >
        {display}
      </a>
    );

    if (trailing) parts.push(trailing);

    lastIndex = index + rawUrl.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <p className={className}>{parts.length > 0 ? parts : text}</p>;
}
