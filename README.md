# Card Draw App

A simple card drawing application that runs directly in your web browser. Click to flip a random card, drag to dismiss.

## How to Add or Change Cards

### 1. Adding Card Images

Put your card image files in the `cards/` folder:

```
cards/
  ├── card1.jpg
  ├── card2.png
  ├── card3.jpg
  └── back.png  (this is your card back image)
```

**Supported formats:** `.jpg`, `.jpeg`, `.png`, `.webp`

### 2. Updating the Card List

Open `cards.js` in a text editor and update the `cards` array:

```javascript
export const cardData = {
  width: 700,
  height: 1840,
  cards: [
    "./cards/card1.jpg",
    "./cards/card2.png",
    "./cards/card3.jpg",
    // Add more cards here...
  ],
  back: "./cards/back.png"
};
```

**Important:** 
- Each path must start with `"./cards/"`
- Each line must end with a comma (except the last one)
- Put quotes around each path
- Match the exact filename (including `.jpg` or `.png`)

### 3. Changing Card Size

If your cards are a different size, update the `width` and `height`:

```javascript
width: 700,    // Your card width in pixels
height: 1840,  // Your card height in pixels
```

The app will automatically scale them to fit the screen while keeping the correct proportions.

### 4. Changing the Card Back

Replace `cards/back.png` with your own card back image, or update the path in `cards.js`:

```javascript
back: "./cards/my-custom-back.jpg"
```

## Running the App

open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge).



