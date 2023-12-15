// @ts-nocheck Example Code uses next not in this project
import sendBedStatusUpdate from './sample-messenger-function';
import type { NextApiRequest, NextApiResponse } from 'next';

const table0116_cust = {
  Cleaning: 1,
  Clean: 2,
} as const;

interface BedStatusUpdateRequest extends NextApiRequest {
  body: {
    bed: string;
    status: keyof typeof table0116_cust;
    operator: string;
  };
}

const table0008 = {
  AA: 'Accepted',
  AE: 'Errored',
  AR: 'Rejected',
  CA: 'Commit Accepted',
  CE: 'Commit Errored',
  CR: 'Commit Rejected',
} as const;

type ResponseData = {
  ack: 'Unknown' | (typeof table0008)[keyof typeof table0008];
};

const handler = async (
  req: BedStatusUpdateRequest,
  res: NextApiResponse<ResponseData>,
) => {
  const { method } = req;

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
    return;
  }

  const { bed, status, operator } = await req.json();
  const mappedStatus = table0116_cust?.[status];

  // TODO: validate input

  const ackMsg = await sendBedStatusUpdate(bed, mappedStatus, operator);
  const ack = table008?.[ackMsg.get('MSA-1')] || 'Unknown';
  const message = ackMsg.get('MSA-3');

  res.status(200).json({ ack, message });
};

export default handler;
