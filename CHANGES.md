# Skerp Studio site: v7 changes

- Hero: reference layout (eagle on the right, reticle on the eye, embers), zoom into the eye, blackout, "Sharp eyes find the leak". Copy sits clear of the header at every size.
- Leak chapter takes over from the hero with no visible cut; eagle feathered in, first leak readable immediately.
- "Find the leak. Fix the flow." fades in place while the eagle holds; "Built to work" slides up over it.
- Work: right-to-left slideshow using full-page screenshots that scroll inside the frame (public/work/*-full.webp); small cards use the top of each page (public/work/*-top.webp). No live iframes.
- Automation: magnetic dot field with pointer light, larger Execute button that continues from where you are, explore mode with hover info boxes, "Run it again", soft blend into Impact.
- Impact: filler eagle removed; paid-ads eagle twice the size and sharper.
- Packages (landing): new pinned walkthrough in the site's own type, real logo, friendlier copy, Get quote (estimate preset per package) / See package buttons, bigger closing boxes, estimate back.
- New pages: /packages (all packages, anchors #package-start etc.), /start (free leak scan, audit, call, contact, FAQ), /about (draft copy).
- Every calculator and form opens as a popup on any page (components/ModalHost.tsx). Hashes #estimate, #scan, #contact, #call, #time-calculator, #ads-calculator open them too.
- Email calvinmarais@gmail.com everywhere; domain www.skerpstudio.com; share image and logo favicon restored.
- Normal multi-file build instead of one 2.5 MB HTML file.

## v7.1
- Work: big previews are now sharp landing-page images (public/images/work/<id>-full.webp). Drop in your own landing screenshots with the same names (16:10, 1600px+ wide). Visit buttons go to the live sites.
- Automation: Execute turns into Cancel while running. "AUTOMATED." flies away; the workflow stays with a panel (bottom right) explaining what the automation does; hovering a step shows that step there instead.
- /automation page now includes the time-saved sequence.
- Own pages for every nav item: /work, /automation, /impact, /packages, /marketing, /estimate, /about. All pages share the main header with the current page highlighted.
- About copy: Skerp works with businesses of every size, at home and abroad.

## v7.2 (publish build)
- Leak eagle (and leak lines) are centred with flex instead of translate %, so on a first visit with slow images the eagle still starts in the middle behind "Sharp eyes".
- Work: new landing screenshots, no zoom on them (crisp). The /work page opens on the stacked deck with the logo, plays a short intro, and fans out on scroll.
- /automation ends with Skerp Business and Skerp Custom pricing side by side (Get quote / See package / full package link).
- About: logo centred in the right half. Start: the WhatsApp line sits together on its own line.
