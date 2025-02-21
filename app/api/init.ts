import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("request");
  const response = await fetch(`${process.env.API_URL}/init`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: req.body,
  });

  const data = await response.json();
  res.status(response.status).json(data);
}
