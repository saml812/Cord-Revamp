import type { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  headerLeft?: ReactNode;
  headerRight?: ReactNode;
};

export default function AdminCard({
  title,
  children,
  className = "",
  contentClassName = "",
  headerLeft,
  headerRight,
}: Props) {
  return (
    <div className={`p-4 rounded-xl bg-base-100 border border-base-300 ${className}`}>
      <div className="flex items-center justify-between gap-2 sm:gap-3 mb-3 min-w-0">
        <div className="flex items-center gap-1 min-w-0 flex-1">
          {headerLeft}
          <div className="font-semibold truncate">{title}</div>
        </div>
        {headerRight ? <div className="shrink-0">{headerRight}</div> : null}
      </div>
      <div className={contentClassName}>{children}</div>
    </div>
  );
}
