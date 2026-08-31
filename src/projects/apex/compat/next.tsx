import React from 'react';
import { Link as RouterLink, useLocation, useNavigate, useSearchParams as useRouterSearchParams } from 'react-router-dom';

const APEX_BASE = '/work/apex';

export type Metadata = Record<string, any>;

export const normalizeApexHref = (href: string): string => {
  if (!href) return APEX_BASE;
  if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return href;
  }
  if (href.startsWith('/work/apex')) {
    return href;
  }
  if (href === '/') {
    return APEX_BASE;
  }
  if (href.startsWith('/')) {
    return `${APEX_BASE}${href}`;
  }
  return `${APEX_BASE}/${href}`;
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

export default Link;

export const usePathname = () => {
  const location = useLocation();
  const path = location.pathname.replace(/^\/work\/apex/, '') || '/';
  return path;
};

export const useRouter = () => {
  const navigate = useNavigate();
  return {
    push: (href: string) => navigate(normalizeApexHref(href)),
    replace: (href: string) => navigate(normalizeApexHref(href), { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
  };
};

export const useSearchParams = () => useRouterSearchParams()[0];

export const notFound = () => {
  return null;
};

export const Image: React.FC<React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }> = ({
  src,
  alt = '',
  fill,
  priority,
  ...props
}) => {
  return <img src={src} alt={alt} {...props} />;
};
