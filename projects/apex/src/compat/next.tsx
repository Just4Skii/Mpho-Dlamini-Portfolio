import React from 'react';
import { Link as RouterLink, useLocation, useNavigate, useSearchParams as useRouterSearchParams } from 'react-router-dom';

export type Metadata = Record<string, any>;

export const normalizeApexHref = (href: string): string => {
  if (!href || href === '/') return '/';
  if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return href;
  }
  if (href.startsWith('/work/apex/')) {
    return href.slice('/work/apex'.length) || '/';
  }
  if (href === '/work/apex') {
    return '/';
  }
  return href.startsWith('/') ? href : `/${href}`;
};

export const Link: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement> & { href?: string; to?: string }> = ({
  href,
  to,
  children,
  ...props
}) => {
  const target = href || to || '/';
  const isExternal = target.startsWith('http://') || target.startsWith('https://') || target.startsWith('mailto:') || target.startsWith('tel:');

  if (isExternal) {
    return (
      <a href={target} {...props}>
        {children}
      </a>
    );
  }

  return (
    <RouterLink to={normalizeApexHref(target)} {...props}>
      {children}
    </RouterLink>
  );
};

export function useRouter() {
  const navigate = useNavigate();
  const location = useLocation();

  return {
    push: (url: string) => navigate(normalizeApexHref(url)),
    replace: (url: string) => navigate(normalizeApexHref(url), { replace: true }),
    back: () => navigate(-1),
    pathname: location.pathname,
  };
}

export function usePathname() {
  const location = useLocation();
  return location.pathname;
}

export function useSearchParams() {
  const [searchParams] = useRouterSearchParams();
  return searchParams;
}

export function notFound() {
  return null;
}

export default Link;
