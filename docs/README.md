# Project website

GitHub Pages serves this `docs/` directory. Commit and push to `main` to deploy automatically.

## CAD file

The **CAD File** button in the top action bar opens the supplied [Onshape document](https://cad.onshape.com/documents/45da8d6fb973907a2212627a/w/8daeebbf65aadcc1a048f33e/e/8cd29781b890ea344931dde4) in a separate tab. Access follows the document's Onshape sharing settings. The website has no embedded CAD or 3D model section.

## Add media

Save a demonstration video as `docs/assets/demo.mp4` (WebM is also supported), then set `video.src` in `docs/content.json`. An external HTTPS URL also works. Set `video.poster` to an optional thumbnail and `video.caption` to its caption.

Save a paper as `docs/assets/paper.pdf` and set `paper.url` to `assets/paper.pdf` to show the Read paper button. Additional resource links can be added to the `resources` array with `title` and `url` fields.

Empty media URLs preserve placeholders. Local video previews stay in the browser and are not published.

For local preview, run `python3 -m http.server 8000 --directory docs` from the repository root and visit http://localhost:8000 .
