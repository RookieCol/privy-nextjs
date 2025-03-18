export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL;

  const config = {
    "accountAssociation": {
      "header": "eyJmaWQiOjI2NDQzMywidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweENlMzNDMjYwQzZEYzY5N0Y1OWE4Mjg2ZjBFRTM1OGNBQjk5NjhFZWQifQ",
      "payload": "eyJkb21haW4iOiJmcnVpdC1uaW5qYS1mcmFtZXMtZGVtby52ZXJjZWwuYXBwIn0",
      "signature": "MHhhOTU2MjhmY2I2MzM0OTc0MjJhYzM4NmQxY2ExZmUxM2M4MTliODI0ODlkMTUzYmEyNzMyODRiOWRlNTllOWM0MWQxMzViMzY5ZDdjMmUwOGY4ZmNlYTNhYzAxZDE1YjljYzBjYjAyNjk3YTM4NmQyODA1MmJhOThiZGY5MDllZTFj"
    },
    "frame": {
      "version": "1",
      "name": "Fruit Ninja",
      "iconUrl": `${appUrl}/icon.png`,
      "homeUrl": `${appUrl}`,
      "imageUrl": `${appUrl}/image.png`,
      "buttonTitle": "Check this out",
      "splashImageUrl": `${appUrl}/splash.png`,
      "splashBackgroundColor": "#eeccff",
      "webhookUrl": `${appUrl}/api/webhook`
    }
  }

  return Response.json(config);
}
