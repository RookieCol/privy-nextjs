export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL;

  const config = {}

  return Response.json(config);
}
