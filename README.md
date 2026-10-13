# Rangtuli Tours & Travels — Website Starter

A premium, modern, minimal, mobile-friendly static website for Rangtuli Tours & Travels.

## First: update contact details

1. Open `js/config.js`.
2. Replace `8801XXXXXXXXX` with the official WhatsApp number including Bangladesh country code `880`, without `+`, spaces or hyphens.
3. Replace `https://www.facebook.com/YOUR_PAGE` with the real official Facebook Page URL.
4. Save the file.

If these values are not updated, booking buttons will show a reminder instead of sending visitors to an incorrect contact.

## Publish with GitHub and Cloudflare Pages

### A. Upload the files to GitHub

1. Sign in to https://github.com
2. Open https://github.com/new
3. Repository name: `rangtuli-tours-travels`
4. Choose **Public** (or Private if preferred); leave **Add a README** unchecked because one is included.
5. Create the repository.
6. On the repository page, choose **Add file → Upload files**.
7. Extract this ZIP on your computer first. Upload the *contents* of the `rangtuli-tours-travels` folder, not the outer folder itself.
8. Click **Commit changes**.

### B. Deploy to Cloudflare Pages

1. Sign in at https://dash.cloudflare.com
2. Go to **Workers & Pages** (sometimes shown as **Compute → Workers & Pages**).
3. Choose **Create application** / **Create** and select **Pages**.
4. Select **Connect to Git** and authorize GitHub.
5. Choose `rangtuli-tours-travels`.
6. Set production branch to `main`.
7. Framework preset: **None**.
8. Build command: leave blank.
9. Build output directory: `/` or `.` depending on the form; this project has `index.html` in the repository root.
10. Deploy.

Cloudflare will provide a `*.pages.dev` preview address. Test that first.

## Add the custom domain later

When the transfer is completed and you have the required DNS/domain control, open your Pages project → **Custom domains** → **Set up a custom domain**. Follow the exact DNS instructions Cloudflare displays. Do not change nameservers or delete DNS records blindly, especially if the domain is used for email or another website.

## Design notes

- Brand palette: Forest Green `#123B2B`, Lime `#C1E96B`, White `#FFFFFF`, Cream `#F7F5EA`.
- Slogan: “যেখানে পথ, সেখানেই গল্প।”
- Destination photography currently uses remote Unsplash image URLs as visual placeholders. Replace them with approved real Rangtuli trip photos before the public launch.
- No package prices, dates, testimonials, or claims are invented. Add confirmed information before publishing.
- This is a static portfolio and direct-contact site. It does not take payments or store bookings.
