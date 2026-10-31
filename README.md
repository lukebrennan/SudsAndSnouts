# Suds & Snouts Dog Grooming

The website for Suds & Snouts, a one-to-one dog grooming salon in Naas, Co. Kildare.

A plain static site (HTML, CSS and a little JavaScript) hosted on GitHub Pages from the `main` branch.

## Before launch: things to change

The phone number and email on the site are **placeholders**:

- Phone: `045 555 0123`
- Email: `hello@sudsandsnouts.ie`

To change them, edit the `SITE` block at the top of `js/main.js` **and** search `index.html` for `555 0123`, `+353455550123` and `hello@sudsandsnouts.ie` (the HTML copies make sure the details show even without JavaScript).

To use an online booking system (for example Goldie or MoeGo), put its link in `bookingUrl` in `js/main.js`. Until then, the main "Book a groom" button calls the salon.

Also worth doing before launch:

- Add the street address to the "Find us" section and the structured data in `index.html` once it's confirmed.
- Swap the illustrative dog photos in `assets/img/` for real Snout Shots (keep the same file names and sizes, or update `index.html`). Then remove the "Illustrative photo" captions.
- Check that the @sudsandsnouts Instagram, Facebook and TikTok handles are yours, or update the footer links.

## Structure

- `index.html`: the whole page
- `css/styles.css`: styles, built on the brand kit's colour and type tokens
- `js/main.js`: salon details, menu, header, FAQ and animations (respects reduced-motion settings)
- `assets/brand/`: logos, pattern and favicons from the brand kit
- `assets/fonts/`: Fredoka and Nunito (SIL Open Font License)
- `assets/icons/phosphor-bold/`: Phosphor icons (MIT License)
- `assets/img/`: illustrative dog photos from Unsplash (Unsplash License)

## Photo credits

Photos from Unsplash: Karsten Winegeart, Hayffield L, Brooke Cagle, Edson Torres, Reba Spike, benjamin lehman, Nick Fewings and Roberto Nickson.

## Preview locally

```
python3 -m http.server 8080
```

Then open http://localhost:8080.
