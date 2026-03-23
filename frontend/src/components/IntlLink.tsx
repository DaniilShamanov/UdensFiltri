import { Link } from "@/navigation";
import React from "react";

export const IntlLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<typeof Link>
>((props, ref) => <Link {...props} ref={ref} />);

IntlLink.displayName = "IntlLink";