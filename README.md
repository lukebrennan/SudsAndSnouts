# Suds & Snouts Dog Grooming

Website for Suds & Snouts, a one-to-one dog grooming salon in Naas, Co. Kildare.

A plain static site (HTML, CSS and a little JavaScript), hosted on GitHub Pages from the `main` branch. No build step.

- Phone: 087 500 4500 (`tel:+353875004500`)
- Email: hello@sudsandsnouts.com

## Structure

| File | What it is |
| --- | --- |
| `index.html` | The whole home page: services, prices, Quiet Hour, booking, FAQ, contact. Includes the Schema.org structured data (LocalBusiness, WebSite, FAQPage). |
| `privacy.html` | Privacy policy (linked from the booking form). |
| `404.html` | "Page not found" page. |
| `css/styles.css` | All styles, built on the brand kit colours and fonts. |
| `js/main.js` | Open-now status, menu, booking form, FAQ. Salon settings are at the top. |
| `robots.txt`, `sitemap.xml`, `llms.txt`, `site.webmanifest` | SEO and discovery files. |
| `assets/` | Logos, fonts (Fredoka, Nunito), Phosphor icons, photos (JPG + WebP). |

## Connecting the booking form

The booking form validates everything, shows a live price estimate and a confirmation screen. To actually receive bookings, set `bookingEndpoint` at the top of `js/main.js` to any URL that accepts a JSON `POST` (for example a Formspree form, a Make/Zapier webhook, or your own API). Each booking is sent like this:

```json
{
  "service": "Full Groom", "size": "Medium", "addons": ["Teeth brushing"], "estimatedPrice": "€66",
  "date": "2026-11-17", "time": "10:00", "quietHour": false,
  "dogName": "Biscuit", "breed": "Cockapoo", "ownerName": "Aoife Byrne",
  "phone": "087 123 4567", "email": "aoife@example.ie", "notes": "", "newClient": true,
  "submittedAt": "2026-11-01T20:00:00.000Z"
}
```

Slot times, opening hours and prices are in `HOURS`, `SLOTS` and `PRICES` in the same file. Until real availability is connected, some slots are shown as already booked so the diary looks natural (`isTaken` in `js/main.js`). Swap that function for a call to your booking system when it's ready.

## Moving to your own domain

The site currently lives at `https://lukebrennan.github.io/SudsAndSnouts/`. When you connect the domain:

1. Add the domain in the repo's **Settings → Pages → Custom domain** (this creates a `CNAME` file).
2. Find and replace `https://lukebrennan.github.io/SudsAndSnouts/` with your new address (for example `https://www.sudsandsnouts.com/`) in: `index.html`, `privacy.html`, `sitemap.xml`, `robots.txt`, `llms.txt`.
3. In `404.html`, change `<base href="/SudsAndSnouts/">` to `<base href="/">`.
4. Submit `sitemap.xml` in Google Search Console and Bing Webmaster Tools.

## Before launch: still to do

- Add the street address and Eircode to the contact section, `llms.txt` and the structured data (`address` in `index.html`), then create a Google Business Profile with the same name, phone and hours.
- Swap the stock dog photos in `assets/img/` for your own Snout Shots (keep the file names, or update `index.html`). Re-export a `.webp` copy of each.
- Check the @sudsandsnouts Instagram, Facebook and TikTok links point to your accounts.

## Photo credits

Photos from Unsplash (Unsplash License): Karsten Winegeart, Hayffield L, Brooke Cagle, Edson Torres, Reba Spike, benjamin lehman, Nick Fewings, Roberto Nickson, Anthony Duran, Ayla Verschueren and Grace Brauteseth.

## Preview locally

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080.
