export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL;

  const config = {
    accountAssociation: {
      header:
        "eyJmaWQiOjE4ODkyNiwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDU0MzJDMTZiMzg2M0IyNDA1MkY1NGEwOTUyNjI0NzMzNEZFY0ZDZjcifQ",
      payload: "eyJkb21haW4iOiJwcml2eS1mcmFtZXMtdjItZGVtby52ZXJjZWwuYXBwIn0",
      signature:
        "MHgxZGU0ZTU0ZmVlZmE0YzIwNWUzODk5NDlhZmEyNDFmOWUyYWEyN2QzZWM4MTJlNzkyZTI3NmI1Mjg2MWRlNjk2MjJhOTQzYjA3MGM2NmZiNDhkYzA5YWYxMTc0MzYxM2U1ODg2ZjcwYzQwNWIyOTM1ZTUxYWY2YTRmYmM4MTViNjFj",
    },
    frame: {
      version: "1",
      name: "Privy Frames V2 Demo",
      iconUrl: `${appUrl}/icon.png`,
      homeUrl: `${appUrl}`,
      imageUrl: `${appUrl}/icon.png`,
      buttonTitle: "FRUIT NINJA →",
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#f7f7f7",
    },
  };

  return Response.json(config);
}
