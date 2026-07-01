# SEO ACTION PLAN — WAHAJ (وهاج)

**Priority Legend:** 🔴 Immediate | ⚠️ This Month | ✅ Completed | ℹ️ Future

---

## ✅ COMPLETED — All Changes Applied

### Technical Foundation
| Task | Status | Effort |
|------|--------|--------|
| robots.txt cleanup (remove AI bot blocking) | ✅ Done | 5 min |
| sitemap with real Firestore timestamps | ✅ Done | 15 min |
| Security headers (XFO, XCTO, Referrer-Policy) | ✅ Done | 10 min |
| metadataBase + canonical on all pages | ✅ Done | 30 min |
| Custom 404 page with helpful links | ✅ Done | 20 min |

### Metadata
| Task | Status | Effort |
|------|--------|--------|
| Unique title on all 11 public pages | ✅ Done | 15 min |
| Description (140-160 chars) on all pages | ✅ Done | 15 min |
| Keywords on all pages | ✅ Done | 10 min |
| OG/Twitter Card on all pages | ✅ Done | 20 min |
| Fix homepage title duplication | ✅ Done | 2 min |

### Structured Data
| Task | Status | Effort |
|------|--------|--------|
| Organization schema enhanced (sameAs, areaServed) | ✅ Done | 5 min |
| WebPage schema on homepage | ✅ Done | 5 min |
| AboutPage schema on /about | ✅ Done | 5 min |
| FAQPage schema on /faq | ✅ Done | 5 min |
| WebPage + BreadcrumbList on policy pages | ✅ Done | 15 min |
| Product JSON-LD with full metadata | ✅ Done | (already present) |

### PWA & Icons
| Task | Status | Effort |
|------|--------|--------|
| SVG favicon | ✅ Done | 5 min |
| ICO favicon | ✅ Done | 2 min |
| manifest.json | ✅ Done | 10 min |
| Icons metadata in layout | ✅ Done | 5 min |
| application-name + apple-mobile-web-app meta | ✅ Done | 5 min |

### Performance & Images
| Task | Status | Effort |
|------|--------|--------|
| fetchPriority="high" on product hero | ✅ Done | 2 min |
| Lazy loading on below-fold images | ✅ Done | 5 min |
| ImageKit CDN optimization (already configured) | ✅ Done | — |
| optimizePackageImports | ✅ Done | (already configured) |

### Accessibility
| Task | Status | Effort |
|------|--------|--------|
| aria-label on search input | ✅ Done | 2 min |
| aria-label on footer nav sections | ✅ Done | 5 min |
| role="contentinfo" on footer | ✅ Done | 2 min |

### Code Quality
| Task | Status | Effort |
|------|--------|--------|
| TypeScript: Add createdAt/updatedAt to Product | ✅ Done | 10 min |
| TypeScript strict mode (already enabled) | ✅ Done | — |
| Production build passing | ✅ Done | — |

---

## ℹ️ REMAINING RECOMMENDATIONS (External/Business Owner)

### Content Quality
| Task | Priority | Notes |
|------|----------|-------|
| Expand product descriptions (100-200 chars) | ⚠️ Medium | Requires CMS update — each product in Firestore |
| Write 200-400 word SEO content for collections | ⚠️ Medium | Editorial content — managed via Firestore |
| Write 250-500 word SEO content for categories | ℹ️ Low | Same as above |
| Add blog/articles if relevant | ℹ️ Low | New feature — not in current scope |

### External Services
| Task | Priority | Notes |
|------|----------|-------|
| Google Search Console verification | ⚠️ High | Add `verification` meta with your GSC code |
| Bing Webmaster Tools verification | ⚠️ Medium | Add `msvalidate.01` meta tag |
| Google Analytics / PostHog already configured | ✅ Done | — |
| PageSpeed Insights monitoring | ℹ️ Low | Run monthly to track CWV |

### Social Media
| Task | Priority | Notes |
|------|----------|-------|
| Add Instagram/TikTok/Facebook URLs to Organization schema | ⚠️ Medium | If WAHAJ has social accounts |
| Create branded OG image (1200x630) | ℹ️ Low | Currently using Unsplash fallback |

### Advanced
| Task | Priority | Notes |
|------|----------|-------|
| HSTS preload submission | ℹ️ Low | After confirming HTTPS works for all subdomains |
| Core Web Vitals monitoring | ⚠️ Medium | Use PageSpeed Insights + CrUX |
| Check for 404s with Google Search Console | ⚠️ Medium | After deployment |
| Dynamic OG image generation per product | ℹ️ Low | Currently uses product cover image — good enough |

---

## Implementation Summary

**Total files modified:** 19  
**Total files created:** 5  
**Build status:** ✅ Clean (no TypeScript errors, no build warnings)  
**Breaking changes:** None  
**Backward compatibility:** Fully preserved  
**Design changes:** None (beyond accessibility requirements)
